<?php 
/**
 * For use with cur_get_template modified function to grab arguments
 * Receives an ID and makes the call from there.
 */

$proyect_id = $args['id'];
$year = $args['year'];

$thumbnail_id = get_post_thumbnail_id( $proyect_id );
$thumbnail_img = wp_get_attachment_image_src( $thumbnail_id, '360x466' );
$thumbnail_src = $thumbnail_img[0];



if($thumbnail_src) {
	$class = 'with-image';
} else {
	$class = 'no-image';
}

?>

<div class="document-item-medium zoomIn <?php echo $class;?>">
		
	<a class="block-item-link" href="<?php echo get_permalink($proyect_id);?>" title="<?php echo get_the_title($proyect_id);?>">
			<?php if(has_post_thumbnail($proyect_id)):?>
				<img src="<?php echo $thumbnail_src;?>" alt="<?php echo get_the_title($proyect_id);?>">
			<?php else:?>
				<?php echo germina_docformatlabel($proyect_id);?>
			<?php endif;?>

		<h4><?php echo get_the_title($proyect_id);?></h4>	
		
	</a>

</div>