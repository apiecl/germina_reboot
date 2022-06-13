<?php
/**
 * Get other templates (e.g. product attributes) passing attributes and including the file.
 *
 * @access public
 * @param mixed $template_name
 * @param array $args (default: array())
 * @param string $template_path (default: '')
 * @param string $default_path (default: '')
 * @return void                                                                                                                                                                                              */
function cur_get_template( $template_name, $args = array(), $template_path = '', $default_path = '' ){
    if ( $args && is_array($args) )
        extract( $args );
    $located = cur_locate_template( $template_name, $template_path, $default_path );
    if( false != $located ){
        do_action( 'cur_before_template_part', $template_name, $template_path, $located, $args );
        include( $located );
        do_action( 'cur_after_template_part', $template_name, $template_path, $located, $args );
    }
    return $located;
}
/**
 * Locate a template and return the path for inclusion.
 *
 * This is the load order:
 *
 *      yourtheme       /   $template_path  /   $template_name
 *      yourtheme       /   $template_name
 *      $default_path   /   $template_name
 *
 * @access public
 * @param mixed $template_name
 * @param string $template_path (default: '')
 * @param string $default_path (default: '')
 * @return string
 */
function cur_locate_template( $template_name, $template_path = '', $default_path = '' ) {
    // TODO set template path. This is the folder you'd create in your theme folder
    if ( ! $template_path ) $template_path = 'parts/';
    // TODO define YOUR_PLUGIN_PATH
    if ( ! $default_path ) $default_path = 'parts/' . '/content/';
    // Look within passed path within the theme - this is priority
    $template = locate_template(
        array(
            trailingslashit( $template_path ) . $template_name,
            $template_name
        )
    );
    // Get default template
    if ( ! $template )
        $template = $default_path . $template_name;
    if( file_exists( $template ) ){
        // Return what we found
        return apply_filters('cur_locate_template', $template, $template_name, $template_path);
    } else {
        return false;
    }
}

add_filter('template_include', 'germina_subdocs');

function germina_subdocs( $original_template ) {
    //hace que se devuelva la plantilla de publicaciones para subs de publicaciones
    global $post;
    $args = array(
        'taxonomy'  => 'category',
        'child_of'  =>  10,
        'fields'    => 'ids'
    );
    $subcats = get_terms($args);

    if(is_category($subcats)) {
        return TEMPLATEPATH . '/category-publicaciones.php';
    } else {
        return $original_template;
    }
}