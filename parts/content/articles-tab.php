<ul class="proycol">
<?php
	
$area = get_term(germina_areapage(), 'areas');

$args = array(
	'numberposts' => 6,
	'post_type' => array('post'),
	'category__in'=> array(6,10)	
	);
$args['tax_query'] = array(array(
	'taxonomy' => 'areas',
	'field' => 'slug',
	'terms' => $area->slug	
	));

$pubarea = get_posts($args);
	foreach($pubarea as $keypub=>$pub):
	
		$targs = array(
			'id' => $pub->ID
			);
	cur_get_template('article-item-small.php', $targs, '/parts/content/');	
	
	endforeach;
?>
</ul>
<?php $arrparam = array('proy'=> 'n', 'type'=> 'artpub');?>

<a class="btn btn-info vertodos" href="<?php echo esc_url( add_query_arg($arrparam, get_term_link($area->slug, 'areas')) );?>" title="Ver todos los proyectos del área">Ver todos <i class="fa fa-angle-right"></i></a>