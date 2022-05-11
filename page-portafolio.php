<?php 
/*
Template Name: Portafolio
 */
?>
<?php get_header();?>

<div class="portafolio">
	
	<div class="container">
		<div class="row">
			<div class="col-md-12">
				<h1 class="section-description-title">Portafolio</h1>
			</div>
		</div>
	</div>

	<?php get_template_part('parts/portafolio-items');?>
	

	<div class="container links-bottom-portafolio">
		<div class="row">
			<div class="col-md-4">
				<a href="<?php echo get_category_link( GERMINA_PUBLICACIONES );?>" class="linkportafoliopage" title="Archivo de Publicaciones"><i class="fa fa-plus"></i> Publicaciones</a>
			</div>
			<div class="col-md-4">
				<a href="<?php echo get_permalink( GERMINA_PROYECTOS );?>" title="Archivo de Proyectos" class="linkportafoliopage"><i class="fa fa-plus"></i> Proyectos</a>
			</div>
			<div class="col-md-4">
				<a href="<?php echo get_category_link( GERMINA_ARTICULOS );?>" title="Archivo de Artículos" class="linkportafoliopage"><i class="fa fa-plus"></i> Artículos</a>
			</div>
		</div>
	</div>

</div>

<?php get_footer();?>