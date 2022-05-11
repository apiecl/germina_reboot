<?php
/**
 * Proyect Nav template
 *
 * @package  GerminaReboot
 * @subpackage  content_templates
 */
?>

<div class="proyects-filter">
	
	<a href="#" class="btn btn-info visible-xs-block" data-target="proyect-nav" data-function="toggle-nav"><i class="fa fa-times"></i> Cerrar</a>

	<h2 class="section-description-title"><i class="fa fa-caret-right"></i> Proyectos por área</h2>
	
	<div class="btn-group-vertical btn-group-sm">
		<?php 
		$areas = get_terms( 'areas', array('orderby' => 'name', 'parent' => 0) );
		
		foreach($areas as $area): ?>
			
			<a href="#" class="btn btn-default proyect-call" data-reuse="0" data-term="<?php echo $area->term_id;?>" data-tax="areas">
			
				<?php echo $area->name;?>
				
			</a>	

		<?php
		endforeach; ?>
	</div>

	<h2 class="section-description-title"><i class="fa fa-caret-right"></i> Proyectos por tema</h2>

	<div class="btn-group-vertical btn-group-sm">
	
	<?php 
		$temas = get_terms( 'tema', array('orderby' => 'name') );
		
		foreach($temas as $tema): ?>
			
			<a href="#" class="btn btn-default proyect-call" data-reuse="0" data-term="<?php echo $tema->term_id;?>" data-tax="tema">
			
				<?php echo $tema->name;?>
				
			</a>	

		<?php
		endforeach; ?>
	
	</div>

	<h2 class="section-description-title"><i class="fa fa-caret-right"></i> Proyectos por año</h2>

	<div class="proyects-by-year-nav">
		<?php 
			$years = get_terms( 'year', array('orderby' => 'name' ) );
			foreach($years as $year): ?>
			
			<a href="#" class="btn btn-default proyect-call btn-xs" data-reuse="0" data-term="<?php echo $year->term_id;?>" data-tax="year">
			
				<?php echo $year->name;?>
				
			</a>

			<?php
			endforeach; ?>
	</div>

	<h2 class="section-description-title"><i class="fa fa-caret-right"></i> Proyectos por estado</h2>

	<div class="btn-group-vertical btn-group-sm">
		<?php 
			$estados = get_terms( 'estado', array('orderby' => 'name' ) );
			foreach($estados as $estado): ?>
			
			<a href="#" class="btn btn-default proyect-call" data-reuse="0" data-term="<?php echo $estado->term_id;?>" data-tax="estado">
			
				<?php echo $estado->name;?>
				
			</a>

			<?php
			endforeach; ?>
	</div>
</div>