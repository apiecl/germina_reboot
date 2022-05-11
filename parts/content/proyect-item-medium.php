<?php 
/**
 * For use with cur_get_template modified function to grab arguments
 * Receives an ID and makes the call from there.
 */

$proyect_id = $args['id'];
$year = $args['year'];

$thumbnail_id = get_post_thumbnail_id( $proyect_id );
$thumbnail_img = wp_get_attachment_image_src( $thumbnail_id, '635x300' );
$thumbnail_src = $thumbnail_img[0];

if($thumbnail_src) {
	$class = 'with-image';
} else {
	$class = 'no-image';
}

?>

<div class="proyect-item-medium <?php echo $class;?>" style="background-image:url(<?php echo $thumbnail_src;?>);">
		
	<a class="block-item-link" href="<?php echo get_permalink($proyect_id);?>" title="<?php echo get_the_title($proyect_id);?>">
		<div class="proyect-item-meta-top">
			<span class="area"><?php germina_theplainterms($proyect_id, 'areas', '', ', ');?> | </span>
			<span class="fecha"><?php echo $year;?></span>
		</div>

		<h4><?php echo get_the_title($proyect_id);?></h4>

		<div class="proyect-item-meta-bottom">
			<?php if(get_post_meta($proyect_id, 'para/con o financiamiento', true)):?>
				<span class="agente"><?php echo get_post_meta($proyect_id, 'para/con o financiamiento', true);?></span>
				
			<?php endif;?>
			
			<span class="temas">
				<?php germina_theplainterms( $proyect_id, 'tema', 'Temas: ', ', ' );?>
			</span>
		</div>
	</a>
</div>