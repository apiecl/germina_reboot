<?php
/*
* Template Name: Archivo Proyectos
*/
?>

<?php get_header();?>

<div class="container archive-proyectos">
	<div class="row">
		

		<div class="col-md-4 col-md-offset-1 filter-column" data-id="proyect-nav">
			<h4 class="filter-heading-toggle" data-target="#taxonomy-accordion">
				Filtrar por <i class="fa fa-chevron-down"></i>
			</h4>
			<?php get_template_part('parts/content/proyects-filter');?>
		</div>
		<div class="content col-md-7">

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