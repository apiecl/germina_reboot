<?php

  $url                  = urlencode( get_permalink( $post->ID ) );

  if(get_post_type( $post->ID) === 'boletin'):

      $title = urlencode( '[Boletín ' . strtolower(get_the_time('M Y', $post->ID)) . '] ' .$post->post_title );

  else:

      $title = urlencode( $post->post_title );

  endif;

  $facebook_shareurl    = "https://www.facebook.com/sharer/sharer.php?u={$url}";
  $twitter_shareurl     = "http://www.twitter.com/share?url={$url}&text={$title}";
  $googleplus_shareurl  = "https://plus.google.com/share?url={$url}";
  $linkedin_shareurl    = "https://www.linkedin.com/shareArticle?mini=true&url={$url}&title={$title}";
  $whatsapp_shareurl    = "whatsapp://send?text={$url} - {$title}";

?>

<div class="sharer">
  <a target="_blank" href="<?php echo $whatsapp_shareurl;?>" class="sharebutton whatsapp visible-xs"><i class="fa fa-fw fa-whatsapp"></i></a>
  <a target="_blank" href="<?php echo $facebook_shareurl;?>" class="sharebutton facebook"><i class="fa fa-fw fa-facebook"></i></a>
  <a target="_blank" href="<?php echo $twitter_shareurl;?>" class="sharebutton twitter"><i class="fa fa-fw fa-twitter"></i></a>
  <a target="_blank" href="<?php echo $linkedin_shareurl;?>" class="sharebutton linkedin"><i class="fa fa-fw fa-linkedin"></i></a>
</div>
