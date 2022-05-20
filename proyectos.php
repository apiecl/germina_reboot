<?php
/*
Template Name: Archivo Proyectos
*/
?>

<?php get_header();?>

<div class="container">
	<div class="row">
		<div class="col-md-8 col-md-offset-1">

			<?php if(have_posts()): while(have_posts()): the_post();?>

			<article class="content-template-proyectos" >

				<header>
					<h1 class="section-description-title"><?php the_title();?></h1>
					<a href="#" class="btn btn-info visible-xs-inline-block" data-target="proyect-nav" data-function="toggle-nav">Filtrar proyectos</a>
				</header>



				<div class="post-content">
					<?php the_content();?>
				</div>

				<footer class="tax">

				</footer>

			</article>

				<?php endwhile;?>
			<?php endif;?>
		</div>

		<div class="col-md-3 col-md-offset-1 filter-column" data-id="proyect-nav">
			<?php get_template_part('parts/content/proyects-filter');?>
		</div>
		<div class="content col-md-8">

			<h2 class="section-description-title taxtitle">Últimos proyectos</h2>

			<div class="full-proylist row">
				<!-- Ajax call for proyects -->
				<!-- Llamada inicial de los últimos proyectos -->

				<?php

					$args = array(
								'post_type' => 'resumen-proyecto',
								'numberposts' => 6,
								'post_status' => 'publish'
							);

					$lastproyects = get_posts( $args );

					foreach( $lastproyects as $lastproyect ) {
						
						$args['id'] = $lastproyect->ID;
						$args['year'] = germina_getplainterms( $lastproyect->ID, 'year', '', ' • ');
						cur_get_template('proyect-item-medium.php', $args, 'parts/content/');

					}

				?>
			</div>

			<button class="proyect-call btn btn-info loadmore hidden" data-reuse="1"><i class="fa fa-plus"></i> Cargar más proyectos</button>

		</div>

	</div>
</div>

<?php get_footer();?>
