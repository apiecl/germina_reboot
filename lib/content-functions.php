<?php

function germina_authors() {
	/**
	 * Devuelve función de plugin o función estándar de WP si es que no existe la otra (para usar dentro del loop)
	 */

	global $post;

	if(function_exists('coauthors_posts_links')):
		return coauthors_posts_links();
	else:
		return the_author();
	endif;
}

function germina_docformatlabel($docid) {
	$output = '<div class="icon-wrapper"><div>';

	if(in_category('articulos', $docid)):
		$output .= '<i class="fa fa-file-lines fa-solid"></i>';
		$output .= '<span>Artículo</span>';
	elseif(in_category('audiovisual', $docid)):
		$output .= '<i class="fa fa-video"></i>';
		$output .= '<span>Audiovisual</span>';
	elseif(in_category('guias', $docid)):
		$output .= '<i class="fa fa-guia"></i>';
		$output .= '<span>Guía</span>';
	elseif(in_category('imagenes', $docid)):
		$output .= '<i class="fa fa-image"></i>';
		$output .= '<span>Imágenes</span>';
	elseif(in_category('libros')):
		$output .= '<i class="fa fa-book"></i>';
		$output .= '<span>Libro</span>';
	elseif(in_category('capitulos-de-libros')):
		$output .= '<i class="fa fa-book-open"></i>';
		$output .= '<span>Capítulo de libro</span>';
	endif;

	$output .= '</div></div>';

	return $output;
}

function germina_ajaxdocformatlabel($docid) {
	//$output = '<div class="icon-wrapper"><div>';
	$output = '';

	if(in_category('articulos', $docid)):
		$iconclass .= 'fa fa-file-lines';
		$output .= '<span>Artículo</span>';
	elseif(in_category('audiovisual', $docid)):
		$iconclass .= 'fa fa-solid fa-video';
		$output .= '<span>Audiovisual</span>';
	elseif(in_category('guias', $docid)):
		$iconclass .= 'fa fa-solid fa-guia';
		$output .= '<span>Guía</span>';
	elseif(in_category('imagenes', $docid)):
		$iconclass .= 'fa fa-solid fa-image';
		$output .= '<span>Imágenes</span>';
	elseif(in_category('libros')):
		$iconclass .= 'fa fa-solid fa-book';
		$output .= '<span>Libro</span>';
	elseif(in_category('capitulos-de-libros')):
		$iconclass .= 'fa fa-book-open';
		$output .= '<span>Capítulo de libro</span>';
	endif;

	//$output .= '</div></div>';

	return array(
			'content' => $output,
			'icon' => $iconclass
			);
}

function germina_plainauthors($postid, $prefix) {
	/**
	 * Devuelve los autores en texto plano y con separadores apropiados.
	 */

	$coauth = get_coauthors($postid);
	$autores = '';
	$finauts = count($coauth);

	if($coauth) {
		foreach($coauth as $key=>$auth):

			if($key+1 == $finauts) {
			//final
				$separator = '.';
			} elseif($key+1 == $finauts-1) {
			//penúltimo
				$separator = ' y ';
			} else {
			//intermedio
				$separator = ', ';
			}

			$autores .= $auth->display_name . $separator;

		endforeach;

		return $prefix . ' ' . $autores;
	}
}

function germina_get_post_attachments($title, $text, $filetitle = false) {
	global $post;
	$files = get_children(array('post_parent' => $post->ID, 'post_status' => 'inherit', 'post_type'=>'attachment'));
	if($files)

	{
		foreach($files as $file) :
			$mimtype = get_post_mime_type($file->ID);
			switch($mimtype){
				case('application/msword'):
				$mime = 'doc';
				break;
				case('application/pdf'):
				$mime = 'pdf';
				break;
				case('application/vnd.ms-powerpoint'):
				$mime = 'ppt';
				break;
				case('application/msexcel'):
				$mime = 'xls';
				break;
				default:
				$mime = $mimtype;
			}

			if(!wp_attachment_is_image($file->ID)) {
				if($filetitle == true):
					echo '<a class="downlink" href="'.wp_get_attachment_url($file->ID).'" title="'.$title.'"><i class="fa fa-download"></i> <span class="downtext">'.$text. ' ' . $file->post_title . '</span> <span class="desctext">('.$mime.')</span></a>';
				else:
					echo '<a class="downlink" href="'.wp_get_attachment_url($file->ID).'" title="'.$title.'"><i class="fa fa-download"></i> <span class="downtext">'.$text. '</span> <span class="desctext">('.$mime.')</span></a>';
				endif;
			}

		endforeach;
	}
}

