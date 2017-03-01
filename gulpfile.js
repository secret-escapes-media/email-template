var gulp        = require('gulp'),
    shell       = require('gulp-shell'),
    browserSync = require('browser-sync').create(),
    concat      = require('gulp-concat'),
    uglify      = require('gulp-uglify'),
    rename      = require('gulp-rename'),
    htmlmin     = require('gulp-htmlmin'),
    autoprefix  = require('gulp-autoprefixer'),
    cssmin      = require('gulp-cssmin'),
    imagemin    = require('gulp-imagemin'),
    pngquant    = require('imagemin-pngquant');

// Task for building blog when something changed:
gulp.task('build', shell.task(['jekyll build --watch']));

// Task for serving sub directory blog with Browsersync
gulp.task('serve', function () {
    browserSync.init({
      server: {
        baseDir: '_site/',
        routes: {
          '/email-template': '_site/'
        }
      }
    });
    // watches js to concat & uglify
    gulp.watch('js/script.js', ['concatScripts']);
    // Reloads page when some of the already built files changed:
    gulp.watch('_site/**/*.*').on('change', browserSync.reload);
});

// concat & min scripts
gulp.task('concatScripts', function(){
  return gulp.src([
    './js/modernizr-custom.js',
    './bower_components/jquery/dist/jquery.min.js',
    './js/script.js'])
  .pipe(concat('scripts.js'))
  .pipe(uglify())
  .pipe(rename('scripts.min.js'))
  .pipe(gulp.dest('./js'));
});

// minify complied html
gulp.task('htmlMinify', function() {
  return gulp.src('./_site/**/*.html')
  .pipe(htmlmin({
    collapseWhitespace: true,
    removeComments: true
  }))
  .pipe(gulp.dest('./_site'));
});

// css autoprefix & min
gulp.task('optimiseCss', function() {
  return gulp.src('./_site/**/*.css')
  .pipe(autoprefix({
    browsers: ['last 3 versions', 'iOS 7'],
    cascade: false
  }))
  .pipe(cssmin())
  .pipe(gulp.dest('./_site'));
});

// compress images
gulp.task('compressImages', function () {
  return gulp.src('./img/**/*')
  .pipe(imagemin({
    progressive: true,
    svgoPlugins: [{removeViewBox: false}],
    use: [pngquant()]
  }))
  .pipe(gulp.dest('./_site/img'));
});


// builds jekyll site & watch for changes
gulp.task('default', ['build', 'serve', 'concatScripts']);

// run before uploading to live - compresses images & css
gulp.task('compress', ['compressImages', 'optimiseCss', 'htmlMinify']);