<?php 

$contactoid = 15;
$fono 		= get_post_meta( $contactoid, 'telefono', true);
$fono2		= get_post_meta( $contactoid, 'telefono_2', true);
$direccion	= get_post_meta( $contactoid, 'direccion', true);
$ciudad		= get_post_meta( $contactoid, 'ciudad', true);
$comuna		= get_post_meta( $contactoid, 'comuna', true);
$email 		= get_post_meta( $contactoid, 'correo', true);
$twitter    = get_post_meta( $contactoid, 'twitter', true);
$facebook   = get_post_meta( $contactoid, 'facebook', true);
$linkedin   = get_post_meta( $contactoid, 'linkedin', true);
$enlace_direccion = get_post_meta( $contactoid, 'enlace_direccion', true);

?>

<p class="address-button">
	<a style="display:inline-block;" href="<?php echo $facebook;?>" target="_blank"><i class="fa fa-fw fa-facebook-square"></i></a>
</p>

<p class="address-button">
	<a style="display:inline-block" href="<?php echo $linkedin;?>"><i class="fa fa-fw fa-linkedin"></i></a>
</p> 