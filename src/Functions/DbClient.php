<?php

namespace PortalZnackare\Functions;

class DbClient {
	private $test_data = null;

	public function __construct() {
		if ( isset( $_GET['test_api'] ) ) {
			echo '<pre>';
			if ( 'prikazy' === $_GET['test_api'] ) {
				print_r( $this->get_prikazy( 4133, 2025 ) );
			}
			if ( 'prikaz' === $_GET['test_api'] ) {
				print_r( $this->get_prikaz( 4133, $_GET['id'] ) );
			}
			die();
		}

		if ( current_user_can( 'administrator' ) && isset( $_GET['download_test_data'] ) ) {
			$this->download_test_data();
		}
	}

	public function conect( $procedure, $args, $multiple = false ) {
		$db = new MssqlConnector();

		if ( $db->hasError() ) {
			return $db->getError();
		}

		if ( $multiple ) {
			$result = $db->callProcedureMultiple( $procedure, $args );
		} else {
			$result = $db->callProcedure( $procedure, $args );
		}

		$db->close();

		return $result;
	}

	public function login_user( string $email, string $hash ) {
		$result = $this->conect( "trasy.WEB_Login", array(
			'@Email'      => $email,
			'@WEBPwdHash' => $hash
		) );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		if ( isset( $result[0]['INT_ADR'] ) ) {
			return (int) $result[0]['INT_ADR'];
		}

		// Špatné přihlašovací údaje
		return new \WP_Error( 'login_error', 'Chyba přihlášení, zkontrolujte údaje a zkuste to znovu.', array() );
	}

	public function get_prikazy( $int_adr, $year ) {
		if ( $this->is_local() ) {
			$data = $this->get_test_data();
			return $data['prikazy'][ $year ] ?? [];
		}

		return $this->conect( "trasy.PRIKAZY_SEZNAM", array( $int_adr, $year ) );
	}

	public function get_prikaz( $int_adr, $id ) {
		if ( $this->is_local() ) {
			$data = $this->get_test_data();
			return $data['detaily'][ $id ] ?? new \WP_Error( 'missing_data', 'Chybí detail pro ID ' . $id );
		}

		$result = $this->conect( "trasy.ZP_Detail", array( $id ), true );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$head = $result[0][0] ?? [];

		if ( empty( $head ) ) {
			return new \WP_Error( 'missing_data', 'U tohoto příkazu se nenačetla žádná data.', [] );
		}

		// Hledání hodnoty INT_ADR v hlavičce
		$found = array_filter( array_keys( $head ), fn( $key ) => str_starts_with( $key, 'INT_ADR' ) );
		$match = false;

		foreach ( $found as $key ) {
			if ( (int) $head[ $key ] === (int) $int_adr ) {
				$match = true;
				break;
			}
		}

		if ( ! $match ) {
			return new \WP_Error( 'permission_denied', 'Tento příkaz vám nebyl přidělen a nemáte oprávnění k jeho nahlížení.', [] );
		}

		return [
			'head' => $head,
			'data' => $result[1] ?? [],
		];
	}

	private function download_test_data() {
		$prikazy = array(
			2024 => $this->get_prikazy( 4133, 2024 ),
			2025 => $this->get_prikazy( 4133, 2025 ),
		);
		$detaily = array();

		foreach ( $prikazy as $prikazy_rok ) {
			foreach ( $prikazy_rok as $prikaz ) {
				$id = $prikaz['ID_Znackarske_prikazy'] ?? null;
				if ( $id ) {
					$detaily[ $id ] = $this->get_prikaz( 4133, $id );
				}
			}
		}

		// save to file
		file_put_contents(
			__DIR__ . '/testdata.json',
			json_encode( [ 'prikazy' => $prikazy, 'detaily' => $detaily ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE )
		);
	}

	private function get_test_data() {
		if ( $this->test_data === null ) {
			$file = __DIR__ . '/testdata.json';
			if ( file_exists( $file ) ) {
				$this->test_data = json_decode( file_get_contents( $file ), true );
			} else {
				$this->test_data = [];
			}
		}
		return $this->test_data;
	}

	private function is_local() {
		if ( 'https://portalznackare.ddev.site' === get_site_url() ) {
			return true;
		}

		return false;
	}
}
