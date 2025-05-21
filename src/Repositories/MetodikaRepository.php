<?php

namespace PortalZnackare\Repositories;

use PortalZnackare\Models\MetodikaModel;
use PortalZnackare\PostTypes\MetodikaPostType;
use PortalZnackare\Taxonomies\MetodikaTaxonomy;
use PortalZnackareDeps\Wpify\Model\PostRepository;

/**
 * @method MetodikaModel get( $object = null )
 */
class MetodikaRepository extends PostRepository {
	public function post_type(): string {
		return MetodikaPostType::KEY;
	}

	public function post_types(): array {
		return array( $this->post_type() );
	}

	/**
	 * @inheritDoc
	 */
	public function model(): string {
		return MetodikaModel::class;
	}

	public function get_publised_array( $term_id = '' ) {
		$args = [];
		if ( $term_id ) {
			$args = array(
				'tax_query' => array(
					array(
						'taxonomy' => MetodikaTaxonomy::KEY,
						'field'    => 'slug',
						'terms'    => array( $term_id )
					)
				),
				'order'     => 'ASC',
				'orderby'   => 'menu_order'
			);
		}

		$items = $this->find_published( $args );

		if ( empty( $items ) ) {
			return [];
		}

		$array_items = [];
		/** @var MetodikaModel $item */
		foreach ( $items as $item ) {
			$array_items[] = $item->to_array();
		}

		return $array_items;
	}
}