/**
 * GERMINA AREA => PAGE
 */

function germina_areapage() {
	/**
	 * Returns area related to page
	 */
	global $post;
	$areapage = array(
		100 => 15,
		92 => 13,
		94 => 14
	);
	return $areapage[$post->ID];
}

/**
 * GERMINA EQUIPO > INTEGRANTE
 */

function germina_teamtemplate($template) {
	global $post;
	$ancestors = get_post_ancestors( $post->ID );

	if($ancestors && is_page() && get_page_template_slug( $ancestors[0] ) == 'equipo.php' ) {
		$new_template = locate_template( array('integrante-equipo.php') );
		if ( '' != $new_template ) {
			return $new_template;
		}
	}

	return $template;
}

add_filter('template_include', 'germina_teamtemplate');

/**
 * RETURN ONLY TEXT TERMS ECHO
 */
function germina_theplainterms($postid, $taxonomy, $before = '', $separator = ', ', $after = '') {
	$terms = get_the_terms( $postid, $taxonomy );

	if($terms):
		foreach($terms as $term) {
			if( count( get_term_children( $term->term_id, $taxonomy )) === 0) {
				$termnames[] = '<i>' . $term->name . '</i>';
			}
		}

		$termstring = implode($separator, $termnames);

		// $before = sanitize_text_field( $before );
		// $after = sanitize_text_field( $after );

		echo $before . $termstring . $after;
	endif;
}

/**
 * RETURN ONLY TEXT TERMS
 */
function germina_getplainterms($postid, $taxonomy, $before = '', $separator = ', ', $after = '') {

	if(taxonomy_exists( $taxonomy )) :

		$terms = get_the_terms( $postid, $taxonomy );
		$termnames = array();

		if($terms):

			foreach($terms as $term) {
				if( count( get_term_children( $term->term_id, $taxonomy )) === 0) {
					$termnames[] = '<i>' . $term->name . '</i>';
				}
			}


			$termstring = implode( $separator, $termnames );

		// $before = sanitize_text_field( $before );
		// $after = sanitize_text_field( $after );

			return $before . $termstring . $after;

		endif;

	endif;
}

/**
 * RETURNS FIRST PDF ATTACHED TO POST (ATTACHMENT ID)
 */
function germina_returnattachedpdf( $postid ) {
	$files = get_children(array('post_parent' => $postid, 'post_status' => 'inherit', 'post_type'=>'attachment'));

	if( $files ) {

		foreach( $files as $file ) {
			$mimetype = get_post_mime_type($file->ID);

			if( $mimetype == 'application/pdf') {

				return $file->ID;

			}
		}

	} else {

		return false;

	}

}

/**
 * GENERATES PNG FROM PDF FIRST PAGE
 *  - Requires ImageMagick installed on the server
 */
