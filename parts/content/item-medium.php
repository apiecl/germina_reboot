<?php 
/**
 * For use with cur_get_template modified function to grab arguments
 * Receives an ID and makes the call from there.
 */

$item_id = $args['id'];

?>

<div class="item-medium">
	<a class="block-item-link" href="<?php echo get_permalink($item_id);?>" title="<?php echo get_the_title($item_id);?>">
		
		<?php if(is_search()):?>
			<span class="proyect-item-label"><?php echo germina_itemtype($item_id);?></span>
		<?php endif;?>

		

		<h2><?php echo get_the_title($item_id);?></h2>
		
		
			<div class="item-meta-bottom">
				<?php if(!in_category( GERMINA_CATNOVEDADES ) && get_post_type( $item_id ) !== 'boletin' ):?>
					<span class="autores"><?php echo germina_plainauthors( $item_id, 'por ' );?></span>	
				<?php endif;?>
				
				<span class="date">
				<?php if(get_post_type($item_id) == 'resumen-proyecto'): ?>
					Año: <?php echo germina_theplainterms($item_id, 'germina_year');?>
				<?php else: 
					echo get_the_time( 'F Y', $item_id );
				endif;
				?>
				</span>
			</div>
		
	</a>
</div>