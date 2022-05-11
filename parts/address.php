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


		
		<address class="datos-contacto">
			<div class="licencia">
				<a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/"><img alt="Licencia Creative Commons" style="border-width:0" src="https://i.creativecommons.org/l/by-nc/4.0/80x15.png" /></a>
			</div>
			<p><a target="_blank" href="<?php echo $enlace_direccion;?>"><i class="fa fa-map-marker"></i> <?php echo $direccion;?> - <?php echo $comuna;?> - <?php echo $ciudad;?></a></p>
			<p><a href="tel:<?php echo $fono;?>"><i class="fa fa-phone"></i><?php echo $fono; ?></a>

			<?php if ( $fono2 ) : ?>
				<a href="tel:<?php echo $fono2;?>"><i class="fa fa-mobile fa-fw"></i><?php echo $fono2;?></a>
			<?php endif; ?>

				<span class="separator hidden-xs">|</span>
				<br class="visible-xs"/>
				<a href="mailto:<?php echo $email;?>" title="Escríbenos un mail">
					<i class="fa fa-fw fa-envelope"></i> <?php echo $email;?>
				</a>

				<span class="separator hidden-xs">-</span>

				<a style="display:inline-block;" href="<?php echo $facebook;?>" target="_blank"><i class="fa fa-fw fa-facebook-square"></i> Facebook</a> - <a style="display:inline-block" href="<?php echo $linkedin;?>"><i class="fa fa-fw fa-linkedin"></i> Linkedin </a>
				
			</p>
		</address>
