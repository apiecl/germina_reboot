<?php 
if(is_search()) {
	$order = isset($_GET['order']) ? $_GET['order'] : null;
	if(isset($_GET['order']) && $_GET['order'] == 'ascending') {
		$orderlabel = 'antiguos';
	} elseif(isset($_GET['order']) && $_GET['order'] == 'descending') {
		$orderlabel = 'recientes';
	} elseif(!isset($_GET['order'])) {
		$orderlabel = 'relevancia';
	}
} else {
	$order = isset($_GET['order']) ? $_GET['order'] : 'descending';
	$orderlabel = isset($_GET['order']) && $_GET['order'] == 'ascending' ? 'antiguos' : 'recientes';
}

global $wp_query;
?>

		<div class="<?php echo $args['class'];?>" data-id="filter-nav">
			<h4 class="filter-heading-toggle" data-target="#order-accordion">Ordenar por <span class="labelorder"><?php echo $orderlabel;?></span><i class="fa fa-chevron-up"></i></h4>
			<div class="panel-group order-filter" id="order-accordion" role="tablist" aria-multiselectable="true">
				<?php if(is_search()):?>
				
				<div class="panel panel-default">
					<div class="panel-heading <?php echo !isset($_GET['order'])? 'active' : ''?>" role="tab" id="heading-descending">
						<h4 class="panel-title">
							<a href="<?php echo remove_query_arg('order')?>" role="button">Relevancia</a>
						</h4>
					</div>
				</div>
				
				<?php endif;?>

				<div class="panel panel-default">
					<div class="panel-heading <?php echo $order == 'descending'? 'active' : ''?>" role="tab" id="heading-descending">
						<h4 class="panel-title">
							<a href="<?php echo add_query_arg('order', 'descending')?>" role="button">Más recientes</a>
						</h4>
					</div>
				</div>
				<div class="panel panel-default">
					<div class="panel-heading <?php echo $order == 'ascending'? 'active' : ''?>" role="tab" id="heading-ascending">
						<h4 class="panel-title">
							<a href="<?php echo add_query_arg('order', 'ascending')?>" role="button">Más antiguos</a>
						</h4>
					</div>
				</div>
			</div>
		</div>