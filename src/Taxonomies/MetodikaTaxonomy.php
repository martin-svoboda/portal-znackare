<?php

namespace PortalZnackare\Taxonomies;

use PortalZnackare\PostTypes\MetodikaPostType;
use PortalZnackareDeps\Wpify\CustomFields\CustomFields;

class MetodikaTaxonomy {
	const KEY = 'dil-metodiky';

	/** @var CustomFields */
	protected $wcf;

	public function __construct( CustomFields $wcf ) {
		$this->wcf = $wcf;
		add_action( 'init', array( $this, 'register_taxonomy' ) );
	}

	public function setup() {
		$this->wcf->create_taxonomy_options( array(
			'taxonomy' => self::KEY,
			'items'    => array(
				array(
					'type'            => 'attachment',
					'id'              => 'image',
					'title'           => __( 'Obrázek', 'kct' ),
					'attachment_type' => 'image',
				),
			),
		) );
	}

	public function register_taxonomy() {
		register_taxonomy(
			self::KEY,
			MetodikaPostType::KEY,
			array(
				'label'             => __( 'Díly metodiky', 'wpify' ),
				'labels'            => array(
					'name'          => _x( 'Díly metodiky', 'taxonomy general name', 'wpify' ),
					'singular_name' => _x( 'Díl metodiky', 'taxonomy singular name', 'wpify' ),
				),
				'description'       => __( 'Díly metodiky', 'wpify' ),
				'public'            => true,
				'show_ui'           => true,
				'show_admin_column' => true,
				'hierarchical'      => true,
				'show_in_rest'      => true,
				'query_var'         => self::KEY,
				'rewrite'           => [ 'slug' => MetodikaPostType::KEY ],
			)
		);
	}

	public function get_terms(): array {
		$terms = get_terms( array(
			'taxonomy'   => self::KEY,
			'hide_empty' => true,
		) );

		if ( ! $terms ) {
			return [];
		}

		$terms_array = [];
		/** @var \WP_Term $term */
		foreach ( $terms as $term ) {
			$terms_array[] = $term->to_array();
		}

		return $terms_array;
	}
}
