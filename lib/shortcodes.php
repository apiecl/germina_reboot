<?php
// Shortcodes

function germina_videoshortcode($atts) {
  ob_start();

  get_template_part('parts/video');

  $content = ob_get_clean();

  return $content;

}

add_shortcode( 'germina_video', 'germina_videoshortcode' );
