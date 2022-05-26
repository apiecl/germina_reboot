<?php
/**
 * Taxonomy Nav template
 *
 * @package  GerminaReboot
 * @subpackage  content_templates
 */
?>

<div class="panel-group tax-filter" id="taxonomy-accordion" role="tablist" aria-multiselectable="true">
	
	<?php
		$current_term = get_queried_object();
		$taxonomies = ['tema', 'ambitos_de_accion', 'germina_year', 'estado', 'areas'];
		foreach($taxonomies as $taxonomy):
			$taxobj = get_taxonomy( $taxonomy );
			$taxlabels = get_taxonomy_labels( $taxobj );
			//var_dump($taxlabels);
			$args = array(
						'taxonomy' => $taxonomy,
						'parent'   => 0
					);
			$terms = get_terms($args);
			?>
			
				<div class="panel panel-default">		
					<div class="panel-heading" role="tab" id="heading-<?php echo $taxonomy;?>">
						<h4 class="panel-title">
							<a role="button" data-toggle="collapse" data-parent="#taxonomy-accordion" href="#taxpanel-<?php echo $taxonomy;?>"><?php echo $taxlabels->name;?> <i class="fa fa-chevron-down"></i></a>
						</h4>
					</div>
					
					<div class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading-<?php echo $taxonomy;?>" id="taxpanel-<?php echo $taxonomy;?>">
						<div class="panel-body">
							<?php foreach($terms as $term) {
								?>
									<a href="<?php echo get_term_link( $term->term_id, $taxonomy );?>" class="btn btn-large btn-filter btn-default" data-reuse="0" data-term="<?php echo $term->term_id;?>" data-tax="<?php echo $taxonomy;?>"><?php echo $term->name;?></a>
								<?php
							};?>
						</div>
					</div>
				</div>

	<?php endforeach;?>

</div>