<div class="col-md-11 col-md-offset-1">
  <footer class="single-footer">
    <div class="single-item-meta-top">
      <p><?php the_terms( $post->ID, 'areas', 'áreas <i class="fa fa-angle-right"></i> ', ' . ' );?></p>
      <p><?php the_terms( $post->ID, 'tema', 'tema <i class="fa fa-angle-right"></i> ', ' &bull; ' );?></p>
      <p><?php the_tags( 'etiquetas <i class="fa fa-caret-right"></i> ', ' . ' );?> </p>
    </div>
  </footer>
</div>
