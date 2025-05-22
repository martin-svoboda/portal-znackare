<?php

namespace PortalZnackare\Functions;

class DbClient {
	public function __construct() {
		if ( isset( $_GET['test_api'] ) ) {
			echo '<pre>';
			if ( 'prikazy' === $_GET['test_api'] ) {
				print_r( $this->get_prikazy( 4133, 2025 ) );
			}
			if ( 'prikaz' === $_GET['test_api'] ) {
				print_r( $this->get_prikaz( $_GET['id'] ) );
			}
			die();
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
		return $this->conect( "trasy.PRIKAZY_SEZNAM", array( $int_adr, $year ) );
	}

	public function get_prikaz( $id ) {
		$result = $this->conect( "trasy.ZP_Detail", array( $id ), true );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return array(
			'head' => $result[0][0] ?? [],
			'data' => $result[1] ?? [],
		);
	}
}
