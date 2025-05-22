<?php

namespace PortalZnackare\Api;

use PortalZnackare\Functions\DbClient;
use PortalZnackare\Repositories\MetodikaRepository;
use PortalZnackare\Taxonomies\MetodikaTaxonomy;
use WP_Error;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

class PortalApi extends WP_REST_Controller {
	/** @var string */
	public $namespace = 'portal/v1';

	/**
	 * Construct
	 */
	public function __construct(
		private DbClient $client,
		private MetodikaRepository $metodika_repository,
		private MetodikaTaxonomy $metodika_taxonomy
	) {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register the routes for the objects of the controller.
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
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
			$this->namespace,
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
			$this->namespace,
			'/prikaz',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_prikaz' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'id' => array(
						'required' => true,
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/post',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_post_data' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'slug' => array(
						'required' => true,
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/metodika',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_metodika_data' ),
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			$this->namespace,
			'/metodika-terms',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_metodika_terms' ),
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
		$id  = $request['id'];
		$response = $this->client->get_prikaz( $id );

		return rest_ensure_response( $response );
	}

	/**
	 * Získáme obsah a data stránky / postu
	 *
	 * @param WP_REST_Request $request request data
	 *
	 * @return WP_error|WP_REST_Response
	 */
	public function get_post_data( $request ) {
		$slug      = $request['slug'];
		$logged_in = $request['logged_in'] ?? false;
		$post      = [];

		if ( empty( $slug ) ) {
			$post = get_post( get_option( 'page_on_front' ) );
		} else {

			$args  = array(
				'name'           => $slug,
				'post_type'      => [ 'page', 'post' ],
				'post_status'    => 'publish',
				'posts_per_page' => 1
			);
			$posts = get_posts( $args );

			if ( empty( $posts ) ) {
				return rest_ensure_response( [] );
			}

			/** @var \WP_Post $post */
			$post = reset( $posts );
		}

		if ( empty( $post ) ) {
			return rest_ensure_response( [] );
		}

		$require_login = get_post_meta( $post->ID, 'require_login', true ) === '0';

		if ( $require_login && ! $logged_in ) {
			return rest_ensure_response( array(
				'require_login' => true,
			) );
		}

		setup_postdata( $post );

		// Spustit content (vygeneruje enqueue bloků)
		$content = apply_filters( 'the_content', $post->post_content );

		// Posbírat enqueued styly
		global $wp_styles;
		$styles = [];
		ob_start();

		foreach ( $wp_styles->queue as $handle ) {
			$style = $wp_styles->registered[ $handle ] ?? null;
			if ( $style && ! empty( $style->src ) ) {
				wp_styles()->do_item( $handle );
			}
		}

		$style_html = ob_get_clean();

		return rest_ensure_response( array(
			'id'             => $post->ID,
			'title'          => get_the_title( $post ),
			'content'        => $content,
			'type'           => $post->post_type,
			'slug'           => $post->post_name,
			'template'       => get_page_template_slug( $post->ID ),
			'date'           => get_the_date( '', $post ),
			'author'         => get_the_author_meta( 'display_name', $post->post_author ),
			'featured_image' => get_the_post_thumbnail_url( $post, 'large' ),
			'styles'         => $style_html,
		) );
	}

	public function get_metodika_data( $request ) {
		$term_id  = $request['term'] ?? '';
		$response = $this->metodika_repository->get_publised_array( $term_id );

		return rest_ensure_response( $response );
	}

	public function get_metodika_terms( $request ) {
		$response = $this->metodika_taxonomy->get_terms();

		return rest_ensure_response( $response );
	}
}
