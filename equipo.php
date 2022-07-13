<?php
/*
Template Name: Equipo
*/
?>
<?php get_header();?>

<div class="container">
	<div class="row">

<div class="content col-md-12">

<?php if(have_posts()): while(have_posts()): the_post();?>

	<article <?php post_class();?> >

		<header>
			<h1 class="post-title"><?php the_title();?></h1>
		</header>



		<div class="post-content">
			<?php the_content();?>
		</div>

			
				<div class="sub-content sub-content-equipo row">

					<div class="flex-container">
					<?php
						$args = array(
							'child_of' => 20,
							'numberposts' => -1,
							'sort_column' => 'menu_order'
							);
						$equipos = get_pages($args);
						
							foreach($equipos as $equipo){
								$thumb = wp_get_attachment_image_src( get_post_thumbnail_id($equipo->ID), '200x200');
								?>
								<?php
								$targs = array(
									'id' => $equipo->ID,
									'img' => $thumb[0]
									);
								cur_get_template('team-item.php', $targs, '/parts/content/');?>
							<?php
								}
							?>
							
						</div>
				</div>

				<div class="sub-content colaboran row">

				<h3 class="section-description-title">Colaboran</h3>

					<div class="flex-container">
					
					<?php
						$args = array(
							'child_of' => 802,
							'numberposts' => -1,
							'sort_column' => 'menu_order',
							);
						$equipos = get_pages($args);
						
							foreach($equipos as $equipo){
								$thumb = wp_get_attachment_image_src( get_post_thumbnail_id($equipo->ID), '200x200');
						
								$targs = array(
									'id' => $equipo->ID,
									'img' => $thumb[0]
									);
								cur_get_template('team-item.php', $targs, '/parts/content/');?>
						
							<?php
								}
							?>
								
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
