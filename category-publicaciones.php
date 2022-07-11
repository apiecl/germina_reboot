<?php
/*
* Template Name: Centro de documentación
*/
?>

<?php get_header();
	$category = $wp_query->query_vars['category_name'];
	$categoryobj = get_category_by_slug( $category );
	$nolasts = 6;
?>

<div class="container archive-proyectos">
	<div class="row">
		
		<div class="col-md-12">
			<header class="section-header">
				<h1>Centro de documentación</h1>
			</header>	
		</div>

		<div class="col-md-4 col-md-offset-1 filter-column" data-id="proyect-nav">
			<h4 class="filter-heading-toggle" data-target="#taxonomy-accordion">
				Filtrar por <i class="fa fa-chevron-down"></i>
			</h4>
			<?php get_template_part('parts/content/documents-filter');?>
			<?php //cur_get_template('date-sorter-ajax.php', array('class' => ''), '/parts/');?>
		</div>
		<div class="content col-md-7">

			<h2 class="section-description-title taxtitle"><?php echo $category == 'publicaciones' ? 'Últimos documentos' : "Documentos de " . $categoryobj->name;?></h2>
			<p class="search-results-count project-results-count" data-item-singular="documento" data-item-plural="documentos"><strong>Últimos <?php echo $nolasts;?> documentos</strong></p>
			<div class="full-proylist row">
				<!-- Ajax call for proyects -->
				<!-- Llamada inicial de los últimos proyectos -->

				<?php
					
					$args = array(
								'post_type' 	=> 'post',
								'numberposts' 	=> $nolasts,
								'post_status' 	=> 'publish',
								'tax_query'		=> array(
													array(
														'taxonomy' 	=> 'category',
														'field'   	=> 'slug',
														'terms'		=> $category
														)
													)
							);

					$lastproyects = get_posts( $args );

					foreach( $lastproyects as $lastproyect ) {
						
						$args['id'] = $lastproyect->ID;
						$args['year'] = germina_getplainterms( $lastproyect->ID, 'year', '', ' • ');
						cur_get_template('proyect-item-medium.php', $args, 'parts/content/');

					}

				?>
			</div>

			<button class="proyect-call btn btn-info loadmore hidden" data-reuse="1"><i class="fa fa-plus"></i> Cargar más publicaciones</button>

		</div>

	</div>
</div>

<?php get_footer();?>
