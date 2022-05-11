var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var cleanCss = require('gulp-clean-css');
var watch = require('gulp-watch');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;


gulp.task('default', function() {
  // place code for your default task here
});

gulp.task('sass', function() {
	 return gulp.src('assets/css/src/main.scss')
		  		.pipe(sass().on('error', sass.logError) )
		  		.pipe(autoprefixer())
		  		.pipe(gulp.dest('assets/css'))
		  		.pipe(browserSync.stream());
  	});

gulp.task('minify', function() {
	return gulp.src('assets/css/main.css')
		.pipe(cleanCss())
		.pipe(gulp.dest('assets/css/'));
});

gulp.task('scripts', function() {
	return gulp.src([
		'./bower_components/mustache.js/mustache.js',
		'./bower_components/bootstrap-sass/assets/javascripts/bootstrap/modal.js',
		'./bower_components/bootstrap-sass/assets/javascripts/bootstrap/dropdown.js',
		'./bower_components/bootstrap-sass/assets/javascripts/bootstrap/collapse.js',
		'./bower_components/bootstrap-sass/assets/javascripts/bootstrap/tab.js',
		'./bower_components/jquery.cycle2/index.js',
		'./bower_components/masonry/dist/masonry.pkgd.js',
		'./bower_components/df-visible/jquery.visible.js',
		'./bower_components/imagesloaded/imagesloaded.js',
		'./bower_components/responsive-bootstrap-toolkit/dist/bootstrap-toolkit.js',
		'./assets/js/src/functions.js',
		'./assets/js/src/main.js'
		])
		.pipe(concat('germina.js'))
		.pipe(gulp.dest('./assets/js/'))
		.pipe(browserSync.stream());
});

gulp.task('watch', function() {
	browserSync.init({
		proxy: 'germina.local'
	});
	gulp.watch([
		'assets/css/src/**/*.scss',
		'assets/js/src/*.js'
		], 
		[
		'sass', 
		'scripts'
		]);
});

gulp.task('build', ['sass', 'scripts']);

gulp.watch(['*.php', '*/*/*.php']).on('change', reload);