function germina_pdfpagetopng($attchid, $width = 200) {
	//Verificar que se trata de un pdf
	$mimtype = get_post_mime_type($attchid);
	//Chequeos previos
		//Obtener la ruta y el nombre del archivo
	$archivo=get_attached_file($attchid);
	$uploadsdir= wp_upload_dir();
		//Lo dejamos en un directorio separado de los uploads vía admin para mejor diferenciación, y además, es más práctico si luego queremos convertir esta función en un plugin
	$img_path = $uploadsdir['basedir'] . '/pdfsnaps';
	$img_url = $uploadsdir['baseurl'] . '/pdfsnaps';
		//Crear el archivo con un prefijo y vinculado al ID del attachment para poder comprobar su creación.
	$file_name='art-' . $attchid;

	$size = $width;
	$extension = 'jpg';

	$full_filepathname = "{$img_path}/{$file_name}-{$size}.{$extension}";
	$full_fileurlname = "{$img_url}/{$file_name}-{$size}.{$extension}";

	//Chequear si el archivo es un pdf, y además si es que no hemos creado el archivo previamente
	if($mimtype == 'application/pdf' && !file_exists($full_filepathname)) {

		// Conversión de archivo usando imagemagick

		$dir="/usr/bin/convert";

		$convertargs = "-define jpg:size=$size -colorspace RGB -resize $size -interlace none -density 72 -quality 100 {$archivo}[0] $full_filepathname";
		// Parámetros deseados para la conversión desde un PDF
		$comando="$dir $convertargs";

		exec($comando,$out);

		$image=imagecreatefromjpeg($full_filepathname);

		//La siguiente línea me da un error en WP, no sé aún si es que hace algo muy importante, dado que de todas formas tengo mi JPG al final.
		//header('Content-Type: image/jpeg');

		$image =imagejpeg($image, $full_filepathname);

		//unlink("$img_path/$file_name.jpg");
		// Me devuelve un comentario para saber si creó el archivo o está usando uno viejo


		return $full_fileurlname;

	} elseif(file_exists($full_filepathname)) {

		return $full_fileurlname;

	} else {
		//Alega si es que no es un PDF, probablemente aquí se puede poner una imagen genérica de relleno.
		return false;
	}
}

function germina_getdocs($postid) {
	/**
	 * Devuelve solo algunos tipos de documentos permitidos
	 */

	$args = array(
		'post_parent' => $postid,
		'post_status' =>'inherit',
		'post_type' => 'attachment',
		'post_mime_type' => array(
			'application/msword',
			'application/pdf',
			'application/vnd.ms-powerpoint',
			'application/msexcel'
		)
	);
	$docs = get_children( $args );

	return $docs;
}

function germina_aftercontent( $content ) {
	/**
	 * Funciones para después del contenido basado en categoría o tipo de post
	 */
	global $post;

	$new_content = $content;

	if( is_single() && in_category( 'publicaciones' ) ) {

		$format = get_post_meta($post->ID, 'formato_visualizacion', true);

		$docs = germina_getdocs($post->ID);
		$doctitles = array();

		if($docs) {

			foreach($docs as $doc) {

				$fileurl = wp_get_attachment_url( $doc->ID );
				$filetype = wp_check_filetype( $fileurl );

				if($format == 'Miniaturas') {

					if( $filetype['ext'] == 'pdf' ) {

						$getpdfimage = germina_pdfpagetopng( $doc->ID, 240 );
						$pdfimage = "<img src='{$getpdfimage}' alt='{$doc->post_title}'>";

						$doctitles[] = "<a href='{$fileurl}' class='attached-file-block attached-pdf-with-cover'><span class='title'><i class='fa fa-download'></i> {$doc->post_title} ({$filetype['ext']})</span>  {$pdfimage}</a>";

					} else {

						$doctitles[] = "<a href='{$fileurl}' class='attached-file-block attached-file-no-cover'><span class='title'><i class='fa fa-download'></i> {$doc->post_title} ({$filetype['ext']})</span></a>";

					}


				} else {

					$doctitles[] = "<a class='btn btn-default' href='{$fileurl}'><i class='fa fa-download'></i> {$doc->post_title} ({$filetype['ext']})</a>";

				}



			}

			$doctitles = implode(' ', $doctitles);
			$doctitles = "<h4 class='attached-title'>Archivos adjuntos</h4> <div class='attached-to-post {$format}'> {$doctitles}</div>";


			$new_content = $content . $doctitles;


		}

	} else {

		$new_content = $content;

	}

	return $new_content;

}

add_filter( 'the_content', 'germina_aftercontent' );

