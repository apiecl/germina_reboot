<?php
	$numberproys = 5;
	$auxproys = $numberproys + 1;
	$area = get_term(germina_areapage(), 'areas');
?>

<ul class="proycol first" data-nproys="nproys-<?php echo $auxproys;?>">
<?php
$years = get_terms('year', 'orderby=name&order=DESC');
$countproys = 0;
$listposts = array();

foreach($years as $year):

$args = array(
	'numberposts' => -1,
	'post_type' => 'resumen-proyecto'	
	);
$args['tax_query'] = array(
	'relation' => 'AND',
	array(
		'taxonomy' => 'areas',
		'field' => 'slug',
		'terms' => $area->slug,
		),
	array(
		'taxonomy' => 'year',
		'field' => 'slug',
		'terms' => $year->slug
		)	
	);
$proyarea = get_posts($args);
	  
	foreach($proyarea as $proy):
			$pid = $proy->ID;
			if(!in_array($pid, $listposts)):
			   if($countproys <= $numberproys):			   

			   $targs = array(
			   		'id' => $proy->ID,
			   		'year' => $year->name
			   		);
			   cur_get_template('proyect-item-small.php', $targs, '/parts/content/');

			   ++$countproys;
			   $listposts[] = $pid;
			   endif;
			 endif;  
	   endforeach;
	endforeach;
	?>
	
</ul>

<a class="btn btn-info vertodos" href="<?php echo esc_url( add_query_arg('proy', 'y', get_term_link($area->slug, 'areas')) );?>" title="Ver todos los proyectos del área">Ver todos <i class="fa fa-angle-right"></i></a>