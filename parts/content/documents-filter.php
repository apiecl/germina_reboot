<?php
/**
 * Documents Nav template
 *
 * @package  GerminaReboot
 * @subpackage  content_templates
 */
?>

<div class="panel-group tax-filter" id="taxonomy-accordion" role="tablist" aria-multiselectable="true">
	
	<?php
	$current_term = get_queried_object();
	$childtermsarray = [];
	$taxonomies = ['areas', 'ambitos_de_accion','tema','category'];
	foreach($taxonomies as $taxonomy):
		$taxobj = get_taxonomy( $taxonomy );
		$taxlabels = get_taxonomy_labels( $taxobj );
			//var_dump($taxlabels);
		//Chequear para publicaciones

		if($taxonomy == 'category') {
			$args = array(
				'taxonomy' => 'category',
				'parent'   => 10
			);
		} else {
			$args = array(
				'taxonomy' => $taxonomy,
				'parent'   => 0
			);
		}

		
		$terms = get_terms($args);
		?>

		<div class="panel panel-default">		
			<div class="panel-heading" role="tab" id="heading-<?php echo $taxonomy;?>">
				<h4 class="panel-title">
					<a role="button" data-toggle="collapse" data-type="post" data-parent="#taxonomy-accordion" href="#taxpanel-<?php echo $taxonomy;?>"><?php echo $taxonomy == 'category' ? 'Formato' : $taxlabels->name;?> <i class="fa fa-chevron-down"></i></a>
				</h4>
			</div>

			<div class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading-<?php echo $taxonomy;?>" id="taxpanel-<?php echo $taxonomy;?>">
				<div class="panel-body">
					<?php foreach($terms as $term) {

						$childtermargs = array(
							'taxonomy' 	=> $taxonomy,
							'parent'	=> $term->term_id
						); 

						$childterms = get_terms($childtermargs);
						if($childterms) {
								//pongo además el parent para que pueda ser clickeable
								$childtermsarray[$term->term_id][] = $term;
								
							foreach($childterms as $childterm) {
								$childtermsarray[$term->term_id][] = $childterm;
							}

						}

						?>
						<a href="#" data-type="post" class="btn btn-large btn-filter btn-default <?php echo $childterms ? 'childterms-call' : 'proyect-call';?>" data-reuse="0" data-termslug="<?php echo $term->slug;?>" data-term="<?php echo $term->term_id;?>" data-tax="<?php echo $taxonomy;?>"><?php echo $term->name;?> <?php echo $childterms ? '<i class="fa fa-chevron-down"></i>' : '' ;?></a>
						<?php


					};?>
				</div>
			</div>
		</div>


	<?php endforeach;?>
	

</div>

<div class="panel-group subterm-filter">
	<?php
	//var_dump($childtermsarray);
	foreach($childtermsarray as $key=>$childtersmarr){
		$parent_term = get_term( $key );
		//var_dump($childtermsarr);
		?>

		<div class="panel panel-default subpanel hidden" id="childpanel-<?php echo $parent_term->slug;?>">
			<div class="panel-heading" role="tab" id="heading-<?php echo $childtermarr->name;?>">
				<h4 class="panel-title">
					<a role="button" data-toggle="showparent" data-parent="#taxonomy-accordion" href="#subtermpanel-<?php echo $parent_term->slug;?>"><?php echo $parent_term->name;?> 
					<span class="fa-stack fa-lg">
						<i class="fa fa-circle fa-stack-1x"></i>
						<i class="fa fa-times fa-stack-1x"></i>
					</span>
					</a>
				</h4>
			</div>
			
			<div class="panel-collapse collapse in" role="tabpanel" aria-labelledby="heading-<?php echo $parent_term->slug;?>" id="subtermpanel-<?php echo $parent_term->slug;?>">
				<div class="panel-body">
				<?php foreach($childtermsarray[$key] as $childterm) {
					?>

					<a href="#" class="btn btn-large btn-filter btn-default proyect-call" data-type="post" data-reuse="0" data-term="<?php echo $childterm->term_id;?>" data-tax="<?php echo $childterm->taxonomy;?>"><?php echo $childterm->name;?></a>

					<?php
				}?>
				</div>
			</div>
		</div>

		<?php
	}
	?>

</div>