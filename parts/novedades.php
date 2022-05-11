<div class="row novedad-destacada">
		<div class="col-md-8 col-md-offset-2">
			<h1 class="section-description-title">Novedades</h1>	
		</div>

		<div class="col-md-8 col-md-offset-2">
			<?php

			$menu_name = 'portada';
			$locations = get_nav_menu_locations();
			$menu_id = $locations[ $menu_name ] ;

			$menu = wp_get_nav_menu_object($menu_id);
			$menuitems = wp_get_nav_menu_items($menu->term_id);

			if($menuitems) {

				$compiler = include( get_template_directory() . '/lib/mustache-compiler.php');

				foreach($menuitems as $item) {

						$postitem = get_post( $item->object_id );
						if($item->type == 'custom'):
							$excerpt = $item->description;
						else:
							$excerpt 	=	$postitem->post_excerpt ? $postitem->post_excerpt : string_limit_words( $postitem->post_content, 32);
						endif;
						

					$data = array(
							'id'	 		=> $item->object_id,
							'year' 			=> germina_getplainterms( $item->object_id, 'year', '', ', ' ),
							'type' 			=> germina_itemtype( $item->object_id ),
							'type_label' 	=> germina_itemtypelabel( $item->object_id ),
							'post_title' 	=> get_the_title( $item->object_id ),
							'post_link' 	=> $item->url,
							'post_date'		=> get_the_time( 'F Y', $item->object_id ),
							'post_excerpt' 	=> $excerpt
							);

							if(get_post_meta($item->object_id, 'imagen_portada', true)):
								$thumbnail = get_post_meta($item->object_id, 'imagen_portada', true);
								$thumbsrc = wp_get_attachment_image_src( $thumbnail, '200x200' );
							else:
								$thumbnail = get_post_thumbnail_id( $item->object_id );
								$thumbsrc = wp_get_attachment_image_src( $thumbnail, 'medium' );
							endif;

							
							$thumbsrc = $thumbsrc[0];

							

							$data['post_area'] 	= germina_getplainterms( $item->object_id, 'areas', '', ' • ');
							$data['post_temas'] = germina_getplainterms( $item->object_id, 'tema', '', ' • ');
							$data['post_year'] 	= germina_getplainterms( $item->object_id, 'year', '', ' • ');

							if($thumbsrc):
								$data['post_thumbnail'] = $thumbsrc;
							endif;

							if(in_category( GERMINA_CATNOVEDADES, $item->object_id )) {
								echo $compiler->render('item-novedad-large', $data);
							} elseif($item->type == 'custom') {
								echo $compiler->render('item-custom', $data);	
							} else {
								echo $compiler->render('item-large', $data);	
							}
							

				}

			}

			?>
		</div>
	</div>