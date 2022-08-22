<?php
/*
* Template Name: Archivo Proyectos
*/

$nolasts = -1;
$args = array(
								'post_type' => 'resumen-proyecto',
								'numberposts' => $nolasts,
								'posts_per_page' => $nolasts,
								'post_status' => 'publish'
							);

					$lastproyects = get_posts( $args );
					$countproyects = count($lastproyects);
?>

<?php get_header();?>

<header class="section-header">
				<h1>Proyectos</h1>
			</header>	

<div class="container archive-proyectos">
	<div class="row">
	
		<div class="col-md-4 col-md-offset-1 filter-column" data-id="proyect-nav">
			<h4 class="filter-heading-toggle" data-target="#taxonomy-accordion">
				Filtrar por  <span class="clean hidden">Limpiar filtros</span><i class="fa fa-chevron-up"></i> 
			</h4>
			<?php get_template_part('parts/content/proyects-filter');?>
			<?php cur_get_template('date-sorter-ajax.php', array('class' => ''), '/parts/');?>
		</div>
		<div class="content col-md-7">

			<h2 class="section-description-title taxtitle">Últimos proyectos</h2>
			<p class="search-results-count project-results-count" data-item="proyectos" data-item-singular="proyecto"  data-item-plural="proyectos"><strong><?php echo $countproyects;?> proyectos</strong></p>
			<div class="full-proylist row">
				<!-- Ajax call for proyects -->
				<!-- Llamada inicial de los últimos proyectos -->

				<?php

					

					foreach( $lastproyects as $lastproyect ) {
						
						$args['id'] = $lastproyect->ID;
						$args['year'] = germina_getplainterms( $lastproyect->ID, 'year', '', ' • ');
						cur_get_template('proyect-item-medium.php', $args, 'parts/content/');

					}

				?>
			</div>

			<!-- <button class="proyect-call btn btn-info loadmore hidden" data-reuse="1"><i class="fa fa-plus"></i> Cargar más proyectos</button> -->

		</div>

	</div>
</div>

<?php get_footer();?>
