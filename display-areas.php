<?php
/**
 * Template for Areas
 *
 * @package GerminaReboot
 * @subpackage page_templates
 *
 * Template Name: Display Áreas
 */

?>

<?php get_header();?>

<div class="container">
	<div class="row">
		<div class="content col-md-8 col-md-offset-2">

		<?php if ( have_posts() ) : while ( have_posts() ) : the_post();?>

			<article <?php post_class();?> >

				<header class="header-areas">
					<h1 class="post-title"><?php the_title();?></h1>
				</header>

				<div class="post-content">

					<?php the_excerpt();?>

				</div>

					<div role="tabpanel" class="areas-tabs">
						<!-- Nav tabs -->
						<ul class="nav nav-tabs" role="tablist">
							<li role="presentation" class="active">
								<a href="#proyectos" aria-controls="proyectos" role="tab" data-toggle="tab">Proyectos</a>
							</li>
							
							<li role="presentation">
								<a class="artpubs-tabs" href="#publicaciones" aria-controls="publicaciones" role="publicaciones" data-toggle="tab">Artículos y publicaciones</a>
							</li>
						</ul>

						<!-- Tab panes -->
						<div class="tab-content">
							<div role="tabpanel" class="tab-pane active" id="proyectos">
								<?php
									get_template_part( 'parts/content/proyects-by-year-tab' );
								?>
							</div>

							<?php if(is_page('gestion-social')){ ?>

								<div role="tabpanel" class="tab-pane" id="campanas">
									<?php
										get_template_part( 'parts/content/campanas-tab' );
									?>
								</div>

							<?php }?>

							<div role="tabpanel" class="tab-pane" id="publicaciones">
								<?php
									get_template_part( 'parts/content/articles-tab' );
								?>
							</div>
						</div>
					</div>


					<?php
					$args = array(
							'post_parent' => $post->ID,
							'post_type'   => 'page',
							);
					$subpage = new WP_Query( $args );

						while ( $subpage->have_posts() ) : $subpage->the_post();?>

							<div class="text-content ambitos">
								<h4><?php the_title();?></h4>
								<?php the_content();?>
							</div>

						<?php endwhile;
						wp_reset_postdata();

						?>

						<div class="text-content extra-areas"><?php the_content();?></div>



				<footer class="tax">

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
