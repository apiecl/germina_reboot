<?php 
			$maxhomeitems = 4;
			$menu_name = 'portafolio';
			$locations = get_nav_menu_locations();
			$menu_id = $locations[ $menu_name ] ;
		
			$menu = wp_get_nav_menu_object($menu_id);
			$menuitems = wp_get_nav_menu_items($menu->term_id);
			
		?>
		
		<?php if($menuitems): 
			  
			  foreach($menuitems as $key=>$item):
				
			  	if( !is_home() || $key < $maxhomeitems ) {

					$postitem = get_post($item->object_id);
					$excerpt 	=	$postitem->post_excerpt ? apply_filters( 'the_content', $postitem->post_excerpt ) : string_limit_words( $postitem->post_content, 48);
			
					$compiler = include( get_template_directory() . '/lib/mustache-compiler.php');
			
					$data = array(
						'id'	 		=> $item->object_id,
						'year' 			=> germina_getplainterms( $item->object_id, 'year', '', ', ' ),
						'type' 			=> germina_itemtype( $item->object_id ),
						'type_label' 	=> germina_itemtypelabel( $item->object_id, true ),
						'post_title' 	=> $item->title,
						'post_link' 	=> get_permalink( $item->object_id ),
						'post_date'		=> get_the_time( 'F Y', $item->object_id ),
						'post_excerpt' 	=> $excerpt
						);

					$data['extra'] = is_home() ? '' : 'true';
			
					if(get_post_meta($item->object_id, 'imagen_portada', true)):
						
						$thumbnail = get_post_meta($item->object_id, 'imagen_portada', true);
						$thumbsrc = wp_get_attachment_image_src( $thumbnail, '200x200' );
					
					else:
						
						$thumbnail = get_post_thumbnail_id( $item->object_id );
						$thumbsrc = wp_get_attachment_image_src( $thumbnail, '200x200' );
			
					endif;
			
					$thumbsrc = $thumbsrc[0];
			
					$data['post_area'] 	= germina_getplainterms( $item->object_id, 'areas', '', '');
					$data['post_temas'] = germina_getplainterms( $item->object_id, 'tema', '', ' • ');
					$data['post_year'] 	= germina_getplainterms( $item->object_id, 'year', '', ' • ');
					$data['post_clientes'] = germina_getplainterms( $item->object_id, 'cliente', '', '');
			
					if($thumbsrc):
						$data['post_thumbnail'] = $thumbsrc;
					endif;

					$clientes = get_the_terms( $item->object_id, 'cliente' );
					
					if($clientes) {
						$client_image = germina_term_image($clientes[0]->term_id, 'cliente', 'medium');

						if($client_image):

							$data['post_client_logo'] = $client_image[0];

						endif;
					}

					if(!is_home()):

						echo '<div class="row item-portafolio-row">';
						echo '<div class="container">';

					endif;
					
					if( $data['type'] == 'publicaciones' ):

						echo $compiler->render('item-portafolio-publicacion-large', $data);

					else:

						if( $thumbsrc ):
							echo $compiler->render('item-portafolio-large', $data);
						else:
							echo $compiler->render('item-portafolio-large-noimage', $data);
						endif;

					endif;

					if(!is_home()):

						echo '</div></div><!--End item-portafolio-row-->';

					endif;
				
				} //End home counter

				endforeach;
			
				endif; 
			
		?>