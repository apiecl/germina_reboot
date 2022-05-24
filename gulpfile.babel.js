// const { src, dest } = require("gulp");
// const sass = require("gulp-sass")(require("node-sass"));
// const autoprefixer = require("gulp-autoprefixer");
// const concat = require("gulp-concat");
// const cleanCss = require("gulp-clean-css");
// const watch = require("gulp-watch");
// const browserSync = require("browser-sync").create();
// const reload = browserSync.reload;
// const babel = require("gulp-babel");

// exports.default = function () {};

// exports.sass = () => {
// 	return src("assets/css/src/main.scss")
// 		.pipe(sass().on("error", sass.logError))
// 		.pipe(autoprefixer())
// 		.pipe(dest("assets/css"));
// };

// exports.minify = () => {
// 	return src("assets/css/main.css")
// 		.pipe(cleanCss())
// 		.pipe(dest("assets/css/"));
// };

const { series, src, dest, watch } = require("gulp");
const concat = require("gulp-concat");
const sass = require("gulp-sass")(require("node-sass"));

function defaultTask(cb) {
	cb();
}

function parsesass(cb) {
	return src("assets/css/src/main.scss")
		.pipe(sass().on("error", sass.logError))
		.pipe(dest("assets/css"));
}

function scripts(cb) {
	return src([
		"./node_modules/bootstrap-sass/assets/javascripts/bootstrap/transition.js",
		"./node_modules/bootstrap-sass/assets/javascripts/bootstrap/modal.js",
		"./node_modules/bootstrap-sass/assets/javascripts/bootstrap/dropdown.js",
		"./node_modules/bootstrap-sass/assets/javascripts/bootstrap/collapse.js",
		"./node_modules/bootstrap-sass/assets/javascripts/bootstrap/tab.js",
		"./node_modules/jquery-cycle-2/src/jquery.cycle.all.js",
		"./node_modules/masonry-layout/dist/masonry.pkgd.js",
		"./node_modules/jquery-visible/jquery.visible.js",
		"./node_modules/imagesloaded/imagesloaded.js",
		"./node_modules/responsive-toolkit/dist/bootstrap-toolkit.js",
		"./assets/js/src/functions.js",
		"./assets/js/src/main.js",
	])
		.pipe(concat("germina.js"))
		.pipe(dest("./assets/js"));
}

function watchFiles(cb) {
	watch("assets/js/src/*.js", scripts);
	watch("assets/css/src/*.scss", parsesass);
	cb();
}

exports.sass = parsesass;
exports.scripts = scripts;
exports.default = series(parsesass, scripts);
exports.watch = watchFiles;
