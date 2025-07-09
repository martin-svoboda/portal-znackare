<?php

namespace PortalZnackare\Api;

use PortalZnackare\Managers\ApiManager;
use PortalZnackare\Models\ReportModel;
use PortalZnackare\Repositories\MetodikaRepository;
use PortalZnackare\Repositories\ReportRepository;
use PortalZnackare\Settings;
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
		private MetodikaTaxonomy $metodika_taxonomy,
		private Settings $settings,
		private ReportRepository $report_repository
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

		register_rest_route(
			ApiManager::PATH,
			'/downloads',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_downloads' ),
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			ApiManager::PATH,
			'/report',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_report' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'int_adr' => array(
						'required' => true,
					),
					'id_zp'   => array(
						'required' => true,
					),
				),
			)
		);

		register_rest_route(
			ApiManager::PATH,
			'/report',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'set_report' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'int_adr' => array(
						'required' => true,
					),
					'id_zp'   => array(
						'required' => true,
					),
				),
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

		foreach ( $response as $key => $term ) {
			$file = get_term_meta( $term['term_id'], 'file', true );

			if ( empty( $file ) ) {
				continue;
			}

			$path                          = get_attached_file( $file );
			$response[ $key ]['file_url']  = esc_url( wp_get_attachment_url( $file ) );
			$response[ $key ]['file_size'] = filesize( $path );
			$response[ $key ]['file_type'] = wp_check_filetype( $path )['ext'];
		}

		return rest_ensure_response( $response );
	}

	public function get_downloads( $request ) {
		$metodika       = $this->metodika_taxonomy->get_terms();
		$metodika_files = [];
		$response       = [];

		foreach ( $metodika as $key => $term ) {
			$file = get_term_meta( $term['term_id'], 'file', true );

			if ( empty( $file ) ) {
				continue;
			}

			$path                                  = get_attached_file( $file );
			$metodika_files[ $key ]['title']       = $term['name'];
			$metodika_files[ $key ]['description'] = $term['description'];
			$metodika_files[ $key ]['file']        = esc_url( wp_get_attachment_url( $file ) );
			$metodika_files[ $key ]['size']        = filesize( $path );
			$metodika_files[ $key ]['type']        = wp_check_filetype( $path )['ext'];
		}

		if ( ! empty( $metodika_files ) ) {
			$response[] = array(
				'category' => 'Metodika',
				'files'    => $metodika_files,
			);
		}

		$downloads = $this->settings->get_option( 'downloads' );
		foreach ( $downloads as $key => $category ) {

			if ( empty( $category['files'] ) ) {
				continue;
			}

			foreach ( $category['files'] as $i => $file ) {
				if ( ! empty( $file['file'] ) ) {
					$path                                     = get_attached_file( $file['file'] );
					$downloads[ $key ]['files'][ $i ]['file'] = esc_url( wp_get_attachment_url( $file['file'] ) );
					$downloads[ $key ]['files'][ $i ]['size'] = filesize( $path );
					$downloads[ $key ]['files'][ $i ]['type'] = wp_check_filetype( $path )['ext'];
				}
			}
		}

		if ( ! empty( $downloads ) ) {
			$response = array_merge( $response, $downloads );
		}

		return rest_ensure_response( $response );
	}

	public function get_report( $request ) {
		$int_adr  = intval( $request['int_adr'] );
		$id_zp    = intval( $request['id_zp'] );

		// Validace vstupních parametrů
		if ( empty( $int_adr ) || empty( $id_zp ) ) {
			return new WP_Error(
				'missing_parameters',
				'Chybý vyžadované parametry volání int_adr nebo id_zp.',
				[ 'status' => 401 ]
			);
		}

		$reports = $this->report_repository->find_by_zp_and_user( $id_zp, $int_adr );

		// Vrátíme první report nebo null
		if ( empty( $reports ) ) {
			return "";
		}

		$report = $reports[0];
		$response = $report->to_array();

		$response['data_a'] = ! empty( $response['data_a'] ) ? json_decode( $response['data_a'], true ) : [];
		$response['data_b'] = ! empty( $response['data_b'] ) ? json_decode( $response['data_b'], true ) : [];
		$response['calculation'] = ! empty( $response['calculation'] ) ? json_decode( $response['calculation'], true ) : [];

		// Kontrola JSON chyb
		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new WP_Error(
				'json_decode_error',
				'Chyba při dekódování JSON dat',
				[ 'status' => 500 ]
			);
		}

		return rest_ensure_response( $response );
	}

	/**
	 * @param WP_REST_Request $request Full data about the request.
	 *
	 * @return WP_Error|\WP_HTTP_Response|WP_REST_Response
	 * @throws \PortalZnackareDeps\Wpify\Model\Exceptions\KeyNotFoundException
	 * @throws \PortalZnackareDeps\Wpify\Model\Exceptions\PrimaryKeyException
	 * @throws \PortalZnackareDeps\Wpify\Model\Exceptions\RepositoryNotInitialized
	 * @throws \PortalZnackareDeps\Wpify\Model\Exceptions\SqlException
	 * @throws \ReflectionException
	 */
	public function set_report( $request ) {
		$id_zp   = intval( $request->get_param( 'id_zp' ) );
		$int_adr = intval( $request->get_param( 'int_adr' ) );

		// Validace vstupních parametrů
		if ( empty( $int_adr ) || empty( $id_zp ) ) {
			return new WP_Error(
				'missing_params',
				'Chybí povinné parametry int_adr nebo id_zp',
				[ 'status' => 400 ]
			);
		}

		// Zkusíme najít existující report
		$existing_reports = $this->report_repository->find_by_zp_and_user( $id_zp, $int_adr );

		/** @var ReportModel $report */
		if ( ! empty( $existing_reports ) ) {
			// Update existujícího reportu
			$report = $existing_reports[0];
		} else {
			// Vytvoření nového reportu
			$report = $this->report_repository->create();
		}

		$report->id_zp       = $id_zp;
		$report->int_adr     = $int_adr;
		$report->cislo_zp    = $request->get_param( 'cislo_zp' );
		$report->je_vedouci  = boolval( $request->get_param( 'je_vedouci' ) ?? false );

		// JSON serializace dat
		$data_a = $request->get_param( 'data_a' );
		$report->data_a = ! empty( $data_a ) ? wp_json_encode( $data_a ) : '';

		$data_b = $request->get_param( 'data_b' );
		$report->data_b = ! empty( $data_b ) ? wp_json_encode( $data_b ) : '';

		$calculation = $request->get_param( 'calculation' );
		$report->calculation = ! empty( $calculation ) ? wp_json_encode( $calculation ) : '';

		$report->state = $request->get_param( 'state' ) ?? '';

		if ( 'send' === $request->get_param( 'state' ) ) {
			$report->date_send = current_time( 'timestamp' );
		}

		$response = $this->report_repository->save( $report );

		return rest_ensure_response( $response );
	}
}
