<?php get_header();?>

<div class="container">
	<div class="row">


		<div class="content col-md-8">

		<?php if(have_posts()): while(have_posts()): the_post();?>

			<article <?php post_class();?> >

				<header class="header-single">
					<div class="single-item-meta-top">
						<span class="cats">Boletín</span> <i class="fa fa-angle-left"></i> <span class="fecha"><?php the_time('F Y');?></span>
					</div>
					<h1 class="post-title"><?php the_title();?></h1>

					<?php get_template_part('parts/share');?>
				</header>




				<div class="row">

					<div class="<?php echo $content_column;?>">

						<div class="post-content">
							<?php the_content();?>
						</div>

						<?php if(has_post_thumbnail()):?>
							<div class="boletin-bigimg" style="text-align:center;">
								<a title="Ver boletín" target="_blank" href="<?php echo get_post_meta($post->ID, 'boletin_url', true);?>">
									<?php the_post_thumbnail('full');?>
								</a>
							</div>
						<?php endif;?>

					</div>


					<?php get_template_part('parts/footer-single');?>

				</div>

			</article>

			

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

		<div class="col-md-4">

			<div class="boletines-anteriores">
				
				<?php 
					$bargs = array(
						'numberposts' => 3,
						'exclude' => $post->ID,
						'post_type' => 'boletin'
						);
					$boletines = get_posts($bargs);

					if($boletines):

					?>
					
					<h3 class="section-description-title">Boletines anteriores</h3>

					<?php

					foreach($boletines as $boletin) {

						$args = array(
							'id' => $boletin->ID
							);

						cur_get_template('item-medium.php', $args, '/parts/content/');

					}

					endif;

				?>

				<a href="<?php echo get_post_type_archive_link( 'boletin' );?>" class="btn btn-info">
					<i class="fa fa-plus"></i> Ver todos los boletines
				</a>

			</div>

			

			<div class="suscribete-en-single">
				
				<h3 class="section-description-title">Suscríbete a nuestro boletín</h3>

				<?php get_template_part('parts/mailchimp');?>

			</div>
		</div>

	</div>
</div>

<?php get_footer();?>
