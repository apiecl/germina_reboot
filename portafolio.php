<?php 
/*
* Template Name: Portafolio Items
*
*/
?>

<?php get_header();?>

<div class="container">
	<div class="row">
		<div class="content col-md-12">

			<?php

				$args = array(
					'title' 		=> 'Portafolio',
					'subtitle' 		=> 'Más recientes',
					'menu_name'		=> 'portafolio',
					'content_type'	=> 'portafolio',
					'max_items'		=> 4
				);

				cur_get_template( 'home-section-cedoc.php', $args, 'parts/' );

			?>

		</div>
	</div>
</div>

<?php get_footer();?>