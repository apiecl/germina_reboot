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
<?php 
global $wp_query;
$count = $wp_query->found_posts;
;?>

<header class="section-header search-section-header">
	
	<h1>Buscador</h1>
</header>

<div class="container">
	<div class="row">
		
		<div class="content col-md-4 col-md-offset-1">
			<h4 class="filter-heading-toggle" data-target="#taxonomy-accordion">
				Buscar <span class="clean hidden" data-clean="clean-search">Limpiar búsqueda</span><i class="fa fa-chevron-up"></i>
			</h4>
			
			

			<?php get_template_part('parts/content/taxonomy-filter');?>
			<?php cur_get_template('date-sorter.php', array('class' => 'filter-column'), '/parts/');?>
		</div>

		<div class="content col-md-7">
			
			<?php if( get_query_var('s')) { ?>
				<p class="search-results-count"><?php echo (get_query_var('s') ? '<span>' . $count . '</span> resultados para: <strong>' . get_query_var('s') . '</strong>' : '');?></p>
				<?php cur_get_template('typefilter.php', array(), 'parts/');?>
			<?php };?>

			

			<?php if ( have_posts() && get_query_var('s') ) : while ( have_posts() ) : the_post();?>
			
			<?php 
			$args = array(
				'id' 	=> $post->ID,
				'type'	=> germina_itemtype($post->ID)
			);

			cur_get_template('item-medium.php', $args, '/parts/content/');
			
			?>
			
		<?php endwhile;?>

		<div class="pagination">	
			<div class="nav-next"><?php previous_posts_link( '<i class="fa fa-angle-left"></i> Más recientes' ); ?></div>
			<p class="pagination-info"><?php echo (isset($pagedtext)? $pagedtext : '');?></p>
			<div class="nav-previous"><?php next_posts_link( 'Más antiguos <i class="fa fa-angle-right"></i>' ); ?></div>
		</div>


	<?php else : ?>
		<article class="not_found">
			<?php 
				$query_var = get_query_var('s');
				
			?>
			<?php if ( !is_search()) : while (have_posts()) : the_post();?>
			
			<div class="noresultszone">
				<?php the_content();?>
			</div>
			
		<?php endwhile;?>
	<?php else: ?>

		<div class="noresultszone">
			<img class="aligncenter" src="<?php bloginfo('template_url');?>/assets/img/noresults.svg" alt="Sin resultados">
			<p>¡Lo sentimos! No hay resultados para tu búsqueda de <strong><?php echo the_search_query();?></strong>. Inténtalo de nuevo o usa el filtro "Todo Sobre"</p>
		</div>
	<?php endif;?>	
</article>
<?php endif;?>

</div>
</div>
</div>

<?php get_footer();?>
