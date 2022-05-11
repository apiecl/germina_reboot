<?php 
/**
 * For use with cur_get_template modified function to grab arguments
 * Receives an ID and makes the call from there.
 */

$article_id = $args['id'];
$autores = germina_plainauthors($article_id, 'por ');	
?>


<div class="article-item-small">
	<a href="<?php echo get_permalink($article_id);?>" class="block-item-link">
		<div class="article-item-meta-top">
			<span class="fecha"><?php echo get_the_time('F Y', $article_id);?></span>
		</div>

		<h4><?php echo get_the_title($article_id);?></h4>

		<div class="articule-item-meta-bottom">
			<span class="autorxs"><?php echo $autores;?></span>
		</div>
	</a>
</div>