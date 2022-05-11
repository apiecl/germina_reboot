<?php 
/**
 * For use with cur_get_template modified function to grab arguments
 * Receives an ID and makes the call from there.
 */

$publicacion_id = $args['id'];
$post_title = get_the_title( $publicacion_id );

//Revisa si hay post thumbnail y si no captura la primera página del pdf
if(has_post_thumbnail( $publicacion_id )) {
	
	$thumbnail_id = get_post_thumbnail_id( $publicacion_id );
	$thumbnail_img = wp_get_attachment_image_src( $thumbnail_id, '360x466' );
	$thumbnail_src = $thumbnail_img[0];	

} else {

	$attchid = germina_returnattachedpdf( $publicacion_id );
	$thumbnail_src = germina_pdfpagetopng( $attchid, 360 );

}

?>

<div class="publicacion-item-medium">
	
	<a class="block-item-link" href="<?php echo get_permalink($publicacion_id);?>" title="<?php echo get_the_title($publicacion_id);?>">

		<?php if($thumbnail_src) {
				echo "<img title='{$post_title}' src='{$thumbnail_src}' >";
			}?>

		
		<div class="text-publicacion-item-medium">
			<h4><?php echo $post_title;?></h4>
			<span class="date">
					<?php echo get_the_time( 'Y', $publicacion_id );?>
			</span>
		</div>

	</a>
</div>