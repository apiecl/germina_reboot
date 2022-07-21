<div class="col-md-11 col-md-offset-1">
  <footer class="single-footer">
    <div class="single-item-meta-bottom">
      <div class="single-tax-zone"><?php the_terms( $post->ID, 'areas', '<p><span class="taxname">áreas</span></p>', ', ' );?></div>
      <div class="single-tax-zone"><?php the_terms( $post->ID, 'ambitos_de_accion', '<p><span class="taxname ambitos-de-accion">ámbitos</span></p>', ', ' );?></div>
      <div class="single-tax-zone"><?php the_terms( $post->ID, 'tema', '<p><span class="taxname tema">temas</span></p>', ', ' );?></div>
      <div class="single-tax-zone"><?php the_terms( $post->ID, 'post_tag', '<p><span class="taxname tags">etiquetas</span></p>', ', ' );?> </div>
      <div class="single-tax-zone"><?php the_terms( $post->ID, 'germina_year', '<p><span class="taxname germina_year">años</span></p>', ', ' );?> </div>
    </div>
  </footer>
</div>
