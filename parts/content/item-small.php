<?php
/**
 * For use with cur_get_template modified function to grab arguments
 * Receives an ID and makes the call from there.
 */

$item_id = $args['id'];
$ptype = get_post_type( $item_id );
$ptypeobj = get_post_type_object( $ptype );
?>

<div class="item-small">
	<a class="block-item-link" href="<?php echo get_permalink($item_id);?>" title="<?php echo get_the_title($item_id);?>">
		<div class="item-meta-top">
			<span class="content-type"><?php echo germina_itemtypelabel( $item_id );?></span>
		</div>
		<h4><?php echo get_the_title($item_id);?></h4>

		<div class="proyect-item-meta-bottom">

		</div>
	</a>
</div>
