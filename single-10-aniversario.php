<?php
/**
 * Single Aniversario
 *
 * for aniversario-items
 *
 * @package germina_reboot
 */

?>

<?php get_header();?>
		<div class="content">
        
        <?php if(function_exists('run_10_aniversario_header')):
                echo run_10_aniversario_header();
        endif;?>

        <?php if(function_exists('run_10_aniversario_content')):
            $formato = get_post_meta($post->ID, 'formato', true);
            if($formato):
                echo run_10_aniversario_content($formato, $post->ID);
            else:
                echo run_10_aniversario_content();
            endif;
        endif;?>
		
		</div>

<?php get_footer();?>