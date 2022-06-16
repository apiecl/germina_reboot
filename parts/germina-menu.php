<nav class="navbar navbar-default navbar-fixed-top">
  <div class="container">
    <!-- Brand and toggle get grouped for better mobile display -->
    <div class="navbar-header">
      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#germina-menu" aria-expanded="false">
        <i class="fa fa-bars"></i>
        <i class="fa fa-times"></i>
      </button>
      <a class="navbar-brand" href="<?php bloginfo( 'url' ); ?>">
        <img class="logo-blanco" height="48" src="<?php bloginfo( 'template_url' );?>/assets/img/germina_blanco.svg" alt="<?php bloginfo( 'name' );?>" class="animated fadeIn hidden-xs">
      </a>
    </div>

    <!-- Collect the nav links, forms, and other content for toggling -->
    <div class="collapse navbar-collapse" id="germina-menu">
     	<?php wp_nav_menu(
				array(
					'theme_location'   => 'principal',
					'menu_class'       => 'nav navbar-nav animated fadeIn',
					'depth'            => 2,
					'container'        => false,
					'walker'           => new wp_bootstrap_navwalker()
					)
				);?>
      <!-- <ul class="nav navbar-nav animated fadeIn searchmenu">
        <li class="menu-item">
          <a title="Buscar" href="#" class="search-link-top dropdown-toggle" aria-haspopup="true" data-toggle="modal" data-target="#search-modal"><i class="fa fa-search"></i> buscar</a>
        </li>
      </ul> -->
      
      <div class="visible-xs">
        <div class="redes-menu">
          <?php get_template_part('parts/redes-sociales');?>
        </div>
      </div>

    </div><!-- /.navbar-collapse -->
  </div><!-- /.container-fluid -->
</nav>

<div class="modal fade search-modal" id="search-modal" tabindex="-1" role="dialog">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">Buscar en <?php bloginfo('name');?></h4>
      </div>
      <div class="modal-body">
        <?php get_search_form( );?>

        <div class="live-search-results"></div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Cerrar</button>
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->
