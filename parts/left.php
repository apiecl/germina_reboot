<div class="container atleft">
	<div class="col-md-3 hidden-xs sidebar-logo">
		<a href="<?php bloginfo('url');?>"><img src="<?php bloginfo('template_url');?>/assets/img/germina_logo_200.png" alt="<?php bloginfo('name');?>"></a>
		
		<?php $settings = get_option('germ_options');?>

		<!-- <div class="redes">
			<a id="frhome" href="http://www.flickr.com/photos/<?php echo $settings['germ_flickr'];?>" title="Nuestras fotos en Flickr"/><i class="fa fa-flickr"></i></a>
			<a id="vihome" href="http://www.vimeo.com/<?php echo $settings['germ_vimeo'];?>" title="Nuestros videos en Vimeo"/><i class="fa fa-vimeo"></i></a>
		</div> -->

		<?php get_template_part('parts/address');?>

	</div>