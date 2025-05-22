<?php

namespace PortalZnackare\Api;

use PortalZnackare\Managers\ApiManager;
use PortalZnackare\Repositories\MetodikaRepository;
use PortalZnackare\Taxonomies\MetodikaTaxonomy;
use WP_Error;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

class PortalApi extends WP_REST_Controller {

	/**
	 * Construct
	 */
	public function __construct(
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
			ApiManager::PATH,
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
			ApiManager::PATH,
			'/metodika',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_metodika_data' ),
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			ApiManager::PATH,
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
