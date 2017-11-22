var gulp = require('gulp'),
	sass = require('gulp-sass'),
	gutil = require('gulp-util'),
	plumber = require('gulp-plumber'),
	chalk = require('chalk'),
	runSequence = require('run-sequence'),
	del = require('del');

var sourceFolder = 'src',
	distFolder = 'dist';

var paths = {
	source: {
		app: sourceFolder,
		html: sourceFolder + '/*.html',
		image: sourceFolder + '/images/*.png',
		stylesheet: sourceFolder + '/sass/*.sass'
	},

	destination: {
		app: distFolder,
		html: distFolder + '/',
		image: distFolder + '/images/',
		stylesheet: distFolder + '/css/'
	}
};

gulp.task('clean', function () {
	return del([paths.destination.app]);
});

gulp.task('html', function () {
	return gulp.src(paths.source.html)
		.pipe(gulp.dest(paths.destination.html));
});

gulp.task('image', function () {
	return gulp.src(paths.source.image)
		.pipe(gulp.dest(paths.destination.image));
});

gulp.task('sass', function () {
	return gulp.src(paths.source.stylesheet)
		.pipe(plumber({
			errorHandler: reportError
		}))
		.pipe(sass())
		.pipe(gulp.dest(paths.destination.stylesheet));
});

var reportError = function (error) {
	gutil.beep();

	var report = '',
		chalk = gutil.colors.white.bgRed;

	report += chalk('TASK:') + ' [' + error.plugin + ']\n';
	report += chalk('PROB:') + ' ' + error.message + '\n';

	if (error.lineNumber) {
		report += chalk('LINE:') + ' ' + error.lineNumber + '\n';
	}

	if (error.fileName) {
		report += chalk('FILE:') + ' ' + error.fileName + '\n';
	}

	console.error(report);

	this.emit('end');
};

gulp.task('watch', function () {
	gulp.watch(paths.source.html, ['html']);
	gulp.watch(paths.source.stylesheet, ['sass']);
});

gulp.task('default', function () {
	runSequence(
		'clean',
		'html',
		'image',
		'sass',
		'watch'
	);
});
