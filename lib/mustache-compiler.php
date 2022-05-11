<?php
/**
 * MUSTACHE COMPILER
 */

return new Mustache_Engine(array(
	'loader' => new Mustache_Loader_FilesystemLoader( get_template_directory() . '/parts/content/mustache')
	)
);