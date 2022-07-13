<?php
/*
Template Name: Contacto
*/
?>

<?php
/**
 * Fallover archive page
 *
 * for categories-items
 *
 * @package germina_reboot
 */

?>
<?php get_header();?>

<header class="section-header">
			<h1><?php the_title();?></h1>
		</header>

<div class="container">
	<div class="row">

		


		<div class="content col-md-8 col-md-offset-2">

			<?php if(have_posts()): while(have_posts()): the_post();?>

				<article <?php post_class();?> >

					<?php
						/**
						 * Settings from the controlpanel
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
						$instagram   = get_post_meta( $contactoid, 'instagram', true);
$youtube   = get_post_meta( $contactoid, 'youtube', true);
						$enlace_direccion = get_post_meta( $contactoid, 'enlace_direccion', true);
						?>

						<div class="post-content row">

							<div class="col-md-6">


								<?php the_content();?>

								<address>
									<p>
										<a target="_blank" href="<?php echo $enlace_direccion;?>"><i class="fa fa-map-marker"></i> <?php echo $direccion;?> - <?php echo $comuna;?> - <?php echo $ciudad;?></a>
									</p>
									
									<?php if($fono2):?>
										<p>
											<i class="fa fa-mobile"></i> <a href="tel:<?php echo $fono2;?>"><?php echo $fono2;?></a>
										</p>
									<?php endif;?>
									<p>
										<i class="fa fa-envelope"></i> <a href="mailto:<?php echo $email;?>"><?php echo $email;?></a>
									</p>
									
									<div class="address-in-contact">
										<?php get_template_part('parts/redes-sociales');?>
									</div>
									

								</address>
							</div>

							<div class="col-md-6 mailchimp-box">

								<?php get_template_part('parts/mailchimp');?>

							</div>

						</div>

						<footer class="tax">

						</footer>

					</article>

				<?php endwhile;?>
			<?php else:?>
				<article class="not_found">
					<header>
						<h1>No encontrado</h1>
						<p><?php get_search_form( true );?></p>
					</header>
				</article>
			<?php endif;?>

		</div>
	</div>
</div>

<?php get_footer();?>
