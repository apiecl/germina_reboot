<?php
/**
 * MUSTACHE COMPILER
 */
require_once(get_template_directory() . '/lib/mustache/src/Mustache/Autoloader.php');

Mustache_Autoloader::register();

$loader = new Mustache_Engine(array(
	'loader' => new Mustache_Loader_FilesystemLoader( get_template_directory() . '/parts/content/mustache')
	)
);

return $loader;