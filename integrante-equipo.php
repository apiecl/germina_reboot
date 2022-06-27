<?php 
/*
Template Name: Integrante Equipo
*/
?>

<?php get_header();?>

<div class="container">
	<div class="row">

		<div class="content col-md-8">

			<?php if(have_posts()): while(have_posts()): the_post();?>

				<article <?php post_class('integrante-equipo');?> >

					<header class="header-equipo">
						<h1 class="post-title"><?php the_title();?></h1>

						
					</header>

					<?php if(has_post_thumbnail()):?>
							<div class="ficha-equipo">
								<?php the_post_thumbnail('200x200');?>
							</div>
						<?php endif;?>



					<div class="post-content">
						<?php the_content();?>
					</div>

					<div class="equipo-datos">
									<?php if(get_post_meta($post->ID, 'correo', true)):?>
										<p class="label-button-equipo">Correo electrónico</p>
										<p>
											<a class="eqcorreo" href="mailto:<?php echo get_post_meta($post->ID, 'correo', true);?>" title="Escribir un correo a <?php the_title();?>"><i class="fa fa-envelope"></i> <?php echo get_post_meta($post->ID, 'correo', true);?></a>
										</p>
									<?php endif;?>

									<p class="label-button-equipo">Descargar currículum en formato PDF</p>
									<p>
										<?php germina_get_post_attachments('Descargar Curriculum Vitae', 'Currículum');?>
									</p>	

									
										<?php if(get_post_meta($post->ID, 'linkedin', true)):?>
										<p class="label-button-equipo">Enlace a perfil en LinkedIn</p>
										<p>
											<a class="linklinkedin" href="<?php echo get_post_meta($post->ID, 'linkedin', true);?>" target="_blank" title="Perfil en LinkedIn de <?php the_title();?>"><i class="fa fa-linkedin"></i> Linkedin</a>
										</p>
										<?php endif;?>
									
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

	<div class="col-md-4">
		<?php get_template_part('parts/content/team-nav');?>
	</div>

</div>
</div>

<?php get_footer();?>