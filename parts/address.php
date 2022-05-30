<?php
/**
 * Address template
 *
 * @package  GerminaReboot
 * @subpackage  content_templates
 */

?>
<?php
		/**
		 * Settings from the page
		 */
		$contactoid = 15;
		$fono 		= get_post_meta( $contactoid, 'telefono', true);
		$fono2		= get_post_meta( $contactoid, 'telefono_2', true);
		$direccion	= get_post_meta( $contactoid, 'direccion', true);
		$ciudad	= get_post_meta( $contactoid, 'ciudad', true);
		$comuna	= get_post_meta( $contactoid, 'comuna', true);
		$email 		= get_post_meta( $contactoid, 'correo', true);
		$twitter    = get_post_meta( $contactoid, 'twitter', true);
		$facebook   = get_post_meta( $contactoid, 'facebook', true);
		$linkedin   = get_post_meta( $contactoid, 'linkedin', true);
		$enlace_direccion = get_post_meta( $contactoid, 'enlace_direccion', true);
		?>


		
		<address class="datos-contacto row">
			<div class="col-md-6 col-sm-12 col-md-push-6">
				<h4>Dirección</h4>

				<p class="address-button"><a target="_blank" href="<?php echo $enlace_direccion;?>"><i class="fa fa-map-marker"></i> <?php echo $direccion;?> - <?php echo $comuna;?> - <?php echo $ciudad;?></a></p>


				<h4>Teléfono</h4>

				<p class="address-button"><a href="tel:<?php echo $fono;?>"><i class="fa fa-phone"></i><?php echo $fono; ?></a></p>

				<?php if ( $fono2 ) : ?>
					<p class="address-button"><a href="tel:<?php echo $fono2;?>"><i class="fa fa-mobile fa-fw"></i><?php echo $fono2;?></a></p>
				<?php endif; ?>

				
				<h4>Correo</h4>
				<p class="address-button">
					<a href="mailto:<?php echo $email;?>" title="Escríbenos un mail">
						<i class="fa fa-fw fa-envelope"></i> <?php echo $email;?>
					</a>
				</p>

			</div>

			<div class="col-md-6 col-sm-12 col-md-pull-6">

				<h4>Redes Sociales</h4>

				<p class="address-button">
					<a style="display:inline-block;" href="<?php echo $facebook;?>" target="_blank"><i class="fa fa-fw fa-facebook-square"></i></a>
				</p>
				
				<p class="address-button">
					<a style="display:inline-block" href="<?php echo $linkedin;?>"><i class="fa fa-fw fa-linkedin"></i></a>
				</p> 


				<div class="licencia">
					<h4>Licencia Creative Commons</h4>
					<a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/"><img alt="Licencia Creative Commons" src="<?php bloginfo('template_url');?>/assets/img/cc_button.svg" /></a>
				</div>

			</div>

		</address>