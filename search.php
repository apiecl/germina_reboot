<?php
/**
 * Search page
 *
 * Template Name: Buscador
 *
 * @package germina_reboot
 */
?>

<?php get_header();?>

<div class="container">
	<div class="row">
		<div class="col-md-12">
			<header class="section-header">
				<h1><?php echo (get_query_var('s') ? 'Resultados de búsqueda para: <strong>' . get_query_var('s') . '</strong>' : 'Buscar');?></h1>
			</header>


		</div>

		<div class="content col-md-4">
			<h4 class="filter-heading-toggle" data-target="#taxonomy-accordion">
				Filtrar por <i class="fa fa-chevron-up"></i>
			</h4>
			
			<div class="panel panel-default panel-search">
				<?php echo get_search_form();?>	
			</div>

			<?php get_template_part('parts/content/taxonomy-filter');?>
		</div>
		<div class="content col-md-8">
		
		

		<?php if ( have_posts() && get_query_var('s') ) : while ( have_posts() ) : the_post();?>
			
			<?php 
				$args = array(
					'id' => $post->ID,
					);

				cur_get_template('item-medium.php', $args, '/parts/content/');
				
			?>
		
		<?php endwhile;?>

		<div class="pagination">	
			<div class="nav-next"><?php previous_posts_link( '<i class="fa fa-angle-left"></i> Más recientes' ); ?></div>
			<p class="pagination-info"><?php echo $pagedtext;?></p>
			<div class="nav-previous"><?php next_posts_link( 'Más antiguos <i class="fa fa-angle-right"></i>' ); ?></div>
		</div>


		<?php else : ?>
			<article class="not_found">
				
				<?php if ( have_posts()) : while (have_posts()) : the_post();?>
				
					<?php the_content();?>
				
				<?php endwhile;?>
				<?php endif;?>
			
			</article>
		<?php endif;?>
		
		</div>
	</div>
</div>

<?php get_footer();?>
