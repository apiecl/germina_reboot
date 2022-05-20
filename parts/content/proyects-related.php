<div class="related lista-proyectos row">

<?php 	
		$crelposts 	= 	get_posts('post_type=post&meta_value='.$post->ID);
		$crelvids 	= 	get_posts('post_type=video&meta_value='.$post->ID);
		$crelfotos	= 	get_posts('post_type=foto&meta_value='.$post->ID);

		$args = array(
			'post_type' => array('post', 'video', 'foto')
		);

		$args['meta_query'] = array(
			array(
				'key' => 'proyectos_relacionados',
				'value' => $post->ID,
				'compare' => 'LIKE'
			)
		);

		$newcrelposts = get_posts($args);

		if($crelposts || get_post_meta($post->ID, 'proyectos relacionados') || get_post_meta($post->ID, 'proyectos_relacionados') || $newcrelposts):
					if($crelposts || $crelvids || $crelfotos || $newcrelposts):
						echo '<div class="col-md-6">';
						echo '<h4 class="section-description-title">Más sobre este proyecto</h4>';
					endif;
				echo '<div class="proyect-item-rels">';				
		endif;
			
		
		//Videos relacionados		
		if($crelvids):
			foreach($crelvids as $crelvid):?>
			
			
			<?php

			// $vikey = sanitize_text_field( get_post_meta($crelvid->ID,'Vimeo video',true) );
			// $url =  parse_url($vikey,PHP_URL_PATH);
			// $hash = unserialize(file_get_contents('http://vimeo.com/api/v2/video'.$url.'.php'));
			// $thumb = $hash[0]['thumbnail_small'];  

				$itemargs = array(
					'id' => $crelvid->ID
					);

				cur_get_template('item-small.php', $itemargs, '/parts/content/');

			endforeach;
		endif;
		
		//Fotos Relacionadas
		if($crelfotos):
			
	
			foreach($crelfotos as $crelfoto):
			
				$itemargs = array(
					'id' => $crelfoto->ID
					);

				cur_get_template('item-small.php', $itemargs, '/parts/content/');

			endforeach;
			
			?>
			<?php
		endif;	
			
		
		//Posts relacionados	
		if($crelposts):

			foreach($crelposts as $crelpost):

				$itemargs = array(
					'id' => $crelpost->ID
					);

			cur_get_template('item-small.php', $itemargs, '/parts/content/');


			endforeach;
			

			endif;	

		//Nuevos Posts relacionados	
		if($newcrelposts):

			foreach($newcrelposts as $newcrelpost):

				$itemargs = array(
					'id' => $newcrelpost->ID
					);

			cur_get_template('item-small.php', $itemargs, '/parts/content/');


			endforeach;
			endif;	

			if($crelposts || $crelvids || $crelfotos || $newcrelposts):
						echo '</div>';
			endif;
			if($crelposts || get_post_meta($post->ID, 'proyectos relacionados') || get_post_meta($post->ID, 'proyectos_relacionados') || $newcrelposts):
					echo '</div>';
			endif;
?>




<?php if(get_post_meta($post->ID, 'proyectos_relacionados', true) || get_post_meta($post->ID, 'proyectos relacionados') ):

		if(!$crelposts && !$crelvids && !$crelfotos && !$newcrelposts):
			echo '<div class="col-md-6 col-md-offset-6">';
		else:
			echo '<div class="col-md-6">';
		endif;
		echo '<h4 class="section-description-title">Proyectos Relacionados</h4>';

		$proyvalues =  get_post_meta($post->ID, 'proyectos relacionados', false);
		
		if($proyvalues) {

		echo '<div class="proy-rel-list">';
					
		$args = array(
			'post__in' => $proyvalues,
			'post_type' => 'resumen-proyecto'
			);
		
			
			$relproys = get_posts($args);
			
			foreach($relproys as $relproy):
			
				$prargs = array(
					'year' => germina_getplainterms($relproy->ID, 'year', '', ','),
					'id' => $relproy->ID
					);

				cur_get_template('proyect-item-small.php', $prargs, '/parts/content');
			
			
			endforeach;

		}

		$proyvalues_new =  get_post_meta($post->ID, 'proyectos_relacionados', true);

		if($proyvalues_new) {

		echo '<div class="proy-rel-list">';
		
		$args = array(
					'post__in' => $proyvalues_new,
					'post_type' => 'resumen-proyecto'
					);
			
			$relproys = get_posts($args);
			foreach($relproys as $relproy):
			
				$prargs = array(
					'year' => germina_getplainterms($relproy->ID, 'year', '', ','),
					'id' => $relproy->ID
					);

				cur_get_template('proyect-item-small.php', $prargs, '/parts/content');
			
			
			endforeach;

		}
			echo '</div>';
			echo '</div>';
			echo '</div>';
			endif;?>
</div>