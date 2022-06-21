<?php
/**
 * Main Index File
 *
 * @package germina_reboot
 */

?>

<?php get_header();?>

<div class="container">
	<div class="row">
		<div class="content col-md-9">
		
		
			<article class="not_found">
				<header>
					<h1>No encontrado</h1>
					
					<?php 
						$notfound = get_post( GERMINA_NOTFOUND );
						echo apply_filters( 'the_content', $notfound->post_content );
					?>

					

				</header>
			</article>
		
		
		</div>
	</div>
</div>

<?php get_footer();?>
