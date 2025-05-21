<?php

use PortalZnackareDeps\DI\Definition\Helper\CreateDefinitionHelper;
use PortalZnackareDeps\Wpify\CustomFields\CustomFields;
use PortalZnackareDeps\Wpify\Model\Manager;
use PortalZnackareDeps\Wpify\PluginUtils\PluginUtils;
use PortalZnackareDeps\Wpify\Template\WordPressTemplate;

return array(
	CustomFields::class      => ( new CreateDefinitionHelper() )
		->constructor( plugins_url( 'deps/wpify/custom-fields', __FILE__ ) ),
	WordPressTemplate::class => ( new CreateDefinitionHelper() )
		->constructor( array( __DIR__ . '/templates' ), 'portal-znackare' ),
	PluginUtils::class       => ( new CreateDefinitionHelper() )
		->constructor( __DIR__ . '/portal-znackare.php' ),
	Manager::class => ( new CreateDefinitionHelper() )
		->constructor( [] )
);
