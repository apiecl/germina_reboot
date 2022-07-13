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
<header class="section-header">
	<h1><?php echo germina_archive_title();?></h1> <span class="pagination-info"><?php echo $pagedtext;?></span>
</header>

<div class="container">
	<div class="row">
		
		<div class="col-md-4 col-md-offset-1">
			<?php cur_get_template('date-sorter.php', array('class' => 'filter-column'), '/parts/');?>
			<?php cur_get_template('mailchimp.php', array('class' => 'hidden-xs'), '/parts/');?>
		</div>

		<div class="content col-md-7">

			<?php if ( $wp_query->have_posts() ) : while ($wp_query->have_posts() ) : the_post();?>

				<?php 
				$args = array(
					'id' 	=> $post->ID,
					'type' 	=> get_post_type($post->ID)
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

		<?php cur_get_template('mailchimp.php', array('class' => 'visible-xs'), '/parts/');?>
		
	</div>
</div>
</div>

<?php get_footer();?>
