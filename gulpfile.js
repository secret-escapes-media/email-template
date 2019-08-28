var gulp         = require('gulp');
var cp           = require('child_process');
var path         = require('path');
var del          = require('del');
var vfs          = require('vinyl-fs');
var map          = require('map-stream');
var browserSync  = require('browser-sync');
var size         = require('gulp-warn-size');
var image        = require('gulp-image');
var message      = require('gulp-message');
var htmltidy     = require('gulp-htmltidy');
var replace      = require('gulp-replace');



/////////////////////////////////////////////////////////////////////  utilities

// start browserSync local server and show under site subdirectory
function browserSyncServe() {
  browserSync.init({
    ui: false,
    server: {
      baseDir: '_site/'
    }
  });
}

// Reload BrowserSync for when site changes are made
function browserSyncReload(done) {
  browserSync.reload();
  done();
}



/////////////////////////////////////////////////////////////////////////  build

// build the jekyll site
function buildJekyll(done) {
  return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
    .on('close', done);
}

// build for image files
function buildImages() {
  return gulp.src('./img/**/*.*')
    .pipe(gulp.dest('./_site/img/'));
}



/////////////////////////////////////////////////////////////////////////  watch

// Watch files
function watchFiles() {
  gulp.watch( // watch for jekyll
    [
      '**/*.*',
      '!_site/**/*',
      '!node_modules/**/*',
      '!.sass-cache/**/*'
    ],
    gulp.series(rebuild)
  );
  // watch for images
  gulp.watch('_assets/img/**/*.*', buildImages)
    // updates the compiled folder if an image is deleted
    // modified snippet from https://gulpjs.org/recipes/handling-the-delete-event-on-watch
    .on('change', function (event) {
      if (event.type === 'deleted') {
        var filePathFromSrc = path.relative(path.resolve('img/**/*.*'), event.path);
        var destFilePath = path.resolve('_site/img/**/*.*', filePathFromSrc);
        del.sync(destFilePath);
      }
      browserSync.reload();
    });
}



//////////////////////////////////////////////////////////////////////  compress

// compress images files for live
function compressImages() {
  // checks for updated image name id
  vfs.src('img/**/*.*')
    .pipe(map(function (file, cb) {
      // find filename for each file
      var fullPath = file.path;
      fullPath = fullPath.split('/');
      var fileName = fullPath[fullPath.length-1]; // finds last item in array
      // kill the task if it uses the default image name id
      if (fileName.match(/^projectinitialsMM/g)) {
        message.error('please update the image name prefix - currently using "projectinitialsMM"');
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
}

// compress html files for live
function compressHtml() {
  return gulp.src('./_site/**/*.html')
    .pipe(htmltidy({
      'indent': true,
      'wrap': 0,
      'vertical-space': true,
      'new-empty-tags': 'custom'
    }))
    // cant stop htmltidy from auto closing this custom element, Exact target wont accept it closed, so need to replace
    .pipe(replace('<custom name="opencounter" type="tracking" />', '<custom name="opencounter" type="tracking">'))
    .pipe(gulp.dest('./_site'));
}



///////////////////////////////////////////////////////////////////  build tasks

// define complex tasks
var rebuild = gulp.series(buildJekyll, browserSyncReload);
var serve = gulp.series(browserSyncServe);
var watch = gulp.series(watchFiles);
var build = gulp.parallel(
  buildJekyll,
  buildImages
);
var compress = gulp.parallel(
  compressImages,
  compressHtml
);

// build and watch emails for development
exports.default = gulp.series(
  build,
  gulp.parallel(
    serve,
    watch
  )
);

// compress & complie the emails for uploading or packaging for a send
exports.compile = gulp.series(
  build,
  compress
);