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
		$desc = get_post_meta( $somos_id, 'texto_presentacion_home', true );
		$pretitulo_home = get_post_meta( $somos_id, 'pre_titulo_home', true);
		?>


		<div class="germina-presentation-home col-md-4 col-xs-12 col-md-offset-1">
			<div class="presentation-logohome">
				<h2 class="pretitulo"><?php echo $pretitulo_home;?></h2>
				<h1>GERM<span></span>NA</h1>
				<div class="textdesc">
				 <?php
   				 // Obtener el valor del párrafo personalizado desde el Personalizador
   				 $parrafo_personalizado = get_theme_mod('parrafo_personalizado', '');

   				 // Obtener el valor del texto fuerte personalizado desde el Personalizador
    			$bold_personalizado = get_theme_mod('bold_personalizado', '');

   				 // Verificar si hay un párrafo personalizado y mostrarlo, de lo contrario, mostrar el valor predeterminado
   				 if ($parrafo_personalizado || $bold_personalizado) {
    			    echo '<p>' . wp_kses_post($parrafo_personalizado) . '<br><strong>' . esc_html($bold_personalizado) . '</strong></p>';
  				  } else {
   			     // Si no hay párrafo personalizado ni texto fuerte personalizado, mostrar el contenido original
   			     echo apply_filters('the_content', $desc);
  				  }
   				 ?>
			</div>
			</div>
		</div>

		<div class="col-md-6 col-xs-12">

			<?php get_template_part('parts/video');?>

		</div>


	</div>

	<!-- <div class="row">
		<div class="col-md-10 col-md-offset-1 definition-container">
			<h2 class="definition animated fadeIn"><?php echo $somos->post_excerpt;?></h2>
		</div>
	</div> -->

</div><!--end first container-->

<?php get_template_part('parts/metodologia-boxes');?>

		<?php 
		$args = array(
			'title' 		=> 'Centro de Documentación',
			'subtitle' 		=> 'Últimas publicaciones',
			'menu_name'		=> 'cedoc',
			'content_type'	=> 'documentos',
			'max_items'		=> 4
			);

		cur_get_template( 'home-section-cedoc.php', $args, 'parts/' );
		
		?>

		<?php 
		$args = array(
			'title' 		=> 'Portafolio',
			'subtitle' 		=> 'Más recientes',
			'menu_name'		=> 'portafolio',
			'content_type'	=> 'proyectos',
			'max_items'		=> 100
			);

		cur_get_template( 'home-section-cedoc.php', $args, 'parts/' );
		
		?>

		<?php 
		$args = array(
			'title' 		=> 'Novedades',
			'subtitle' 		=> 'Más recientes',
			'menu_name'		=> 'portada',
			'content_type'	=> 'novedades',
			'max_items'		=> 4
			);

		cur_get_template( 'home-section-cedoc.php', $args, 'parts/' );
		
		?>

<?php get_footer();?>
