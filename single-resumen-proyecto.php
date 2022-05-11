<?php get_header();?>

<div class="container">
	<div class="row">

		<?php
			if(has_post_thumbnail( )):
					$single_column = 'col-md-8';
					$content_column = 'col-md-11 col-md-offset-1';
			else:
					$single_column = 'col-md-8 col-md-offset-2';
					$content_column = 'col-md-11 col-md-offset-1';
			endif;
		?>

		<?php if( has_post_thumbnail() ):?>

			<div class="col-md-3 proyect-image">

			<?php the_post_thumbnail( 'medium' );?>

			</div>

		<?php endif;?>

		<div class="content <?php echo $single_column;?>">

		<?php if(have_posts()): while(have_posts()): the_post();?>


			<article <?php post_class();?> >

				<header class="header-single-proyecto">

					<div class="single-item-meta-top">
						<span class="item-type"><a href="<?php echo get_permalink(GERMINA_PROYECTOS);?>" title="Ir a archivo de proyectos">proyectos</a> </span> <i class="fa fa-angle-right"></i>
						<span class="area"><?php the_terms( $post->ID, 'areas', '', ' . ' );?></span>
					</div>

					<h1 class="post-title"><?php the_title();?></h1>

					<div class="single-item-meta-bottom">
						<p class="year"><?php the_terms( $post->ID, 'year', '', ' . ' );?></p>
						<p class="tema"><?php the_terms( $post->ID, 'tema', 'temas <i class="fa fa-angle-right"></i> ', ' &bull; ' );?></p>
					</div>

					<?php get_template_part('parts/share');?>
				</header>

				<div class="row">
					<div class="<?php echo $content_column;?>">
						<div class="post-content">
							<?php the_content();?>
						</div>
					</div>

				</div>

				<?php get_template_part('parts/footer-single');?>

			</article>

			<?php get_template_part('parts/content/proyects-related');?>

		<?php endwhile;?>
		<?php else:?>
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
