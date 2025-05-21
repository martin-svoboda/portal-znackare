<?php

namespace PortalZnackare;

use PortalZnackareDeps\Wpify\CustomFields\CustomFields;

/**
 * Class Settings
 *
 * @package Wpify\Settings
 */
class Settings {
	/**
	 * @var CustomFields
	 */
	public $wcf;

	/**
	 * @var array
	 */
	public $options = array();

	/**
	 * Option key, and option page slug
	 *
	 * @var string
	 */
	const KEY = 'portal_znackare_options';

	public function __construct( CustomFields $wcf ) {
		$this->wcf = $wcf;

		$this->setup();
	}

	public function setup() {
		$this->wcf->create_options_page( array(
			'page_title'      => __( 'Nastavení portálu značkaře', 'portal-znackare' ),
			'menu_title'      => __( 'Portál značkaře', 'portal-znackare' ),
			'menu_slug'       => self::KEY,
			'option_name'     => self::KEY,
			'capability'      => 'manage_options',
			'success_message' => 'Změny nastavení byli uloženy.',
			'items'           => array(
				array(
					'title'           => __( 'Login obrázek', 'portal-znackare' ),
					'id'              => 'login_image',
					'type'            => 'attachment',
					'attachment_type' => 'image',
				),
				array(
					'id'    => 'methodical_files',
					'type'  => 'multi_group',
					'label' => 'Soubory metodiky',
					'items' => array(
						array(
							'id'    => 'title',
							'type'  => 'text',
							'label' => 'Název',
						),
						array(
							'id'    => 'description',
							'type'  => 'text',
							'label' => 'Popisek',
						),
						array(
							'id'    => 'file',
							'type'  => 'attachment',
							'label' => 'Soubor',
						)
					)
				),
			),

		) );
	}
}
