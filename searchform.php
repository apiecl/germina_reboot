<form role="search" method="get" class="search-form" action="<?php echo home_url( '/' ); ?>">
    <label>
        <span class="screen-reader-text">Buscar</span>
        <input type="search" class="search-field"
            placeholder="<?php echo esc_attr_x( 'Ingresa una palabra asociada a tu búsqueda', 'placeholder' ) ?>"
            value="<?php echo get_search_query() ?>" name="s"
            title="<?php echo esc_attr_x( 'Buscar por:', 'label' ) ?>" />
        <i class="fa fa-magnifying-glass"></i>
    </label>
</form>