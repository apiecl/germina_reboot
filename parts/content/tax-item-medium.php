<?php 
	$type = $args['type'];
	$label = $args['typelabel'];
	$area = $args['post_area'];
	$title = $args['post_title'];
	$temas = $args['post_temas'];
	$post_thumbnail = $args['post_thumbnail'];
	$image_class = $post_thumbnail ? 'with-image' : 'no-image';
 ?>

<div class="item-<?php echo $type;?> tax-item-medium animated zoomIn <?php echo $image_class;?>" data-type="<?php echo $type;?>">

		<a class="block-item-link" href="<?php echo get_permalink($args['id']);?>" title="<?php echo $title;?>">

			<div class="tax-item-content-wrapper">
				<div class="tax-item-meta-top">
					<span class="tipo"><?php echo $label;?></span> <i class="fa fa-angle-left"></i>
					<span class="area"><?php echo $area;?></span>
				</div>

				<h4><?php echo $title;?></h4>

				<div class="tax-item-meta-bottom">

					<span class="temas">
						<?php echo $temas;?>
					</span>
				</div>
			</div>

			<?php if($post_thumbnail):?>
			<img src="<?php echo $post_thumbnail;?>" alt="<?php echo $title;?>">
			<?php endif;?>
		</a>

</div>