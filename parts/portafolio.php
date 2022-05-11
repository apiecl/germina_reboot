<?php if(is_home()):?>
	
	<div class="cycle-pager"></div>
	
	<div class="cycle-prev"><i class="fa fa-angle-left"></i></div>
	<div class="cycle-next"><i class="fa fa-angle-right"></i></div>

<?php endif;?>

<div class="row portafolio">
	<div class="col-md-8 col-md-offset-2 portafolio-content">
		
		<?php get_template_part('parts/portafolio-items');?>

	</div>
</div>