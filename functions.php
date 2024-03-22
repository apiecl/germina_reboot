<?php

/**
 * functions.php
 *
 * Theme main functions file
 *
 * @link http://germina.cl
 * @since [21.04.2016]
 *
 * @package germina_reboot
 */


/**
 * CONSTANTS
 */

define( 'GERMINA_PUBLICACIONES', 10	);
define( 'GERMINA_PROYECTOS', 142 );
define( 'GERMINA_NOTFOUND', 829 );
define( 'GERMINA_CATNOVEDADES', 16 );
define( 'GERMINA_ARTICULOS', 6 );
define( 'FACEBOOK_PAGE', 'https://web.facebook.com/Germina-conocimiento-para-la-acci%C3%B3n-2157914764440494/' );
define( 'LINKEDIN_PAGE', 'https://www.linkedin.com/company/11536225/' );
define( 'GERMINA_VERSION', '2.3.1' );

/**
 * LIBRARIES
 */

//Composer autoload class
//require_once('vendor/autoload.php');

/**
 * INCLUDES
 */

require_once('lib/wp-bootstrap-navwalker.php');
require_once('lib/content-functions.php');
require_once('lib/template-functions.php');
require_once('lib/ajax-functions.php');
require_once('lib/shortcodes.php');

/**
 * THEME INIT
 */

function germina_themesupports() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'menus' );
	add_theme_support( 'html5' );
	add_theme_support( 'post-thumbnails' );
}

add_action( 'after_setup_theme', 'germina_themesupports' );

function germina_pagesupport() {
	add_post_type_support( 'page', 'excerpt' );
}

add_action( 'init', 'germina_pagesupport' );

function germina_imagesizes() {
	add_image_size('635x300', 635, 300, true);
	add_image_size('120x120', 120, 120, true);
	add_image_size('200x200', 200, 200, true);
	add_image_size('174x200', 174, 200, true);
	add_image_size('240x311', 240, 311, true);
	add_image_size('360x466', 360, 466, true);
	add_image_size('600w', 600, 500, false);
}

add_action('after_setup_theme', 'germina_imagesizes');


//MENUS

function germina_menus() {
	register_nav_menus(
		array(
			'principal' 	=> 'Menú Superior',
			'portada' 		=> 'Novedades en portada',
			'portafolio' 	=> 'Contenidos de Portafolio',
			'cedoc'			=> 'Centro de Documentación en portada'
		)
	);
}

add_action('init', 'germina_menus');

/**
 * SCRIPTS
 */

function germina_scripts() {

	if(!is_admin()) {
		wp_deregister_script( 'jquery' );
		wp_enqueue_script( 'jquery', 'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js', array(), '3.6.0', true );
	}

	wp_enqueue_script( 'masonry', get_bloginfo('template_url') . '/assets/js/masonry.pkgd.min.js', array('jquery', 'imagesLoaded'), '4.2.2', false );
	wp_enqueue_script('imagesLoaded', get_bloginfo('template_url') . '/assets/js/imagesloaded.pkgd.min.js', array('jquery'), '5.0.0', false);

	if(is_home() || is_page( 'somos' ) ) {

		wp_enqueue_script( 'videojs', '//vjs.zencdn.net/5.8.8/video.js', array(), '5.8.8', true );
	}

	wp_enqueue_script( 'mainjs', get_bloginfo('template_url') . '/assets/js/germina.js', array('jquery', 'masonry', 'imagesLoaded'), GERMINA_VERSION, true );

	//Fonts information
	//
	$germina_vars = array(
						'ajax_url' => admin_url( 'admin-ajax.php' ),
						'fonts' => array(
								"Lato:400,700:latin"
						),
						'video_url' => get_bloginfo( 'template_url' ) . '/assets/img/somos-germina.mp4',
						'mst_url' => get_bloginfo( 'template_url' ) . '/parts/content/moustache/',
						'proyects_per_page' => 5,
						'main_url' => get_bloginfo('url'),
						'version'	=> GERMINA_VERSION
		);

	wp_localize_script( 'mainjs', 'germina', $germina_vars );
}

add_action('wp_enqueue_scripts', 'germina_scripts');

/**
 * STYLES
 */

function germina_styles() {
	//wp_enqueue_style( 'pure', get_bloginfo('template_url') . '/assets/css/pure.min.css' );
	wp_enqueue_style( 'main', get_bloginfo('template_url') . '/assets/css/main.css', array(), GERMINA_VERSION, 'screen' );
}

add_action('wp_enqueue_scripts', 'germina_styles');

/**
 * HTML HEAD STUFF
 */
function germina_head() {
		//charset
		 //$output = '<meta charset="utf-8">';
		//x-ua para edge
	    //$output .= '<meta http-equiv="x-ua-compatible" content="ie=edge">';
	    //viewport para móviles
	    //$output .= '<meta name="viewport" content="width=device-width, initial-scale=1">';
	     $output = '<script src="https://kit.fontawesome.com/14643ca681.js" crossorigin="anonymous"></script>';
     echo $output;
}

add_action( 'wp_head', 'germina_head' );

