<?php
/*
General Taxonomy Template
*/
?>

<?php get_header();?>

<div class="container">
	<div class="row">
		<div class="col-md-4 col-md-offset-1 filter-column" data-id="taxonomy-nav">
				<h4 class="filter-heading-toggle" data-target="#taxonomy-accordion">Filtrar <i class="fa fa-chevron-down"></i></h4>
				<?php get_template_part('parts/content/taxonomy-filter');?>	
				<?php cur_get_template('date-sorter.php', array('class' => ''), '/parts/');?>
		</div>
	
	<div class="content col-md-7">

		
		

		<div class="full-proylist row">
			<!-- Ajax call for proyects -->
			<div class="col-md-12">

				<h2 class="section-description-title"><?php single_term_title( );?></h2>

				<?php cur_get_template('typefilter.php', array(), 'parts/');?>

				<p class="search-results-count taxonomy-results-count"><strong><?php echo $wp_query->post_count;?> contenidos</strong></p>

				<?php if(have_posts()): while(have_posts()): the_post();

					

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

					$args['post_area'] 	= germina_getplainterms( $post->ID, 'areas', '', ', ');
					$args['post_temas'] = germina_getplainterms( $post->ID, 'tema', '', ', ');
					$args['post_year'] 	= germina_getplainterms( $post->ID, 'year', '', ', ');

					if(has_post_thumbnail($post->ID) ):
						$args['post_thumbnail'] = $thumbsrc[0];
					endif;

					//echo $compiler->render('tax-item-medium', $data);
					cur_get_template('tax-item-medium.php', $args, 'parts/content');

				endwhile;?>
			<?php endif;?>

				<div class="pagination">	
					<div class="nav-next"><?php previous_posts_link( '<i class="fa fa-angle-left"></i> Más recientes' ); ?></div>
					<p class="pagination-info"><?php echo $pagedtext;?></p>
					<div class="nav-previous"><?php next_posts_link( 'Más antiguos <i class="fa fa-angle-right"></i>' ); ?></div>
				</div>

		</div>

		<!-- <button class="proyect-call btn btn-info loadmore hidden" data-reuse="1"><i class="fa fa-plus"></i> Cargar más proyectos</button> -->
	</div>
</div>

</div>
</div>

<?php get_footer();?>
