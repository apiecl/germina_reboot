<?php
/*
General Taxonomy Template
*/
?>

<?php get_header();?>

<div class="container">
	<div class="row">
		<div class="col-md-8 col-md-offset-1">

		</div>

		<div class="col-md-3 col-md-offset-1 filter-column" data-id="taxonomy-nav">
			<?php get_template_part('parts/content/taxonomy-filter');?>
		</div>
		<div class="content col-md-8">

			<h2 class="section-description-title taxtitle"></h2>

			<div class="full-proylist row">
				<!-- Ajax call for proyects -->
				<div class="col-md-12">

					<a href="#" class="btn btn-info btn-sm visible-xs-inline-block" data-target="taxonomy-nav" data-function="toggle-nav">Otros temas y áreas</a>

					<h2 class="section-description-title"><?php single_term_title( );?></h2>

					<div class="ptype-nav">
						<div class="btn-group btn-group-xs">
							<a href="#" data-filter="resumen-proyecto" class="btn btn-default btn-xs">Proyectos</a>
							<a href="#" data-filter="articulos" class="btn btn-default btn-xs">Artículos</a>
							<a href="#" data-filter="publicaciones" class="btn btn-default btn-xs">Publicaciones</a>
							<a href="#" data-filter="novedades" class="btn btn-default btn-xs">Novedades</a>
						</div>
					</div>


						<?php if(have_posts()): while(have_posts()): the_post();

							//$compiler = include( get_template_directory() . '/lib/mustache-compiler.php');

							$args = array(
									'id' => $post->ID,
									'year' => germina_getplainterms( $post->ID, 'year', '', ', ' ),
									'type' => germina_itemtype( $post->ID ),
									'type_label' => germina_itemtypelabel( $post->ID ),
									'post_title' => $post->post_title,
									'post_link' => get_permalink( $post->ID )
									);

									$thumbnail = get_post_thumbnail_id( $post->ID );
									$thumbsrc = wp_get_attachment_image_src( $thumbnail, '120x120' );

									$args['post_area'] 	= germina_getplainterms( $post->ID, 'areas', '', ' • ');
									$args['post_temas'] = germina_getplainterms( $post->ID, 'tema', '', ' • ');
									$args['post_year'] 	= germina_getplainterms( $post->ID, 'year', '', ' • ');

									if(has_post_thumbnail($post->ID) ):
										$args['post_thumbnail'] = $thumbsrc[0];
									endif;

									//echo $compiler->render('tax-item-medium', $data);
									cur_get_template('tax-item-medium.php', $args, 'parts/content');

							endwhile;?>
						<?php endif;?>

								</div>

								<button class="proyect-call btn btn-info loadmore hidden" data-reuse="1"><i class="fa fa-plus"></i> Cargar más proyectos</button>
					</div>
		</div>

	</div>
</div>

<?php get_footer();?>