function germina_boletincontent( $content ) {
	/**
	 * Devuelve un iframe con la URL de mailchimp del boletín en vez del contenido
	 */
	global $post;

	if(get_post_type($post->ID) == 'boletin') {

		$urlboletin = get_post_meta($post->ID, 'boletin_url', true);
		
		if($urlboletin) {

			$content = '<iframe class="mailchimp_iframe" width="100%" height="1050" src="' . $urlboletin .'" frameborder="0"></iframe>';

		} else {

			$content = '<p>Falta URL de boletín.</p>';
		}

	}

	return $content;
}

//add_filter( 'the_content', 'germina_boletincontent' );

function germina_itemtype( $postid ) {
	// Devuelve un itemtype entre categoría y post-type dependiendo de la necesidad
	$ptype = get_post_type( $postid );

	if( $ptype != 'post') {
		$ptypeobj = get_post_type_object( $ptype );
		return $ptypeobj->labels->name;
	} elseif(in_category( 'publicaciones', $postid ) ) {
		//Devuelve categoría
		return 'publicaciones';
	} elseif(in_category( 'novedades', $postid ) || in_category('noticias', $postid) ) {

		return 'novedades';

	} elseif(in_category( 'articulos', $postid ) ) {

		return 'articulos';

	} else {

		return 'default';

	}
}

function germina_itemtypelabel( $postid, $singleitem = false ) {
	//Devuelve el nombre para display de el tipo de item

	$ptype = get_post_type( $postid );

	if( $ptype != 'post') {

		$ptypeobj = get_post_type_object( $ptype );


		if($singleitem == true) {

			return $ptypeobj->labels->singular_name;

		} else {

			return $ptypeobj->labels->name;

		}
		

	} elseif(in_category( 'publicaciones', $postid ) ) {
		//Devuelve categoría
		if($singleitem == true) {

			return 'publicación';

		} else {

			return 'publicaciones';

		}
		

	} elseif(in_category( 'novedades', $postid ) ) {

		//Devuelve categoría
		if($singleitem == true) {

			return 'novedad';

		} else {

			return 'novedades';

		}

	} elseif(in_category( 'articulos', $postid ) ) {

		//Devuelve categoría
		if($singleitem == true) {

			return 'artículo';

		} else {

			return 'artículos';

		}

	} else {

		return 'otros';

	}

}


function string_limit_words($string, $word_limit)
{
	$words = explode(' ', $string, ($word_limit + 1));
	if(count($words) > $word_limit)
		array_pop($words);
	return implode(' ', $words);
}


