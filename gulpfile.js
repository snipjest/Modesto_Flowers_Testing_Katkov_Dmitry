const { src, dest, watch, parallel, series } = require('gulp')

const concat        = require('gulp-concat')
const scss          = require('gulp-sass')(require('sass'))
const browserSync   = require('browser-sync').create()
const autoprefixer  = require('gulp-autoprefixer')
const cleancss      = require('gulp-clean-css')
const plumber       = require('gulp-plumber')
const notify        = require('gulp-notify')
const del           = require('del')


function html() {
	return src(['src/*.html', '!src/**/_*.html'])
	.pipe(plumber())
	.pipe(dest('dist'))
	.pipe(browserSync.stream())
}

function styles() {
	return src('src/assets/scss/style.scss')
	.pipe(plumber({
		errorHandler : function(err) {
			notify.onError({
				title:    "SCSS Error",
				message:  "Error: <%= error.message %>"
			})(err);
			this.emit('end');
		}
	}))
	.pipe(scss())
	.pipe(autoprefixer({
		overrideBrowserslist: ['last 10 version'],
		grid: true
	}))
	.pipe(cleancss({
		level:{1: {specialComments:0}},
		format: 'beautify'
	}))
	.pipe(concat('style.css'))
	.pipe(dest('dist/assets/css'))
	.pipe(browserSync.stream())
}

function scripts() {		
	return src('src/assets/js/main.js')
	.pipe(plumber({
		errorHandler : function(err) {
			notify.onError({
				title:    "JS Error",
				message:  "Error: <%= error.message %>"
			})(err);
			this.emit('end');
		}
	}))
	.pipe(concat('main.js'))
	.pipe(dest('dist/assets/js'))
	.pipe(browserSync.stream())
}

function images() {
	return src('src/assets/images/**/*')
	.pipe(dest('dist/assets/images'))
	.pipe(browserSync.stream())
}

function clean() {
	return del('dist/**/*')
}

function startwatch() {
	browserSync.init({
		server: {
			baseDir: './dist'
		},
		//proxy: 'folder/dist',
		ghostMode: { clicks: false },
		notify: false,
		online: true,
		// tunnel: 'yousutename', // Attempt to use the URL https://yousutename.loca.lt
	});
	watch('src/**/*.html', html)
	watch('src/assets/scss/**/*.scss', styles)
	watch(['src/assets/js/**/*.js', '!src/js/**/*.min.js'], scripts)
	watch('src/assets/images/**/*.{jpg,jpeg,png,webp,avif,svg,gif,ico,webmanifest,xml,json}', images)
}



exports.html    = html
exports.scripts = scripts
exports.styles  = styles
exports.images  = images
exports.clean   = clean;

exports.build   = series(clean, html, scripts, styles, images)
exports.default = series(html, scripts, styles, images, parallel(startwatch))