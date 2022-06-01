<section class="centro-de-documentacion-home">
	<h3 class="home-section-title"><?php echo $args['title'];?></h3>
	<div class="container">
		<div class="row">
			<div class="col-md-8 col-md-offset-2">
				
				<p><?php echo $args['subtitle'];?></p>

				<?php 

				$maxhomeitems 	= $args['max_items'];
				$menu_name 		= $args['menu_name'];
				$locations 		= get_nav_menu_locations();
				$menu_id		= $locations[ $menu_name ];
				$menu 			= wp_get_nav_menu_object($menu_id);
				$menuitems		= wp_get_nav_menu_items($menu->term_id);
				$itemcount 		= 0;

				if($menuitems) {
					foreach($menuitems as $menuitem) {
						if($itemcount < $maxhomeitems) {

							$itemcount++;
							$postitem = 	get_post($menuitem->object_id);
							$excerpt 	=	$postitem->post_excerpt ? apply_filters( 'the_content', $postitem->post_excerpt ) : string_limit_words( $postitem->post_content, 48);

							?>

							<div class="<?php echo get_post_type($postitem->ID) == 'resumen-proyecto' ? 'item-medium item-medium-proyecto' : 'item-medium';?> <?php echo has_post_thumbnail( $postitem->ID ) ? 'with-image' : 'no-image';?>">
								<a href="<?php echo get_permalink($postitem->ID);?>" class="block-item-link">
									<div class="item-meta-top">
										<span class="item-type">
											<?php echo get_post_type($postitem->ID) == 'resumen-proyecto' ?  germina_theplainterms($postitem->ID, 'ambitos_de_accion', '') : germina_getplaincats($postitem->ID);?>
										</span>
									</div>

									<h2><?php echo get_the_title($postitem->ID);?></h2>

									<?php if(has_post_thumbnail( $postitem->ID )):?>
										<?php echo get_the_post_thumbnail( $postitem->ID, '200x200' );?>
									<?php endif;?>

									<div class="proyect-item-meta-bottom">

										<?php if(get_post_meta($postitem->ID, 'para/con o financiamiento', true)):?>

											<span class="agente"><?php echo get_post_meta($postitem->ID, 'para/con o financiamiento', true);?></span>

										<?php endif;?>

										<div class="temas">
											<?php germina_theplainterms( $postitem->ID, 'tema', '<span>Temas:</span> ', ', ' );?>
										</div>
										<div class="years">
											<?php germina_theplainterms( $postitem->ID, 'germina_year', '<span>Año:</span> ', ', ' );?>
										</div>	
										
									</div>
								</a>
							</div>

						

						
						<?php
								}	
							}
						}
				?>
			</div>
		</div>
	</div>

</section>