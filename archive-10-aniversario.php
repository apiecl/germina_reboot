<?php
/**
 * Archive Aniversario
 *
 * for aniversario-items
 *
 * @package germina_reboot
 */

?>

<?php get_header();?>
		<div class="content">
        <?php if(function_exists('run_10_aniversario_content')):

            echo run_10_aniversario_content();

        endif;?>
		
		</div>

<?php get_footer();?>
