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

?>

<div class="tax-filter">

	<a href="#" class="btn btn-info visible-xs-block" data-target="taxonomy-nav" data-function="toggle-nav"><i class="fa fa-times"></i> Cerrar</a>

	<h2 class="section-description-title"><i class="fa fa-caret-right"></i> Áreas de acción</h2>

	<div class="btn-group-vertical btn-group-sm">
		<?php
		$areas = get_terms( 'areas', array('orderby' => 'name') );

		foreach($areas as $area):

			$active = $current_term->term_id == $area->term_id ? 'active' : '';

			?>

			<a href="<?php echo get_term_link( $area->term_id, 'areas' );?>" class="btn btn-default proyect-call <?php echo $active; ?>" data-reuse="0" data-term="<?php echo $area->term_id;?>" data-tax="areas">

				<?php echo $area->name;?>

			</a>

		<?php
		endforeach; ?>
	</div>

	<h2 class="section-description-title"><i class="fa fa-caret-right"></i> Temas</h2>

	<div class="btn-group-vertical btn-group-sm">

	<?php
		$temas = get_terms( 'tema', array('orderby' => 'name') );

		foreach($temas as $tema):

			$active = $current_term->term_id == $tema->term_id ? 'active' : '';

			?>

			<a href="<?php echo get_term_link( $tema->term_id, 'tema' );?>" class="btn btn-default proyect-call <?php echo $active;?>" data-reuse="0" data-term="<?php echo $tema->term_id;?>" data-tax="tema">

				<?php echo $tema->name;?>

			</a>

		<?php
		endforeach; ?>

	</div>

</div>