function germina_seo() {
	//RAW UGLY SEO FIX
	global $post;
	$somos = get_post(6);
	$settings 	= get_option( 'germ_options' );
	$args = array(
		'fields'=> 'names'
	);
	$keywords = get_terms(array('areas', 'tema'), $args);
	?>
	<?php if(is_home()):?>
		<meta name="description" content="<?php echo $somos->post_excerpt;?> | <?php echo $settings['germ_email'];?> |  <?php echo $settings['germ_fono'];?> | <?php echo $settings['germ_direccion'];?> - <?php echo $settings['germ_comuna'].', '.$settings['germ_ciudad'];?>"/>

		<meta name="keywords" content="
		<?php
		echo implode(', ', $keywords);
		?>

		"/>
	<?php else:?>
		<meta name="description" content="
		<?php
		if(is_single()){
			if(!empty($post->post_excerpt)):
				$meta = strip_tags($post->post_excerpt);
				$meta = str_replace(array("\n", "\r", "\t"), ' ', $meta);
				$meta = substr($meta, 0, 350);
			else:
				$meta = strip_tags($post->post_content);
				$meta = str_replace(array("\n", "\r", "\t"), ' ', $meta);
				$meta = substr($meta, 0, 350);
			endif;
			echo $meta;
		}

		if(is_page()){
			$meta = strip_tags($post->post_content);
			$meta = str_replace(array("\n", "\r", "\t"), ' ', $meta);
			$meta = substr($meta, 0, 350);
			echo $meta;
		}

		if(is_category()){
			$meta = strip_tags(category_description());
			echo $meta;

		}

		if(is_tax()){
			$meta = strip_tags(term_description());
			echo $meta;
		}

	?>"/>

	<meta name="keywords" content="
	<?php
	echo implode(', ', $keywords);
	?>

	"/>

<?php endif;?>

<!-- Facebook Open Graph Meta -->

<?php 

if( is_home()):

	$og_title = get_bloginfo('name');

elseif( get_post_type( $post->ID ) === 'boletin'):

	$og_title = '[Boletín ' . strtolower(get_the_time('M Y', $post->ID)) . '] ' . get_the_title($post->ID) ;

else: 

	$og_title = get_the_title($post->ID);

endif;


?>

<meta property="og:title" content="<?php if($og_title): echo $og_title; else: wp_title();endif;?>"/>

<meta property="og:type" content="article"/>
<meta property="og:url" content="
<?php if(is_single()|| is_page()){
	echo get_permalink($post->ID);
}
if(is_category()||is_tax()) {
	echo 'http://'.$_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
}
if(is_home()) {
	echo bloginfo('url');
}

?>"/>
<?php if(has_post_thumbnail($post->ID) && get_post_type($post->ID) !== 'boletin') {
	$imgsrc = wp_get_attachment_image_src(get_post_thumbnail_id($post->ID), 'medium');
	?>

	<meta property="og:image" content="<?php echo $imgsrc[0];?>"/>

<?php } elseif( get_post_type($post->ID) === 'boletin' ) {?>

	<meta property="og:image" content="<?php echo get_bloginfo('template_url');?>/assets/img/share_boletin.png"/>

	<?php 

}

?>

<meta property="og:site_name" content="<?php bloginfo('name');?>"/>
<meta property="og:description"
content="<?php
if(is_single()){
	if(!empty($post->post_excerpt)):
		$meta = strip_tags($post->post_excerpt);
		$meta = str_replace(array("\n", "\r", "\t"), ' ', $meta);
		$meta = substr($meta, 0, 350);
	else:
		$meta = strip_tags($post->post_content);
		$meta = str_replace(array("\n", "\r", "\t"), ' ', $meta);
		$meta = substr($meta, 0, 350);
	endif;
	echo $meta;
}

if(is_page()){
	$meta = strip_tags($post->post_content);
	$meta = str_replace(array("\n", "\r", "\t"), ' ', $meta);
	$meta = substr($meta, 0, 350);
	echo $meta;
}

if(is_category()){
	$meta = strip_tags(category_description());
	echo $meta;

}

if(is_tax()){
	$meta = strip_tags(term_description());
	echo $meta;
}

if(is_home()){
	echo bloginfo('description');
}

?>"/>

<!--Fin de esas cosas feas-->
<?php

}

//add_action('wp_head', 'germina_seo');

function germina_archive_title() {

	if(is_category( )) {

		return single_cat_title('', false);

	} elseif(is_post_type_archive( )) {

		$postobj = get_post_type_object( get_query_var('post_type') );
		$postname = $postobj->labels->singular_name;

		return $postname;

	} elseif(is_author( ) ) {

		if(function_exists( 'get_wp_user_avatar') ) {

			$author = get_query_var( 'author' );
			$avatar = get_wp_user_avatar( $author, 'thumbnail' );
			$chain = '<span class="infoautor">Escrito por </span>';
			return '<div class="ficha-autor">' . $avatar . $chain . get_the_author( ) . '</div>';

		} else {

			return get_the_author( );	

		}
		
	}
}

function theme_queue_js(){
	if ( (!is_admin()) && is_singular() && comments_open() && get_option('thread_comments') )
		wp_enqueue_script( 'comment-reply' );
}
//add_action('wp_enqueue_scripts', 'theme_queue_js');

function germina_term_image($term_id, $taxonomy, $size) {
	/**
	 * Gets taxonomy image based on id
	 */
	$term = get_term( $term_id, $taxonomy );
	$tt_id = 0;
	if ( isset( $term->term_taxonomy_id ) )
		$tt_id = (int) $term->term_taxonomy_id;

	if(function_exists('taxonomy_image_plugin_get_associations')):
		$associations = taxonomy_image_plugin_get_associations();
		$image = '';
		if ( isset( $associations[ $tt_id ] ) ) {
			$attachment_id = (int) $associations[ $tt_id ];
			$image = wp_get_attachment_image_src( $attachment_id, $size );

			return $image;
		}
	endif;
}

