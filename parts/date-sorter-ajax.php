<?php ?>

		<div class="<?php echo $args['class'];?>" data-id="filter-nav">
			<h4 class="filter-heading-toggle" data-target="#order-accordion">Ordenar por <span class="labelorder"> recientes</span><i class="fa fa-chevron-up"></i></h4>
			<div class="panel-group order-filter" id="order-accordion" role="tablist" aria-multiselectable="true">

				<div class="panel panel-default">
					<div class="panel-heading <?php echo $order == 'descending'? 'active' : ''?>" role="tab" id="heading-descending">
						<h4 class="panel-title">
							<a class="ajax-sort-button" data-sort="descending" role="button" data-sort-label="recientes">Más recientes</a>
						</h4>
					</div>
				</div>
				<div class="panel panel-default">
					<div class="panel-heading <?php echo $order == 'ascending'? 'active' : ''?>" role="tab" id="heading-ascending">
						<h4 class="panel-title">
							<a class="ajax-sort-button" data-sort="ascending" role="button" data-sort-label="antiguos">Más antiguos</a>
						</h4>
					</div>
				</div>
			</div>
		</div>