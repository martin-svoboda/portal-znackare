<?php

namespace PortalZnackare\Models;

use DateTime;
use PortalZnackare\Repositories\MetodikaRepository;
use PortalZnackareDeps\Wpify\Model\Attributes\Meta;
use PortalZnackareDeps\Wpify\Model\Attributes\ReadOnlyProperty;
use PortalZnackareDeps\Wpify\Model\Post;

/**
 * @method MetodikaRepository model_repository()
 */
class MetodikaModel extends Post {
	
//	#[ReadOnlyProperty]
//	public string $title;
//
//	#[ReadOnlyProperty]
//	public string $content;

	public function to_array( array $props = array(), array $recursive = array() ): array {
		$data = parent::to_array( $props, $recursive );
		if ( $this->featured_image ) {
			$data['image'] = array(
				'url' => get_the_post_thumbnail_url( $this->id ),
			);
		}

		return $data;
	}
}