function germina_favico() {
	
	$faviconurl = get_bloginfo('template_url') . '/assets/img/icons/';

	$output = '<link rel="apple-touch-icon-precomposed" sizes="57x57" href="' . $faviconurl . 'apple-touch-icon-57x57.png" />
	<link rel="apple-touch-icon-precomposed" sizes="114x114" href="' . $faviconurl . 'apple-touch-icon-114x114.png" />
	<link rel="apple-touch-icon-precomposed" sizes="72x72" href="' . $faviconurl . 'apple-touch-icon-72x72.png" />
	<link rel="apple-touch-icon-precomposed" sizes="144x144" href="' . $faviconurl . 'apple-touch-icon-144x144.png" />
	<link rel="apple-touch-icon-precomposed" sizes="60x60" href="' . $faviconurl . 'apple-touch-icon-60x60.png" />
	<link rel="apple-touch-icon-precomposed" sizes="120x120" href="' . $faviconurl . 'apple-touch-icon-120x120.png" />
	<link rel="apple-touch-icon-precomposed" sizes="76x76" href="' . $faviconurl . 'apple-touch-icon-76x76.png" />
	<link rel="apple-touch-icon-precomposed" sizes="152x152" href="' . $faviconurl . 'apple-touch-icon-152x152.png" />
	<link rel="icon" type="image/png" href="' . $faviconurl . 'favicon-196x196.png" sizes="196x196" />
	<link rel="icon" type="image/png" href="' . $faviconurl . 'favicon-96x96.png" sizes="96x96" />
	<link rel="icon" type="image/png" href="' . $faviconurl . 'favicon-32x32.png" sizes="32x32" />
	<link rel="icon" type="image/png" href="' . $faviconurl . 'favicon-16x16.png" sizes="16x16" />
	<link rel="icon" type="image/png" href="' . $faviconurl . 'favicon-128.png" sizes="128x128" />
	<meta name="application-name" content="Germina - Conocimiento para la Acción"/>
	<meta name="msapplication-TileColor" content="#FFFFFF" />
	<meta name="msapplication-TileImage" content="' . $faviconurl . 'mstile-144x144.png" />
	<meta name="msapplication-square70x70logo" content="' . $faviconurl . 'mstile-70x70.png" />
	<meta name="msapplication-square150x150logo" content="' . $faviconurl . 'mstile-150x150.png" />
	<meta name="msapplication-wide310x150logo" content="' . $faviconurl . 'mstile-310x150.png" />
	<meta name="msapplication-square310x310logo" content="' . $faviconurl . 'mstile-310x310.png" />
	<meta name="msapplication-notification" content="frequency=30;polling-uri=http://notifications.buildmypinnedsite.com/?feed=' . $faviconurl . '/feed&amp;id=1;polling-uri2=http://notifications.buildmypinnedsite.com/?feed=' . $faviconurl . '/feed&amp;id=2;polling-uri3=http://notifications.buildmypinnedsite.com/?feed=' . $faviconurl . '/feed&amp;id=3;polling-uri4=http://notifications.buildmypinnedsite.com/?feed=' . $faviconurl . '/feed&amp;id=4;polling-uri5=http://notifications.buildmypinnedsite.com/?feed=' . $faviconurl . '/feed&amp;id=5;cycle=1" />';

	echo $output;
}


add_action( 'wp_head', 'germina_favico');

function germina_change_order( $query ) {
	if(!is_admin() && $query->is_main_query()) {
		if(is_archive() && isset($_GET['order']) || is_search() && isset($_GET['order'])) {
			$order = $_GET['order'];
			if($order == 'ascending') {
				$query->set('order', 'ASC');
			} elseif($order == 'descending') {
				$query->set('order', 'DESC');
			}
		}
	}
}

add_action('pre_get_posts', 'germina_change_order');

function germina_include_custom_post_types_in_search_results( $query ) {
    if ( $query->is_main_query() && $query->is_search() && ! is_admin() ) {
        $query->set( 'post_type', array( 'post', 'resumen-proyecto', 'page', 'boletin' ) );
    }
}
add_action( 'pre_get_posts', 'germina_include_custom_post_types_in_search_results' );

function germina_disable_pagination($query) {
	//disables pagination limit in archives and search
	if( !$query->is_post_type_archive() && $query->is_archive() && !is_category('publicaciones') || $query->is_search()  ) {
		$query->set('posts_per_page', -1);
	}
}

add_action( 'pre_get_posts', 'germina_disable_pagination');

function agregar_opciones_personalizadas($wp_customize) {
    // Esto crea una sección en los controles de personalizar
    $wp_customize->add_section('seccion_home', array(
        'title' => 'Cambio párrafo',
        'priority' => 30,
    ));

    // Es un campo personalizado para el párrafo
    $wp_customize->add_setting('parrafo_personalizado', array(
        'default' => '',
        'sanitize_callback' => 'sanitize_text_field',
    ));

    $wp_customize->add_control('parrafo_personalizado', array(
        'label' => 'Párrafo Personalizado',
        'section' => 'seccion_home',
        'type' => 'textarea',
    ));

    // Campo personalizado para el texto bold
    $wp_customize->add_setting('bold_personalizado', array(
        'default' => '',
        'sanitize_callback' => 'sanitize_text_field',
    ));

    $wp_customize->add_control('bold_personalizado', array(
        'label' => 'Texto Fuerte Personalizado',
        'section' => 'seccion_home',
        'type' => 'text',
    ));
}

add_action('customize_register', 'agregar_opciones_personalizadas');


