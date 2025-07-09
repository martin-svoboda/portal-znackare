<?php

namespace PortalZnackare\Api;

use PortalZnackare\Functions\DbClient;
use PortalZnackare\Managers\ApiManager;
use WP_Error;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

class InsysApi extends WP_REST_Controller {

	/**
	 * Construct
	 */
	public function __construct(
		private DbClient $client,
	) {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register the routes for the objects of the controller.
	 */
	public function register_routes() {
		register_rest_route(
			ApiManager::PATH,
			'login',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'login_user' ),
					'permission_callback' => array( $this, 'validate_nonce' ),
					'args'                => array(
						'email' => array(
							'required' => true,
						),
						'hash'  => array(
							'required' => true,
						),
					),
				),
			)
		);

		register_rest_route(
			ApiManager::PATH,
			'/user',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_user' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'int_adr' => array(
						'required' => true,
					),
				),
			)
		);

		register_rest_route(
			ApiManager::PATH,
			'/prikazy',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_prikazy' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'int_adr' => array(
						'required' => true,
					),
					'year'    => array(
						'required' => false,
						'default'  => intval( wp_date( 'Y' ) ),
					),
				),
			)
		);

		register_rest_route(
			ApiManager::PATH,
			'/prikaz',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_prikaz' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'int_adr' => array(
						'required' => true,
					),
					'id'      => array(
						'required' => true,
					),
				),
			)
		);

		register_rest_route(
			ApiManager::PATH,
			'/ceniky',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_ceniky' ),
				'permission_callback' => '__return_true',
			)
		);
	}

	public function validate_nonce() {
		$nonce = $_SERVER['HTTP_X_WP_NONCE'] ?? '';
		if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
			return new WP_Error(
				'rest_nonce_invalid',
				'Neplatný bezpečnostní token.',
				[ 'status' => 401 ]
			);
		}

		return true;
	}

	/**
	 * Přihásíme uživatele ověřením v INSYZ
	 *
	 * @param WP_REST_Request $request request data
	 *
	 * @return WP_error|WP_REST_Response
	 */
	public function login_user( $request ) {
		$response = $this->client->login_user( $request['email'], $request['hash'] );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		return rest_ensure_response( [ 'int_adr' => $response ] );
	}

	/**
	 * Získáme informace o uživateli z INSYZ
	 *
	 * @param WP_REST_Request $request request data
	 *
	 * @return WP_error|WP_REST_Response
	 */
	public function get_user( $request ) {
		$int_adr  = $request['int_adr'];
		$response = $this->client->get_user( $int_adr );

		return rest_ensure_response( $response );
	}

	/**
	 * Získáme příkazy uživatele z INSYZ
	 *
	 * @param WP_REST_Request $request request data
	 *
	 * @return WP_error|WP_REST_Response
	 */
	public function get_prikazy( $request ) {
		$int_adr  = $request['int_adr'];
		$year     = $request['year'];
		$response = $this->client->get_prikazy( $int_adr, $year );

		return rest_ensure_response( $response );
	}

	/**
	 * Získáme detail příkazu z INSYZ
	 *
	 * @param WP_REST_Request $request request data
	 *
	 * @return WP_error|WP_REST_Response
	 */
	public function get_prikaz( $request ) {
		$int_adr  = $request['int_adr'];
		$id       = $request['id'];
		$response = $this->client->get_prikaz( $int_adr, $id );

		return rest_ensure_response( $response );
	}

	public function get_ceniky( $request ) {
		$date = $request['date'];

		$response = array(
			'jizdne'        => 6,
			'jizdneZvysene' => 8,
			'tarifDobaOd1'  => 0,
			'tarifDobaDo1'  => 4,
			'tarifStravne1' => 0,
			'tarifNahrada1' => 0,
			'tarifDobaOd2'  => 4,
			'tarifDobaDo2'  => 5,
			'tarifStravne2' => 0,
			'tarifNahrada2' => 150,
			'tarifDobaOd3'  => 5,
			'tarifDobaDo3'  => 8,
			'tarifStravne3' => 160,
			'tarifNahrada3' => 150,
			'tarifDobaOd4'  => 8,
			'tarifDobaDo4'  => 12,
			'tarifStravne4' => 160,
			'tarifNahrada4' => 300,
			'tarifDobaOd5'  => 12,
			'tarifDobaDo5'  => 18,
			'tarifStravne5' => 250,
			'tarifNahrada5' => 300,
			'tarifDobaOd6'  => 18,
			'tarifDobaDo6'  => 24,
			'tarifStravne6' => 390,
			'tarifNahrada6' => 300,
		);

		return rest_ensure_response( $response );
	}

}
