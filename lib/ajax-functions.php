<?php 

/**
 * ajax-functions.php
 *
 * Theme main ajax functions file
 *
 * @link http://germina.cl
 * @since [21.04.2016]
 *
 * @package germina_reboot
 */

function germina_proyects_by_term() {
	/**
	 * Returns a list of proyects by term with some offset for pagination
	 */
	
	$termid = $_POST['termid'];
	$tax = $_POST['tax'];
	$offset = $_POST['offset'];
	$output = '';
	$type = $_POST['itemtype'];

	$countargs = array(
		'post_type' => $type,
		'posts_per_page' => -1,
		'tax_query'	=> array(
				array(
					'taxonomy' 	=> $tax,
					'field'		=> 'term_id',
					'terms'		=> $termid
					)
				)
	);
	if($type == 'post') {
		$countargs['tax_query'] = array(
									array(
										'taxonomy' 	=> 'category',
										'field'		=> 'term_id',
										'terms'		=> 10
										),
									array(
										'taxonomy' 	=> $tax,
										'field'		=> 'term_id',
										'terms'		=> $termid
										)
									);

	};

	$countitems = new WP_Query($countargs);
	$noitems = $countitems->post_count;

	$args = array(
				'post_type' => $type,
				'numberposts' => 5,
				'orderby' => 'date',
				'order' => 'DESC',
				'offset' => $offset
			);

	$args['tax_query'] = array(
							array(
								'taxonomy' => $tax,
								'field' => 'term_id',
								'terms' => $termid
								)
							);

	if($type == 'post') {
		$args['tax_query'] = array(
									array(
										'taxonomy' 	=> 'category',
										'field'		=> 'term_id',
										'terms'		=> 10
										),
									array(
										'taxonomy' 	=> $tax,
										'field'		=> 'term_id',
										'terms'		=> $termid
										)
									);
	};

	$proyects = get_posts($args);
	$actualcount = count($proyects);
	$actual = $offset + $actualcount;
	$proyect_items['total'] = $noitems;
	$proyect_items['actual'] = $actual;
	$proyect_items['isfinalquery'] = $actual == $noitems  ? 'limit' : 'remaining';
	$proyect_items['offset'] = $offset;
	//El título de la taxonomía
	
	$term_title = get_term( $termid, $tax );

	$proyect_items['taxname'] = $term_title->name;
	$proyect_items['term_id'] = $term_title->term_id;
	$proyect_items['tax_slug'] = $tax;

	//El contenido

	foreach($proyects as $proyect) {

		$thumbnail_id = get_post_thumbnail_id( $proyect->ID );
		$thumbnail_img = wp_get_attachment_image_src( $thumbnail_id, '120x120' );
		$thumbnail_src = ($thumbnail_img ? $thumbnail_img[0] : '');
		
		$proyect_items['items'][] = array(
							'post_title' => $proyect->post_title,
							'post_id' => $proyect->ID,
							'post_link' => get_permalink($proyect->ID),
							'post_area' => germina_getplainterms($proyect->ID, 'areas', '', ' . '),
							'post_temas' => germina_getplainterms($proyect->ID, 'tema', '', ' . ' ),
							'post_year' => germina_getplainterms($proyect->ID, 'year', '', ' . '),
							'post_thumbnail' => $thumbnail_src
						);	

	}

	$output = json_encode($proyect_items);

	echo $output;

	die();

}

add_action( 'wp_ajax_nopriv_germina_proyects_by_term', 'germina_proyects_by_term' );
add_action( 'wp_ajax_germina_proyects_by_term', 'germina_proyects_by_term' );