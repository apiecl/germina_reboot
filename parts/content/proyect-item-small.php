<?php 
/**
 * For use with cur_get_template modified function to grab arguments
 * Receives an ID and makes the call from there.
 */

$proyect_id = $args['id'];
$year = $args['year'];

?>

<div class="proyect-item-small">
	<a class="block-item-link" href="<?php echo get_permalink($proyect_id);?>" title="<?php echo get_the_title($proyect_id);?>">
		<div class="proyect-item-meta-top">
			<span class="year"><?php echo $year;?></span>
		</div>
		<h4><?php echo get_the_title($proyect_id);?></h4>

		<div class="proyect-item-meta-bottom">
			
			<?php if(get_post_meta($proyect_id, 'para/con o financiamiento', true)):?>
				
				<span class="agente"><?php echo get_post_meta($proyect_id, 'para/con o financiamiento', true);?></span>
				
			<?php endif;?>
			
		</div>
	</a>
</div>