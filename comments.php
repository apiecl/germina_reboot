<?php // Do not delete these lines
if ('comments.php' == basename($_SERVER['SCRIPT_FILENAME']))
	die ('Please do not load this page directly. Thanks!');

	if (!empty($post->post_password)) { // if there's a password
		if ($_COOKIE['wp-postpass_' . COOKIEHASH] != $post->post_password) {  // and it doesn't match the cookie
		?>

		<p class="nocomments">This post is password protected. Enter the password to view comments.</p>

		<?php
		return;
	}
}

/* This variable is for alternating comment background */

?>

<!-- You can start editing here. -->

<?php if ($comments) : ?>
	<h2 id="comments" class="section-description-title"><?php comments_number('', 'Comentarios', 'Comentarios' );?></h2>

	<!-- <div class="small">
		<span class="feedlink"><?php post_comments_feed_link('Feed'); ?></span>
		<?php if ('open' == $post-> ping_status) { ?><span class="trackbacklink"><a href="<?php trackback_url() ?>" title="Copy this URI to trackback this entry.">Trackback</a></span><?php } ?>
	</div> -->

	<?php 
	$args = array(
		'max_depth' => 2,
		'walker' => new Germina_comments_walker()
		);

	wp_list_comments( $args );?>


<?php else : // this is displayed if there are no comments so far ?>

	<?php if ('open' == $post->comment_status) : ?>
		<!-- If comments are open, but there are no comments. -->

	<?php else : // comments are closed ?>
		<!-- If comments are closed. -->

		<p class="nocomments"><!--Los comentarios están cerrados.--></p>

	<?php endif; ?>
<?php endif; ?>


<?php if ('open' == $post->comment_status) : ?>

	<div id="respond">

	<h2 class="section-description-title">Deja un comentario</h2>

	<?php if ( get_option('comment_registration') && !$user_ID ) : ?>
		<p>Debes estar <a href="<?php echo get_option('siteurl'); ?>/wp-login.php?redirect_to=<?php the_permalink(); ?>">registrado</a> para comentar.</p>
	<?php else : ?>

		
			<form action="<?php echo get_option('siteurl'); ?>/wp-comments-post.php" method="post" id="commentform">
				<?php comment_id_fields(); ?> 
				<?php if ( $user_ID ) : ?>
			
					<p>Registrado como <a href="<?php echo get_option('siteurl'); ?>/wp-admin/profile.php"><?php echo $user_identity; ?></a>. <a href="<?php echo get_option('siteurl'); ?>/wp-login.php?action=logout" title="Log out of this account">Salir &raquo;</a></p>
			
				<?php else : ?>
					
					
			
					<p><input type="text" name="author" id="author" value="<?php echo $comment_author; ?>" size="22" tabindex="1" placeholder="Nombre (requerido)" />
						<label for="author"><small>Nombre <?php if ($req) echo "(required)"; ?></small></label></p>
			
						<p><input type="text" name="email" id="email" value="<?php echo $comment_author_email; ?>" size="22" tabindex="2" placeholder="Email (requerido)" />
						<label for="email"><small>Email <?php if ($req) echo "(required)"; ?></small></label></p>
			
							
							<?php endif; ?>
			
							<!--<p><small><strong>XHTML:</strong> You can use these tags: <code><?php echo allowed_tags(); ?></code></small></p>-->
			
							<p><textarea name="comment" id="comment" cols="10" rows="20" tabindex="4"></textarea></p>
			
							<p><input class="btn btn-success" name="submit" type="submit" id="submit" tabindex="5" value="Enviar comentario" />
								<input type="hidden" name="comment_post_ID" value="<?php echo $id; ?>" />
							</p>
							<?php do_action('comment_form', $post->ID); ?>

							<div id="cancel-comment-reply">
								<?php cancel_comment_reply_link() ?>
							</div>
			
						</form>
		

				<?php endif; // If registration required and not logged in ?>

		</div>

			<?php endif; // if you delete this the sky will fall on your head ?>