<div class="col-md-11 col-md-offset-1">
  <footer class="single-footer">
    <div class="single-item-meta-top">
      <div><?php the_terms( $post->ID, 'areas', '<p><span class="taxname">áreas</span></p>', ', ' );?></div>
      <div><?php the_terms( $post->ID, 'ambitos_de_accion', '<p><span class="taxname ambitos-de-accion">ámbitos</span></p>', ', ' );?></div>
      <div><?php the_tags( 'etiquetas', ' . ' );?> </div>
    </div>
  </footer>
</div>
