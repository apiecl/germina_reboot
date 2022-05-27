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

			<div class="col-md-3 item-image">

				<?php the_post_thumbnail( 'medium' );?>

			</div>

		<?php endif;?>


		<div class="content <?php echo $single_column;?>">

		<?php if(have_posts()): while(have_posts()): the_post();?>

			<article <?php post_class();?> >

				<header class="header-single">
					<div class="single-item-meta-top">
						<span class="cats"><?php the_category(' . ');?></span> <i class="fa fa-angle-left"></i> <span class="fecha"><?php the_time('F Y');?></span>
					</div>
					<h1 class="post-title"><?php the_title();?></h1>
					<span class="autores">por <?php germina_authors();?></span>

					
				</header>




				<div class="row">

					<div class="<?php echo $content_column;?>">

						<div class="post-content">
							<?php the_content();?>
						</div>

					</div>


					<?php get_template_part('parts/footer-single');?>

				</div>

			</article>

			<?php get_template_part('parts/content/proyects-related');?>

			<?php //comments_template();?>

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
