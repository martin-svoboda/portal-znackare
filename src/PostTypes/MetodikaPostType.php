<?php

namespace PortalZnackare\PostTypes;

use PortalZnackare\Repositories\MetodikaRepository;
use PortalZnackare\Taxonomies\MetodikaTaxonomy;
use PortalZnackareDeps\Wpify\CustomFields\CustomFields;
use PortalZnackareDeps\Wpify\PostType\AbstractCustomPostType;

class MetodikaPostType extends AbstractCustomPostType {
	const KEY = 'metodika';

	/** @var CustomFields */
	protected $wcf;

	public function __construct(
		CustomFields $wcf,
		private MetodikaRepository $event_repository
	) {
		$this->wcf = $wcf;

		parent::__construct();
	}

	public function setup() {
		add_filter( 'post_type_link', function ( $permalink, $post, $leavename, $sample ) {
			$key = self::KEY;
			if ( $post->post_type !== $key ) {
				return $permalink;
			}
			$terms = get_the_terms( $post->ID, MetodikaTaxonomy::KEY );
			if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
				return str_replace( '%' . MetodikaTaxonomy::KEY . '%', $terms[0]->slug, $permalink );
			}
			return $permalink;
		}, 10, 4 );

//		add_action( 'init', function () {
//			add_rewrite_rule(
//				'^metodika/([^/]+)/([^/]+)/?$',
//				'index.php?post_type=metodika&name=$2',
//				'top'
//			);
//		} );

	}

	public function get_post_type_key(): string {
		return self::KEY;
	}

	public function get_args(): array {
		$singular = _x( 'Metodika', 'post type singular name', 'kct' );
		$plural   = _x( 'Metodiky', 'post type name', 'kct' );

		return array(
			'label'              => $plural,
			'labels'             => $this->generate_labels( $singular, $plural ),
			'public'             => true,
			'hierarchical'       => true,
			'taxonomies'         => array( MetodikaTaxonomy::KEY ),
			'publicly_queryable' => true,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'show_in_nav_menus'  => true,
			'show_in_admin_bar'  => true,
			'show_in_rest'       => true,
			'has_archive'        => true,
			'supports'           => array(
				'title',
				'editor',
				'revisions',
				'excerpt',
				'thumbnail',
				'custom-fields'
			),
			'rewrite'            => array
			(
				'slug'       => self::KEY . '/%' . MetodikaTaxonomy::KEY . '%',
				'with_front' => false

			),
		);
	}
}
