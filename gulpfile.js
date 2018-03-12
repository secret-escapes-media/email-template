var gulp         = require('gulp');
var fs           = require('fs');
var cp           = require('child_process');
var path         = require('path');
var del          = require('del');
var vfs          = require('vinyl-fs');
var map          = require('map-stream');
var browserSync  = require('browser-sync');
var size         = require('gulp-warn-size');
var watch        = require('gulp-watch');
var image        = require('gulp-image');
var message      = require('gulp-message');
var gulpSequence = require('gulp-sequence');
var htmltidy     = require('gulp-htmltidy');
var replace      = require('gulp-replace');


// ----------------------------------------------------------------------  build

// build the jekyll site
gulp.task('build-jekyll', function (done) {
  return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
  .on('close', done);
});

// rebuild jekyll site and reload
gulp.task('rebuild-jekyll', ['build-jekyll'], function () {
  browserSync.reload();
});

// serve site with browserSync. also mirrors site to sub-directory
gulp.task('serve', function() {
  browserSync.init({
    ui: false,
    server: {
      baseDir: '_site/'
    }
  });
});

gulp.task('build-images', function(cb) {
  return gulp.src('./img/**/*.*')
  .pipe(gulp.dest('./_site/img/'))
});


// ----------------------------------------------------------------------  watch

// watch for jekyll rebuild
gulp.task('watch-jekyll', function () {
  gulp.watch(['**/*.*', '!_site/**/*','!node_modules/**/*','!.sass-cache/**/*' ], ['rebuild-jekyll']);
});

// watch for images
gulp.task('watch-images', ['build-images'], function() {
  gulp.watch(['img/**/*.*'], ['build-images'])
    // updates the compiled folder if an image is deleted
    // modified snippet from https://gulpjs.org/recipes/handling-the-delete-event-on-watch
    .on('change', function (event) {
      if (event.type === 'deleted') {
        var filePathFromSrc = path.relative(path.resolve('img/**/*.*'), event.path);
        var destFilePath = path.resolve('_site/img/**/*.*', filePathFromSrc);
        del.sync(destFilePath);
      }
      browserSync.reload();
    })
});


// -------------------------------------------------------------------  compress

// compress images files for live
gulp.task('compress-images', function () {

  // checks for updated image name id
  vfs.src('img/**/*.*')
    .pipe(map(function (file, cb) {
      // find filename for each file
      var fullPath = file.path;
          fullPath = fullPath.split('/');
      var fileName = fullPath[fullPath.length-1]; // finds last item in array
      // kill the task if it uses the default image name id
      if (fileName.match(/^projectinitialsMM/g)) {
        message.error('please update the image name prefix - currently using \"projectinitialsMM\"');
        process.exit();
      }
      cb(null, file); // matidtory callback for map-stream function - .pipe(map)
    }));

  // process images
  return gulp.src('./_site/img/**/*')
  .pipe(image())
  .pipe(size(200000)) // checks image size in bytes - 200kb
  .on('error', function () {
    message.error('images need to be under 200kb for exact target');
    process.exit();
  })
  .pipe(gulp.dest('./_site/img'));
})

// compress html files for live
gulp.task('compress-html', function () {
  return gulp.src('./_site/**/*.html')
    .pipe(htmltidy({
      'indent': true,
      'wrap': 0,
      'vertical-space': true,
      'new-empty-tags': 'custom'
    }))
    // cant stop htmltidy from auto closing this custom element, Exact target wont accept it closed, so need to replace
    .pipe(replace('<custom name="opencounter" type="tracking" />', '<custom name="opencounter" type="tracking">'))
    .pipe(gulp.dest('./_site'))
})


///////////////////////////////////////////////////////////////////  build tasks

// builds jekyll site & watches for changes
gulp.task('default', gulpSequence(
    ['build-jekyll'],
    [
      'watch-jekyll',
      'watch-images'
    ],
    'serve'
  )
);

// builds jekyll site for deploying to live
gulp.task('build', gulpSequence(
    [
      'build-jekyll',
      'build-images'
    ],
    [
      'compress-images',
      'compress-html'
    ]
  )
);