<?php 
$isproy = (isset($_GET['proy'])) ?  $_GET['proy'] : '';
$ptype = (isset($_GET['type'])) ? $_GET['type'] : '';
?>

<?php
//Si es vista de proyectos solamente
 if( ($isproy == 'y') OR (is_page(142)) ):?>	

<aside class="taxnavi" id="proynavi">

<h4 class="navtitle">Proyectos por Área</h4>
<ul class="taxnav">
<?php $byarea = get_terms('areas', 'orderby=name');
	foreach($byarea as $area):
	?>
	<?php
	if($area->parent == 0):?>
			<li class="item <?php if($term->slug == $area->slug): echo 'current-menu-item'; endif;?>" ><a href="<?php echo esc_url( add_query_arg('proy', 'y', get_term_link($area->slug, 'areas')) );?>"><?php echo $area->name;?></a>  
						
			
			<ul class="subareas">
				<li class="subitem <?php if($term->slug == 'campanas'): echo 'current-menu-item'; endif;?>" >
					<a href="<?php echo esc_url( add_query_arg('proy', 'y', get_term_link('campanas', 'areas')) );?>">Campañas</a>
				</li>
			</ul>
			
			</li>
			
			
	<?php endif;?>			
	
	<?php endforeach;?>
</ul>


<h4 class="navtitle">Proyectos por Tema</h4>
<ul class="taxnav">
<?php $bytema = get_terms('tema', 'orderby=name');
	foreach($bytema as $tema):?>
		<li class="item <?php if($term->slug == $tema->slug): echo 'current-menu-item'; endif;?>" ><a href="<?php echo esc_url( add_query_arg('proy', 'y', get_term_link($tema->slug, 'tema')) );?>"><?php echo $tema->name;?></a>  </li>
	<?php endforeach;?>
</ul>



<h4 class="navtitle">Proyectos por Año</h4>
<ul class="taxnav" id="byyear">
<?php $byyear = get_terms('year', 'orderby=name');
	$lastkey = count($byyear);
	foreach($byyear as $key=>$year):?>
		
		<li class="item <?php if($term->slug == $year->slug): echo 'current-menu-item'; endif;?>" ><a href="<?php echo esc_url( add_query_arg('proy', 'y', get_term_link($year->slug, 'year')) );?>"><?php echo $year->name;?></a>
		</li>
	<?php endforeach;?>
</ul>

<h4 class="navtitle">Proyectos por Estado</h4>
<ul class="taxnav">
<?php $bystate = get_terms('estado', 'orderby=name');
	foreach($bystate as $state):?>
		<li class="item <?php if($term->slug == $state->slug): echo 'current-menu-item'; endif;?>" ><a href="<?php echo esc_url( add_query_arg('proy', 'y', get_term_link($state->slug, 'estado')) );?>"><?php echo $state->name;?></a> <!--<span class="count">(<?php echo $state->count;?>)</span>--> </li> 
	<?php endforeach;?>
</ul>




	
</aside>

