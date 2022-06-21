<?php
/**
 * Fallover archive page
 *
 * for categories-items
 *
 * @package germina_reboot
 */

?>

<?php get_header();?>
<?php 
			$pagedtext = '';
			$order = isset($_GET['order']) ? $_GET['order'] : 'descending';
			$paged = get_query_var('paged');
			$totalpages = $wp_query->max_num_pages;
			if($totalpages > 1) {
				if($paged != 0) {
					$pagedtext = '<span>página ' . $paged . '</span> de ' . $totalpages;
				} else {
					$pagedtext = '<span>página 1</span> de ' . $totalpages;
				}	
			}

			
			

			//var_dump($wp_query);

			
		?>
<div class="container">
	<div class="row">
		<div class="col-md-12">
			<header class="section-header">
				<h1><?php echo germina_archive_title();?></h1> <span class="pagination-info"><?php echo $pagedtext;?></span>
			</header>
		</div>
		
		<div class="col-md-4 col-md-offset-1 filter-column" data-id="filter-nav">
			<h4 class="filter-heading-toggle" data-target="#order-accordion">Ordenar por <span class="labelorder"><?php echo $order == 'descending' ? 'recientes' : 'antiguos';?></span><i class="fa fa-chevron-up"></i></h4>
			<div class="panel-group order-filter" id="order-accordion" role="tablist" aria-multiselectable="true">
				<div class="panel panel-default">
					<div class="panel-heading <?php echo $order == 'descending'? 'active' : ''?>" role="tab" id="heading-descending">
						<h4 class="panel-title">
							<a href="<?php echo add_query_arg('order', 'descending')?>" role="button">Más recientes</a>
						</h4>
					</div>
				</div>
				<div class="panel panel-default">
					<div class="panel-heading <?php echo $order == 'ascending'? 'active' : ''?>" role="tab" id="heading-ascending">
						<h4 class="panel-title">
							<a href="<?php echo add_query_arg('order', 'ascending')?>" role="button">Más antiguos</a>
						</h4>
					</div>
				</div>
			</div>
		</div>

		<div class="content col-md-7">
		
		

		

		<?php if ( $wp_query->have_posts() ) : while ($wp_query->have_posts() ) : the_post();?>
			
			<?php 
				$args = array(
					'id' => $post->ID,
					);

				cur_get_template('item-medium.php', $args, '/parts/content/');
				
			?>
		
		<?php endwhile;?>

		<div class="pagination">	
			<div class="nav-next"><?php previous_posts_link( '<i class="fa fa-angle-left"></i> Más recientes' ); ?></div>
			<p class="pagination-info"><?php echo $pagedtext;?></p>
			<div class="nav-previous"><?php next_posts_link( 'Más antiguos <i class="fa fa-angle-right"></i>' ); ?></div>
		</div>

		<?php else : ?>
			<article class="not_found">
				<header>
					<h1>No encontrado</h1>
					<p>No se encontró contenido</p>
					<p><?php get_search_form( true );?></p>
				</header>
			</article>
		<?php endif;?>
		
		</div>
	</div>
</div>

<?php get_footer();?>
