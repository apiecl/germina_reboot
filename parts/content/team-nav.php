<div class="team-nav row">

<h3 class="section-description-title"><i class="fa fa-angle-right"></i> Equipo</h3>

<?php 
	$args = array(
		'child_of' => 20,
		'numberposts' => -1,
		'sort_column' => 'menu_order'
		);
	$equipos = get_pages($args);
	
	foreach($equipos as $equipo){ 
		$thumb = wp_get_attachment_image_src( get_post_thumbnail_id($equipo->ID), '200x200');
		?>
		<?php
		$targs = array(
			'id' => $equipo->ID,
			'img' => $thumb[0]
			);
			cur_get_template('team-item-small.php', $targs, '/parts/content/');?>
			<?php 
		}
		?>
</div>

<div class="team-nav team-colaborators row">

<h3 class="section-description-title"><i class="fa fa-angle-right"></i> Colaboran</h3>

<?php 
	$args = array(
		'child_of' => 802,
		'numberposts' => -1,
		'sort_column' => 'menu_order'
		);
	$equipos = get_pages($args);
	
	foreach($equipos as $equipo){ 
		$thumb = wp_get_attachment_image_src( get_post_thumbnail_id($equipo->ID), '200x200');
		?>
		<?php
		$targs = array(
			'id' => $equipo->ID,
			'img' => $thumb[0]
			);
			cur_get_template('team-item-small.php', $targs, '/parts/content/');?>
			<?php 
		}
		?>
</div>