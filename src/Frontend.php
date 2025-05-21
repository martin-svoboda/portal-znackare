<?php

namespace PortalZnackare;

use PortalZnackare\Api\PortalApi;
use PortalZnackare\Functions\DbClient;
use PortalZnackare\Managers\ApiManager;
use PortalZnackareDeps\Wpify\Asset\AssetFactory;
use PortalZnackareDeps\Wpify\PluginUtils\PluginUtils;

class Frontend {

	public function __construct(
		private PluginUtils $utils,
		private AssetFactory $asset_factory,
		private DbClient $db_client,
		private PortalApi $portal_api,
	) {
		$this->setup();
	}

	public function setup() {
		add_action( 'template_redirect', [ $this, 'maybe_override_entire_frontend' ] );
		add_action( 'init', [ $this, 'clear_scripts' ] );

		add_action( 'after_setup_theme', function () {
			add_theme_support( 'menus' );

			register_nav_menus( array(
				'portal' => 'Menu v portálu',
			) );
		} );
	}

	public function maybe_override_entire_frontend() {
		if ( is_admin() || wp_doing_ajax() || str_starts_with( $_SERVER['REQUEST_URI'], '/wp-json/' ) ) {
			return; // Necháme být pro admin a REST
		}

		$this->setup_assets();

		$template = $this->utils->get_plugin_path( 'templates/page-portal.php' );
		if ( file_exists( $template ) ) {
			include $template;
			exit;
		}
	}

	public function clear_scripts() {
		// Emoji scripty a styly
		remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
		remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
		remove_action( 'wp_print_styles', 'print_emoji_styles' );
		remove_action( 'admin_print_styles', 'print_emoji_styles' );

		// OEmbed odkazy
		remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );
		remove_action( 'wp_head', 'wp_oembed_add_host_js' );

		// REST API link
		remove_action( 'wp_head', 'rest_output_link_wp_head' );

		// EditURI (RSD) link
		remove_action( 'wp_head', 'rsd_link' );

		// Windows Live Writer support
		remove_action( 'wp_head', 'wlwmanifest_link' );

		// Shortlink
		remove_action( 'wp_head', 'wp_shortlink_wp_head' );

		// Generator metatag
		remove_action( 'wp_head', 'wp_generator' );

		// Feed odkazy (pokud nepoužíváš)
		remove_action( 'wp_head', 'feed_links', 2 );
		remove_action( 'wp_head', 'feed_links_extra', 3 );

		// REST API link v HTTP hlavičkách (pokud nepoužíváš)
		remove_action( 'template_redirect', 'rest_output_link_header', 11, 0 );
	}

	public function setup_assets() {
		$this->asset_factory->wp_script( $this->utils->get_plugin_path( 'build/portal.css' ) );
		$this->asset_factory->wp_script(
			$this->utils->get_plugin_path( 'build/portal.js' ),
			array(
				'in_footer' => true,
				'variables' => array(
					'kct_portal' => array(
						'nonce'          => wp_create_nonce( 'wp_rest' ),
						'rest_namespace' => $this->portal_api->namespace,
						'is_admin'       => current_user_can( 'administrator' ),
						'menu'           => $this->get_menu_data(),
						'bloginfo'       => array(
							'name'        => get_bloginfo( 'name' ),
							'description' => get_bloginfo( 'description' ),
						),
						'settings'       => $this->get_settings_data(),
					),
				),
			),
		);
	}

	public function get_settings_data() {
		$settings = get_option( Settings::KEY, array() );
		foreach ( $settings as $key => $value ) {

			if ( in_array( $key, array( 'login_image' ) ) ) {

				$settings[ $key ] = esc_url( wp_get_attachment_url( $value ) );

			} elseif ( 'methodical_files' === $key ) {

				foreach ( $value as $i => $file ) {
					if ( ! empty( $file['file'] ) ) {
						$path                           = get_attached_file( $file['file'] );
						$settings[ $key ][ $i ]['file'] = esc_url( wp_get_attachment_url( $file['file'] ) );
						$settings[ $key ][ $i ]['size'] = filesize( $path );
						$settings[ $key ][ $i ]['type'] = wp_check_filetype( $path )['ext'];
					}
				}

			}
		}

		return $settings;
	}

	public function get_menu_data() {
		$locations = get_nav_menu_locations();
		$menu_id   = $locations['portal'] ?? null;
		$items     = $menu_id ? wp_get_nav_menu_items( $menu_id ) : [];
		$data      = [];

		foreach ( $items as $item ) {
			$data[] = array(
				'id'    => $item->ID,
				'title' => $item->title,
				'url'   => $item->url,
				'slug'  => basename( untrailingslashit( $item->url ) ),
				'type'  => $item->type,
			);
		}

		return $data;
	}

	public function get_post_data() {
		$post      = get_post();
		$post_data = [];
		if ( $post instanceof \WP_Post ) {
			setup_postdata( $post );

			$post_data = array(
				'id'             => $post->ID,
				'title'          => get_the_title( $post ),
				'content'        => apply_filters( 'the_content', $post->post_content ),
				'type'           => $post->post_type,
				'slug'           => $post->post_name,
				'template'       => get_page_template_slug( $post->ID ),
				'date'           => get_the_date( '', $post ),
				'author'         => get_the_author_meta( 'display_name', $post->post_author ),
				'featured_image' => get_the_post_thumbnail_url( $post, 'large' ),
				// atd...
			);
		}

		return $post_data;
	}
}
