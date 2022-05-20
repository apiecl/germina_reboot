<div class="col-md-11 col-md-offset-1">
  <footer class="single-footer">
    <div class="single-item-meta-top">
      <div><?php the_terms( $post->ID, 'areas', '<p><span class="taxname">áreas</span></p>', ', ' );?></div>
      <div><?php the_terms( $post->ID, 'tema', '<p><span class="taxname">tema</span></p>', ', ' );?></div>
      <div><?php the_tags( 'etiquetas', ' . ' );?> </div>
    </div>
  </footer>
</div>
