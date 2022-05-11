<?php 
/**
 * For use with cur_get_template modified function to grab arguments
 * Receives an ID and makes the call from there.
 */

$article_id = $args['id'];
$image = $args['img'];

?>

<div class="col-md-3 col-xs-6 equipo-item-column">
	<a class="integrante" href="<?php echo get_permalink($article_id);?>">
		<?php if($image):?>

			<div class="imgwrap">
				<img src="<?php echo $image;?>" title="<?php echo get_the_title($article_id);?>" alt="<?php echo get_the_title($article_id);?>"/>
			</div>

		<?php else:?>

			<div class="imgwrap">
				<img src="http://www.lorempixum.com/120/120/people" alt="No hay imagen"/>
			</div>

			<?php 
			endif;?>

			<h4><?php echo get_the_title($article_id);?></h4> 	

	</a>
</div>