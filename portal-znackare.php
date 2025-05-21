<?php
/*
 * Plugin Name:       Portál značkaře
 * Description:       Plugin s portálem značkaře s napojením na INSYS
 * Version:           1.0.0
 * Requires PHP:      8.1.0
 * Requires at least: 5.3.0
 * Author:            WPify
 * Author URI:        https://www.wpify.io/
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       portal-znackare
 * Domain Path:       /languages
*/

use PortalZnackare\Plugin;
use PortalZnackareDeps\DI\Container;
use PortalZnackareDeps\DI\ContainerBuilder;

if ( ! defined( 'PORTAL_ZNACKARE_MIN_PHP_VERSION' ) ) {
	define( 'PORTAL_ZNACKARE_MIN_PHP_VERSION', '8.1.0' );
}

/**
 * @return Plugin
 * @throws Exception
 */
function portal_znackare(): Plugin {
	return portal_znackare_container()->get( Plugin::class );
}

/**
 * @return Container
 * @throws Exception
 */
function portal_znackare_container(): Container {
	static $container;

	if ( empty( $container ) ) {
		$is_production    = ! WP_DEBUG;
		$file_data        = get_file_data( __FILE__, array( 'version' => 'Version' ) );
		$definition       = require_once __DIR__ . '/config.php';
		$containerBuilder = new ContainerBuilder();
		$containerBuilder->addDefinitions( $definition );

		if ( $is_production ) {
			$containerBuilder->enableCompilation( WP_CONTENT_DIR . '/cache/' . dirname( plugin_basename( __FILE__ ) ) . '/' . $file_data['version'], 'PortalZnackareCompiledContainer' );
		}

		$container = $containerBuilder->build();
	}

	return $container;
}

function portal_znackare_activate( $network_wide ) {
	portal_znackare()->activate( $network_wide );
}

function portal_znackare_deactivate( $network_wide ) {
	portal_znackare()->deactivate( $network_wide );
}

function portal_znackare_uninstall() {
	portal_znackare()->uninstall();
}

function portal_znackare_php_upgrade_notice() {
	$info = get_plugin_data( __FILE__ );

	echo sprintf(
		__( '<div class="error notice"><p>Opps! %s requires a minimum PHP version of %s. Your current version is: %s. Please contact your host to upgrade.</p></div>', 'portal-znackare' ),
		$info['Name'],
		PORTAL_ZNACKARE_MIN_PHP_VERSION,
		PHP_VERSION
	);
}

function portal_znackare_php_vendor_missing() {
	$info = get_plugin_data( __FILE__ );

	echo sprintf(
		__( '<div class="error notice"><p>Opps! %s is corrupted it seems, please re-install the plugin.</p></div>', 'portal-znackare' ),
		$info['Name']
	);
}

if ( version_compare( PHP_VERSION, PORTAL_ZNACKARE_MIN_PHP_VERSION ) < 0 ) {
	add_action( 'admin_notices', 'portal_znackare_php_upgrade_notice' );
} else {
	$deps_loaded   = false;
	$vendor_loaded = false;

	$deps = array_filter( array( __DIR__ . '/deps/scoper-autoload.php', __DIR__ . '/deps/autoload.php' ), function ( $path ) {
		return file_exists( $path );
	} );

	foreach ( $deps as $dep ) {
		include_once $dep;
		$deps_loaded = true;
	}

	if ( file_exists( __DIR__ . '/vendor/autoload.php' ) ) {
		include_once __DIR__ . '/vendor/autoload.php';
		$vendor_loaded = true;
	}

	if ( $deps_loaded && $vendor_loaded ) {
		add_action( 'plugins_loaded', 'portal_znackare', 11 );
		register_activation_hook( __FILE__, 'portal_znackare_activate' );
		register_deactivation_hook( __FILE__, 'portal_znackare_deactivate' );
		register_uninstall_hook( __FILE__, 'portal_znackare_uninstall' );
	} else {
		add_action( 'admin_notices', 'portal_znackare_php_vendor_missing' );
	}
}
