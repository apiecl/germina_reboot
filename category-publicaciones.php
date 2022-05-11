<?php
/**
 * Category page
 *
 * for categories-publicaciones
 *
 * @package germina_reboot
 */

?>

<?php get_header();?>

<div class="container">
	<div class="row">
		<div class="content col-md-9 col-md-offset-2">

		<?php 
			$pagedtext = '';
			$paged = get_query_var('paged');
			$totalpages = $wp_query->max_num_pages;
			if($totalpages > 1) {
				if($paged != 0) {
					$pagedtext = '- página ' . $paged . ' de ' . $totalpages;
				} else {
					$pagedtext = '- página 1 de ' . $totalpages;
				}	
			}
			

		?>
		
		<h1 class="section-description-title"><?php single_cat_title( );?> <span class="pagination-info"><?php echo $pagedtext;?></span></h2>

		<div class="publicaciones-wrapper">

			<?php if ( have_posts() ) : while ( have_posts() ) : the_post();?>
				
				<?php 
					$args = array(
						'id' => $post->ID,
						);
			
					cur_get_template('publicacion-item-medium.php', $args, '/parts/content/');
					
				?>
			
			<?php endwhile;?>
			
		</div>

		<div class="pagination">
				<div class="nav-previous alignright"><?php next_posts_link( 'Más antiguos <i class="fa fa-angle-right"></i>' ); ?></div>
				<div class="nav-next alignleft"><?php previous_posts_link( '<i class="fa fa-angle-left"></i> Más recientes' ); ?></div>
			</div>

		<?php else : ?>
			<article class="not_found">
				<header>
					<h1>No encontrado</h1>
					<p><?php get_search_form( true );?></p>
				</header>
			</article>
		<?php endif;?>
		
		</div>
	</div>
</div>

<?php get_footer();?>
