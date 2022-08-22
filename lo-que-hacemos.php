<?php 
/*
*
* Template Name: Lo que hacemos
*
*/
?>
<?php get_header();?>

<header class="section-header">
	<h1 class="post-title"><?php the_title();?></h1>
</header>

<div class="container">
	<div class="row">
		<div class="content col-md-8 col-md-offset-2">

			<?php if(have_posts()): while(have_posts()): the_post();?>

				<article <?php post_class();?> >


					<div class="post-content main">
						<?php the_content();?>
					</div>

					<?php 
				//subpaginas
					global $post;
					$args = array(
						'post_type' 	=> 'page',
						'numberposts'	=> -1,
						'post_parent'	=> $post->ID,
						'orderby'		=> 'menu_order',
						'order'			=> 'ASC'
					);

					$subpages = get_posts($args);

					foreach($subpages as $key=>$subpage) {

						?>
						<div class="subcontent <?php echo ($key == 0)? 'first' : 'rest';?>" id="<?php echo $subpage->post_name;?>">
							<header class="subheader">
								<h2><?php echo $subpage->post_title;?></h2>
							</header>

							<div class="post-content sub">
								<?php echo apply_filters('the_content', $subpage->post_content);?>

								<?php //echo germina_taxpanel_get_content('tema');?>
							</div>
						</div>
						<?php
					}

					?>

					<?php get_template_part('parts/metodologia-boxes');?>

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