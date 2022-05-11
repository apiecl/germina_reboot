<?php get_header();?>

<div class="container">
	<div class="row">
		<div class="content col-md-8 col-md-offset-2">
		
		<?php if(have_posts()): while(have_posts()): the_post();?>
		
			<article <?php post_class();?> >
		
				<header>
					<h1 class="post-title"><?php the_title();?></h1>
				</header>
		
		
		
				<div class="post-content">
					<?php the_content();?>
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