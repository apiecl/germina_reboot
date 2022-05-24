<?php
/**
 * 
 * Template Name: Home
 * @package  GerminaReboot
 * @subpackage page_templates
 */

?>
<?php get_header();?>

<div class="container">

	<div class="row intro">
		<?php
			$somos_id = 6;
			$somos = get_post( $somos_id );
		?>


			<div class="presentation col-md-4 col-xs-12 col-md-offset-1">
				<div class="presentation-logohome">
					<img src="<?php bloginfo( 'template_url' );?>/assets/img/germina_gris_home.svg" alt="<?php bloginfo( 'name' );?>">
					<span class="animated-element-bottom"></span>
				</div>
			</div>

			<div class="col-md-6 col-xs-12">

					<?php get_template_part('parts/video');?>


			</div>


	</div>

	<div class="row">
		<div class="col-md-10 col-md-offset-1 definition-container">
			<h2 class="definition animated fadeIn"><?php echo $somos->post_excerpt;?></h2>
		</div>
	</div>

	</div><!--end first container-->
	
	<div class="home-portafolio">
		
		<div class="container">
		
			<?php get_template_part('parts/portafolio');?>
			
		</div>

	</div>

	<div class="container linkportafolio">
		<div class="row">
			<div class="col-md-12">
				<a href="/portafolio"><i class="fa fa-plus"></i> Portafolio</a>
			</div>
		</div>
	</div>

	<div class="container">
	
	
		<?php get_template_part('parts/novedades');?>
		

	</div>

<?php get_footer();?>
