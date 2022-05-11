<?php
/**
 * Search page
 *
 *
 * @package germina_reboot
 */

?>

<?php get_header();?>

<div class="container">
	<div class="row">
		<div class="content col-md-8 col-md-offset-2">
		
		<h1 class="section-description-title">Resultados de búsqueda para: <strong><?php the_search_query();?></strong></h2>

		<?php if ( have_posts() ) : while ( have_posts() ) : the_post();?>
			
			<?php 
				$args = array(
					'id' => $post->ID,
					);

				cur_get_template('item-medium.php', $args, '/parts/content/');
				
			?>
		
		<?php endwhile;?>
		<?php else : ?>
			<article class="not_found">
				<header>
					<h1>No encontrado</h1>
					<p><?php get_search_form( true );?></p>

					<div class="live-search-results"></div>
				</header>
			</article>
		<?php endif;?>
		
		</div>
	</div>
</div>

<?php get_footer();?>
