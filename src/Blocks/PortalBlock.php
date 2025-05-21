<?php

namespace PortalZnackare\Blocks;

use PortalZnackare\Api\PortalApi;
use PortalZnackareDeps\Wpify\Asset\AssetFactory;
use PortalZnackareDeps\Wpify\CustomFields\CustomFields;
use PortalZnackareDeps\Wpify\PluginUtils\PluginUtils;
use PortalZnackareDeps\Wpify\Template\WordPressTemplate;

class PortalBlock {

	public function __construct(
		private CustomFields $custom_fields,
		private AssetFactory $asset_factory,
		private PluginUtils $utils,
		private WordPressTemplate $template,
		private PortalApi $insyz_api
	) {
		$this->setup();
	}

	public function setup() {
		$this->custom_fields->create_gutenberg_block( array(
			'name'            => 'kct/portal',
			'title'           => 'KČT portál',
			'render_callback' => array( $this, 'render' ),
			'items'           => array(
				array(
					'type'  => 'text',
					'id'    => 'button',
					'title' => __( 'Text tlačítka', 'kct' ),
				),
			),
		) );
	}

	public function render( array $block_attributes, string $content ) {

		$this->asset_factory->wp_script(
			$this->utils->get_plugin_path( 'build/portal.js' ),
			array(
				'in_footer' => true,
				'variables' => array(
					'kct_portal' => array(
						'nonce'    => wp_create_nonce( 'wp_rest' ),
						'rest_url' => rest_url( $this->insyz_api->namespace ),
						'is_admin' => current_user_can( 'administrator' ),
					),
				),
			),
		);

		return $this->template->render( 'blocks/portal', null, $block_attributes );
	}
}
