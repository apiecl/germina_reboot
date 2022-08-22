<section class="metodologia <?php echo is_home() ? 'home' : 'inside';?>">
	<?php if(is_home()):?>
		<header class="section-header">
			<h3 class="post-title">Metodología de Trabajo</h3>
		</header>
	<?php endif;?>
	
	<div class="container">
		<div class="row">
			<ul class="metodologia-list">
				<li>
					<img src="<?php bloginfo('template_url');?>/assets/img/acciones_colaborativas.svg" alt="Acciones Colaborativas">
					<span>Acciones Colaborativas</span>
				</li>
				<li>
					<img src="<?php bloginfo('template_url');?>/assets/img/desarrollo_incremental_b.svg" alt="Desarrollo Incremental">
					<span>Desarrollo Incremental</span>
				</li>
				<li>
					<img src="<?php bloginfo('template_url');?>/assets/img/participacion_activa.svg" alt="Participación Activa">
					<span>Participación Activa</span>
				</li>
				<li>
					<img src="<?php bloginfo('template_url');?>/assets/img/dialogo_de_saberes.svg" alt="Diálogo de Saberes">
					<span>Diálogo de saberes</span>
				</li>
			</ul>
		</div>
	</div>
</section>