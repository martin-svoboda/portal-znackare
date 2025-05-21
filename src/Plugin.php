<?php

namespace PortalZnackare;

use PortalZnackare\Managers\RepositoryManager;
use PortalZnackare\Managers\ApiManager;
use PortalZnackare\Managers\BlocksManager;
use PortalZnackare\Managers\PostTypesManager;
use PortalZnackare\Managers\SnippetsManager;
use PortalZnackare\Managers\TaxonomyManager;

final class Plugin {
	public function __construct(
		ApiManager $api_manager,
		BlocksManager $blocks_manager,
		SnippetsManager $snippets_manager,
		PostTypesManager $post_types_manager,
		RepositoryManager $repository_manager,
		TaxonomyManager $taxonomy_manager,
		Frontend $frontend,
		Settings $settings,
	) {
	}

	/**
	 * @param bool $network_wide
	 */
	public function activate( bool $network_wide ) {
	}

	/**
	 * @param bool $network_wide
	 */
	public function deactivate( bool $network_wide ) {
	}

	/**
	 *
	 */
	public function uninstall() {
	}
}
