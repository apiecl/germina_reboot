<?php
/**
 * Taxonomy Nav template
 *
 * @package  GerminaReboot
 * @subpackage  content_templates
 */
?>

<?php

	$current_term = get_queried_object();
	$taxonomies = ['tema', 'ambito', 'year', 'estado', 'area'];
	foreach($taxonomies as $taxonomy):
		$taxlabels = get_taxonomy_labels( $taxonomy );
		?>

		<div class="panel-group tax-filter" id="taxonomy-accordion" role="tablist" aria-multiselectable="false">
			<div class="panel panel-default">
				<div class="panel-heading" role="tab" id="heading-<?php echo $taxonomy;?>">
					<h4 class="panel-title">
						<a role="button" data-toggle="collapse" data-parent="taxonomy-accordion" href="taxonomy-<?php echo $taxonomy;?>"><?php echo $taxonomy->name;?></a>
					</h4>
				</div>
				<div class="panel-collapse collapse in" role="tabpanel" aria-labelledby="heading-<?php echo $taxonomy;?>" id="tax-<?php $taxonomy;?>">
					<div class="panel-body">
						
					</div>
				</div>
			</div>
		</div>

<?php endforeach;?>
