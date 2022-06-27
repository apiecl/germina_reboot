<?php 
$order = isset($_GET['order']) ? $_GET['order'] : 'descending';
?>

		<div class="<?php echo $args['class'];?>" data-id="filter-nav">
			<h4 class="filter-heading-toggle" data-target="#order-accordion">Ordenar por <span class="labelorder"><?php echo $order == 'descending' ? 'recientes' : 'antiguos';?></span><i class="fa fa-chevron-up"></i></h4>
			<div class="panel-group order-filter" id="order-accordion" role="tablist" aria-multiselectable="true">
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