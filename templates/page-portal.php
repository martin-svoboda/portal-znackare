<?php
/**
 * Template Name: KČT Portál (Headless)
 * Template Post Type: page
 */
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />

	<?php
	// Nutné pro Gutenberg bloky
	wp_enqueue_style('wp-block-library');

	$title       = '';
	$description = '';
	$image       = '';
	$url         = '';

	// Fallback data z aktuální WP stránky
	if ( have_posts() ) :
		the_post();

		$title       = get_the_title();
		$description = get_the_excerpt() ?: wp_trim_words(strip_tags(get_the_content()), 30, '…');
		$image       = get_the_post_thumbnail_url(null, 'large');
		$url         = get_permalink();
	endif;
	?>

	<title><?php echo esc_html($title); ?></title>
	<meta name="description" content="<?php echo esc_attr($description); ?>" />

	<!-- Open Graph (Facebook, LinkedIn, atd.) -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="<?php echo esc_attr($title); ?>" />
	<meta property="og:description" content="<?php echo esc_attr($description); ?>" />
	<meta property="og:image" content="<?php echo esc_url($image); ?>" />
	<meta property="og:url" content="<?php echo esc_url($url); ?>" />
	<meta property="og:site_name" content="<?php bloginfo('name'); ?>" />

	<!-- Twitter Cards -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="<?php echo esc_attr($title); ?>" />
	<meta name="twitter:description" content="<?php echo esc_attr($description); ?>" />
	<meta name="twitter:image" content="<?php echo esc_url($image); ?>" />

	<!-- Favicon -->
	<link rel="icon" href="<?php echo esc_url(get_site_icon_url()); ?>" />

	<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<div id="app-root" data-app="portal">
	<div id="primary" class="content-area">
		<main id="main" class="site-main">

			<?php
			// Znovu rewind the_post(), protože byl výše spotřebován
			rewind_posts();
			while ( have_posts() ) : the_post();
				the_content();
			endwhile;
			?>

		</main><!-- .site-main -->
	</div><!-- .content-area -->
</div>
<?php wp_footer(); ?>
</body>
</html>
