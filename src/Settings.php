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
					'id'          => 'downloads',
					'type'        => 'multi_group',
					'label'       => 'Soubory ke stažení',
					'description' => 'Doplňte další soubory ke stažení dle kategorií. Soubory metodiky vložte přímo do nastavení oddílů metodik.',
					'items'       => array(
						array(
							'id'    => 'category',
							'type'  => 'text',
							'label' => 'Název kategorie souborů',
						),
						array(
							'id'    => 'files',
							'type'  => 'multi_group',
							'label' => 'Soubory',
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
					)
				),
			),

		) );
	}

	public function get_options() {
		return get_option( self::KEY );
	}

	public function get_option( $key ) {
		$options = $this->get_options();
		if ( ! $options ) {
			return null;
		}
		if ( ! isset( $options[ $key ] ) ) {
			return null;
		}

		return $options[ $key ];
	}
}
