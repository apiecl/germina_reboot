<!DOCTYPE html>
<html <?php language_attributes();?> >
	<head>
		<meta charset="<?php bloginfo('charset');?>">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link rel="profile" href="https://gmpg.org/xfn/11">
		<?php wp_head();?>
	</head>	
</html>
<body <?php body_class( );?> >
<?php wp_body_open();?>

<?php get_template_part( 'parts/germina-menu' );?>
<span id="top"></span>

<script>
	$(document).ready(function() {
		$('textdesc > p:first-child').contents().filter(	function() {
			return this.nodeType === 3;
		}).remove();

		$('textdesc > p:first-child').prepend('CAMBIO DE FRASE');
	});
</script>

<script>
	$(document).ready(function() {
		$('textdesc strong'),text('cambio');
	});

</script>