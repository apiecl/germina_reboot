<?php
/**
 * Main Index File
 *
 * @package germina_reboot
 */

?>

<?php get_header();?>

<div class="container">
	<div class="row">
		<div class="content col-md-9">
		
		<?php if ( have_posts() ) : while ( have_posts() ) : the_post();?>
		
			<article <?php post_class();?> >
		
				<header>
					<span class="cats"><?php the_category( ' ' );?></span> | <span class="fecha"><?php the_time( 'F Y' );?></span>
					<h1 class="post-title"><a href="<?php the_permalink();?>"><?php the_title();?></a></h1>
					<span class="autores">por <?php germina_authors();?></span>
				</header>
		
		
		
				<div class="excerpt">
					<?php the_excerpt();?>
				</div>
		
				<footer class="tax">
					<p><?php the_terms( $post->ID, 'areas', 'Áreas: ', ', ' );?></p>
					<p><?php the_terms( $post->ID, 'tema', 'Tema: ', ', ' );?></p>
					<p><?php the_tags( 'Etiquetas: ', ', ' );?> </p>
				</footer>
		
			</article>
		
		<?php endwhile;?>
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