<?php 
//No es listado de proyectos
else:
//Está definido un filtro por tipo de post
if($ptype){

//Es vista de artículos y publicaciones
if($ptype == 'artpub') {
	$arrparam = array('proy'=> 'n', 'type'=> 'artpub');
	?>

<aside class="taxnavi" id="proynavi">

<h4 class="navtitle">Artículos y publicaciones por Área</h4>
<ul class="taxnav">
<?php $byarea = get_terms('areas', 'orderby=name');
	foreach($byarea as $area):
	
	if($area->parent == 0):?>
			<li class="item <?php if($term->slug == $area->slug): echo 'current-menu-item'; endif;?>" ><a href="<?php echo esc_url( add_query_arg($arrparam, get_term_link($area->slug, 'areas')) );?>"><?php echo $area->name;?></a>  
						
			<?php if(($area->slug == 'gestion-social')&&($term->slug == $area->slug) OR ($term->slug == 'campanas' && $area->slug == 'gestion-social')):?>
			<ul class="subareas">
				
				<li class="subitem <?php if($term->slug == 'campanas'): echo 'current-menu-item'; endif;?>" >
					<a href="<?php echo esc_url( add_query_arg($arrparam, get_term_link('campanas', 'areas')) );?>">Campañas</a>
				</li>
			</ul>
			<?php endif;?>
			
			</li>
			
			
	<?php endif;?>				
	<?php endforeach;?>
</ul>


<h4 class="navtitle">Artículos y publicaciones por Tema</h4>
<ul class="taxnav">
<?php $bytema = get_terms('tema', 'orderby=name');
	foreach($bytema as $tema):?>
		<li class="item <?php if($term->slug == $tema->slug): echo 'current-menu-item'; endif;?>" ><a href="<?php echo esc_url( add_query_arg($arrparam, get_term_link($tema->slug, 'tema')) );?>"><?php echo $tema->name;?></a>  <!--<span class="count">(<?php echo $tema->count;?>)</span>--></li>
	<?php endforeach;?>
</ul>



</aside>

<?php

	}
//Si no es vista de artículos, entonces es de fotos y videos
else {
	$arrparam = array('proy'=> 'n', 'type'=> 'media');
	?>

	<aside class="taxnavi" id="proynavi">

<h4 class="navtitle">Fotos y videos por Área</h4>
<ul class="taxnav">
<?php $byarea = get_terms('areas', 'orderby=name');
	foreach($byarea as $area):
	
	if($area->parent == 0):?>
			<li class="item <?php if($term->slug == $area->slug): echo 'current-menu-item'; endif;?>" ><a href="<?php echo esc_url( add_query_arg($arrparam, get_term_link($area->slug, 'areas')) );?>"><?php echo $area->name;?></a>  
						
			<?php if(($area->slug == 'gestion-social')&&($term->slug == $area->slug) OR ($term->slug == 'campanas' && $area->slug == 'gestion-social')):?>
			<ul class="subareas">
				
				<li class="subitem <?php if($term->slug == 'campanas'): echo 'current-menu-item'; endif;?>" >
					<a href="<?php echo esc_url( add_query_arg($arrparam, get_term_link('campanas', 'areas')) );?>">Campañas</a>
				</li>
			</ul>
			<?php endif;?>
			
			</li>
			
			
	<?php endif;?>				
	<?php endforeach;?>
</ul>


<h4 class="navtitle">Fotos y videos por Tema</h4>
<ul class="taxnav">
<?php $bytema = get_terms('tema', 'orderby=name');
	foreach($bytema as $tema):?>
		<li class="item <?php if($term->slug == $tema->slug): echo 'current-menu-item'; endif;?>" ><a href="<?php echo esc_url( add_query_arg($arrparam, get_term_link($tema->slug, 'tema')) );?>"><?php echo $tema->name;?></a>  <!--<span class="count">(<?php echo $tema->count;?>)</span>--></li>
	<?php endforeach;?>
</ul>



</aside><?php
	
	}	
	
}
//Fin de filtro por tipo de post, pasamos a la vista normal
else {

?>


<aside class="taxnavi" id="proynavi">

<h4 class="navtitle">Contenidos por Área</h4>
<ul class="taxnav">
<?php $byarea = get_terms('areas', 'orderby=name');
	foreach($byarea as $area):
	?>
	<?php
	if($area->parent == 0):?>
			<li class="item <?php if($term->slug == $area->slug): echo 'current-menu-item'; endif;?>" ><a href="<?php echo esc_url( add_query_arg('proy', 'n', get_term_link($area->slug, 'areas')) );?>"><?php echo $area->name;?></a>  
						
			<?php if(($area->slug == 'gestion-social')&&($term->slug == $area->slug) OR ($term->slug == 'campanas' && $area->slug == 'gestion-social')):?>
			<ul class="subareas">
				
				<li class="subitem <?php if($term->slug == 'campanas'): echo 'current-menu-item'; endif;?>" >
					<a href="<?php echo esc_url( add_query_arg('proy', 'n', get_term_link('campanas', 'areas')) );?>">Campañas</a>
				</li>
			</ul>
			<?php endif;?>
			
			</li>
			
			
	<?php endif;?>			
	
	<?php endforeach;?>
</ul>


<h4 class="navtitle">Contenidos por Tema</h4>
<ul class="taxnav">
<?php $bytema = get_terms('tema', 'orderby=name');
	foreach($bytema as $tema):?>
		<li class="item <?php if($term->slug == $tema->slug): echo 'current-menu-item'; endif;?>" ><a href="<?php echo esc_url( add_query_arg('proy', 'n', get_term_link($tema->slug, 'tema')) );?>"><?php echo $tema->name;?></a>  <!--<span class="count">(<?php echo $tema->count;?>)</span>--></li>
	<?php endforeach;?>
</ul>



</aside>

<?php }
//Cerramos la lista de temas
?>

<?php endif;?>

<?php if(is_page(142) OR $term->taxonomy == 'year' OR $term->taxonomy == 'estado'){
	
	}
	
	else {?>

<?php 
//Mostrando los filtros disponibles
?>
<aside class="taxnavi filternavi">
<h4 class="navtitle">Filtrar contenidos</h4>
<p class="currenttaxindicator">Estás viendo  

<?php switch($ptype){
	case('artpub'):
	echo ' los artículos y publicaciones ';
	break;
	case('media'):
	echo ' las fotos y videos ';
	break;
	}
	
	if($isproy == 'y'){
		echo ' los proyectos ';
		}
	
	$mediaparam = array('proy'=> 'n', 'type'=>'media');
	$artpubparam = array('proy'=> 'n', 'type'=> 'artpub');
	?>

de <strong><?php echo $term->name;?></strong></p>

<ul class="taxnav">
<li><a href="<?php echo esc_url( add_query_arg('proy', 'y', get_term_link($term->slug, $term->taxonomy)) );?>">Ver sólo proyectos<a></li>
<li><a href="<?php echo esc_url( add_query_arg($artpubparam, get_term_link($term->slug, $term->taxonomy)) );?>">Incluir  artículos y publicaciones</a></li>
<li><a href="<?php echo esc_url( add_query_arg($mediaparam, get_term_link($term->slug, $term->taxonomy)) );?>">Incluir fotografías y vídeos</a></li>
</ul>
</aside>
<?php };?>
