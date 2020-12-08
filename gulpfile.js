var gulp         = require('gulp');
var path         = require('path');
var del          = require('del');
var cp           = require('child_process');
var browserSync  = require('browser-sync');
var map          = require('map-stream');
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

// compress & check all jpgs
function compressJpgs() {
  return gulp.src('./_site/img/**/*.jpg')
    .pipe(image())
    .pipe(size(200000)) // checks image size in bytes - 200kb
    .on('error', function () {
      message.error('images need to be under 200kb for exact target');
      process.exit();
    })
    .pipe(gulp.dest('./_site/img'));
}

// compress & check other image formats that aren't jpgs
function compressOtherImages() {
  return gulp.src(['./_site/img/**/*', '!./_site/img/**/*.jpg'])
    .pipe(image())
    .pipe(size(5000000)) // checks image size in bytes - 5mb
    .on('error', function () {
      message.error('image is too large for email');
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
    .pipe(replace('<custom name="opencounter" type="tracking"></custom>', '<custom name="opencounter" type="tracking">'))
    .pipe(gulp.dest('./_site'));
}



/////////////////////////////////////////////////  cache buster for exact target

// random string generator
function makeRandomString(length) {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// creates Exact Target version of the email files for upload
function createEtVersion() {
  // set global variables
  const prefix = 'media-'+(new Date().getFullYear())+(new Date().getMonth()+1)+(new Date().getDate())+'-'; // current date in name for identification
  const maxCharacters = 36;
  const remainingCharacters = maxCharacters - prefix.length;
  const etUrl = 'http://image.email.secretescapes.com/lib/fe91127277660c7b71/m/8/';
  const imgFolder = 'img/';
  const imgDataMap = [];
  // loop through images
  return gulp.src('./_site/img/**/*')
    .pipe(map(function (file, cb,) {
      // capture file names
      const imgFilename = file.basename;
      const imgNewFilename = prefix + makeRandomString(remainingCharacters) + file.extname;
      // loop through html & map where each images is used
      gulp.src('./_site/*.html')
        .pipe(map(function (file, cb,) {
          const htmlContent = file.contents.toString();
          // add html to data map
          if (htmlContent.includes(imgFilename)) { // does image appear in HTML?
            if (!imgDataMap.find(item => item.htmlFile === file.basename)) { // does HTML already appear in data map?
              imgDataMap.push(
                {
                  htmlFile: file.basename,
                  images: [],
                }
              );
            }
            // add images used in html to data map
            for (const item of imgDataMap) {
              if (item.htmlFile === file.basename) {
                if (!item.images.find(image => image.original === imgFilename)) { // does image already appear in data map?
                  item.images.push(
                    {
                      'original': imgFilename,
                      'new': imgNewFilename,
                    }
                  );
                }
              }
            }
          }
          cb(null, file); // matidtory callback for map-stream function - .pipe(map)
        }));
      file.basename = imgNewFilename; // change image file to new cachebusted name
      cb(null, file); // matidtory callback for map-stream function - .pipe(map)
    }))
    .pipe(gulp.dest('./_site/_et-version/_upload-these'))
    .on('finish', function(){
      // find & replace all image names in html using the generated data map
      gulp.src('./_site/*.html')
        .pipe(map(function (file, cb,) {
          imgDataMap.filter(item => { // get data for current html file
            if (item.htmlFile === file.basename){
              let htmlContent = file.contents.toString();
              // loop each image in map, find & replace full path with url
              item.images.map(image => {
                const imgFilenameRegexEscaped = image.original.replace(/\./g, '\\.');
                const imgPath = imgFolder + imgFilenameRegexEscaped;
                const imgPathFileRegex = new RegExp(imgPath, 'gm');
                const imgNewPath = etUrl + image.new;
                htmlContent = htmlContent.replace(imgPathFileRegex, imgNewPath);
              });
              // after all find & replaces, write to the actual file
              file.contents = new Buffer.from(htmlContent);
            }
          });
          cb(null, file); // matidtory callback for map-stream function - .pipe(map)
        }))
        .pipe(gulp.dest('./_site/_et-version'));
    });
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
  compressJpgs,
  compressOtherImages,
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

// compile & compress the emails
exports.compile = gulp.series(
  build,
  compress
);

// compile, compress & cachebust images for uploading to Exact Target
exports.et = gulp.series(
  build,
  compress,
  createEtVersion
);