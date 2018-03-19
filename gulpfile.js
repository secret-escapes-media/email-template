var gulp        = require('gulp'),
    shell       = require('gulp-shell'),
    browserSync = require('browser-sync').create();

// Task for building blog when something changed:
gulp.task('build', shell.task(['jekyll build --watch']));

// Task for serving sub directory blog with Browsersync
gulp.task('serve', function () {
    browserSync.init({ server: { baseDir: '_site/' }});
    // Reloads page when some of the already built files changed:
    gulp.watch('_site/**/*.*').on('change', browserSync.reload);
});

// builds jekyll site & watch for changes
gulp.task('default', ['build', 'serve']);