//Meta Box para proyectos relacionados
if(function_exists("register_field_group"))
{
	$args = array(
		'post_type' => 'resumen-proyecto',
		'numberposts' => -1,
	);
	$proyectos = get_posts($args);
	$options = array();
	foreach($proyectos as $proyecto)
	{
		$options[$proyecto->ID] = $proyecto->post_title;
	}

	register_field_group(array (
		'id' => 'acf_proyectos',
		'title' => 'Proyectos',
		'fields' => array (
			array (
				'key' => 'field_58f67604deadf',
				'label' => 'Proyectos relacionados',
				'name' => 'proyectos_relacionados',
				'type' => 'checkbox',
				'instructions' => 'Marque los proyectos relacionados',
				'choices' => $options,
				'default_value' => 1,
				'layout' => 'vertical',
			),
		),
		'location' => array (
			array (
				array (
					'param' => 'post_type',
					'operator' => '==',
					'value' => 'resumen-proyecto',
					'order_no' => 0,
					'group_no' => 0,
				)
			),
			array (
				array (
					'param' => 'post_type',
					'operator' => '==',
					'value' => 'post',
					'order_no' => 0,
					'group_no' => 0,
				)
			),
			array (
				array (
					'param' => 'post_type',
					'operator' => '==',
					'value' => 'foto',
					'order_no' => 0,
					'group_no' => 0,
				)
			),
			array (
				array (
					'param' => 'post_type',
					'operator' => '==',
					'value' => 'video',
					'order_no' => 0,
					'group_no' => 0,
				)
			),
		),
		'options' => array (
			'position' => 'normal',
			'layout' => 'no_box',
			'hide_on_screen' => array (
			),
		),
		'menu_order' => 0,
	));
}

function germina_getplaincats($postid) {
	$cats = get_the_category($postid);
	//excluir publicaciones para mostrar solo el sub
	$catstring = '';
	
	foreach($cats as $cat) {
		if($cat->slug != 'publicaciones') {
			$catstring = $cat->name;
		}
	}

	return $catstring;

}

function germina_taxpanel_shortcode($atts) {

	$a = shortcode_atts(array(
		'taxonomy'	=> 'tema'
	), $atts);

	return germina_taxpanel_get_content($a['taxonomy']);
}

add_shortcode('germina_taxonomy_panel', 'germina_taxpanel_shortcode');

function germina_taxpanel_get_content($taxonomy) {
	$output = '';
	if($taxonomy) {
		$taxobj = get_taxonomy( $taxonomy );
		$taxlabels = get_taxonomy_labels( $taxobj );
	//var_dump($taxlabels);

		$args = array(
			'taxonomy' => $taxonomy,
			'parent'   => 0
		);
		$terms = get_terms($args);

		if($terms) {
			$output .= 	'<div id="panel-taxonomy-' . $taxonomy . '" class="panel-taxonomy-shortcode panel panel-default panel-taxcontent">';
			$output .= 	'<div class="panel-heading" role="tab" id="heading-' . $taxonomy .'">';
			$output .= 	'<h4 class="panel-title">';
			$output .=  '<a role="button" data-toggle="collapse" data-parent="#taxonomy-accordion" href="#taxpanel-'. $taxonomy . '">Consulta nuestros contenidos según ' . $taxlabels->singular_name .' <i class="fa fa-chevron-down"></i></a>';
			$output .= '</h4></div>';
			$output .= '<div class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading-'.$taxonomy.'" id="taxpanel-'.$taxonomy.'">';			
			$output .= '<div class="panel-body">';

			foreach($terms as $term) {

				$output .= '<a href="' . get_term_link( $term->term_id, $taxonomy ) .'" class="btn btn-large btn-filter btn-default" data-reuse="0">' . $term->name . '</a>';

			}

			$output	.= '</div>';
			$output .= '</div>';
			$output .= '</div>';
		}
	}
	

	return $output;

}