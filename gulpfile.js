if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';

const utils = require('./gulp.utils.js'),
      PKG = require('./package.json'),
      
      NAME     = PKG['lib-name'],
      DEMODIR  = PKG['demo-dir'],
      BUILDDIR = PKG['build-dir'],
      
      PRODUCTION = process.env.NODE_ENV === 'production',
      
      plugins = utils.getPlugins(PRODUCTION),
      
      gulp   = require('gulp'),
      gulpif = require('gulp-if'),
      
      rename = require('gulp-rename'),
      newer  = require('gulp-newer'),
      
      htmlmin = require('gulp-htmlmin'),
      stylus  = require('gulp-stylus'),
      
      rollup = require('rollup'),
      
      fs        = require('fs'),
      rmdirSync = require('rimraf').sync,
      
      sync = require('browser-sync').create();


// Clear directories

function clearDir (dir) {
  if (fs.existsSync(dir)) rmdirSync(dir);
  fs.mkdirSync(dir);
}

gulp.task('clear', function (done) {
  clearDir(DEMODIR);
  clearDir(BUILDDIR);
  done();
});


// Assets

gulp.task('assets', function () {
  return gulp.src('assets/**', { since: gulp.lastRun('assets') })
    .pipe(newer(DEMODIR + '/assets'))
    .pipe(gulp.dest(DEMODIR + '/assets'));
});


// HTML

gulp.task('html', function () {
  return gulp.src('demo/*.html', { since: gulp.lastRun('html') })
    .pipe(gulpif(PRODUCTION, htmlmin({
      collapseWhitespace: true,
      removeComments: true
    })))
    .pipe(gulp.dest(DEMODIR));
});


// CSS

function css (src, dir) {
  return gulp.src(src)
    .pipe(stylus({
      'include css': true,
      compress: PRODUCTION
    }))
    .pipe(gulp.dest(dir));
}

/*gulp.task('css', function () {
  return css('src/styles/index.styl', BUILDDIR);
});*/

gulp.task('css:demo', function () {
  return css('demo/styles/index.styl', DEMODIR);
});


// JavaScript

let devCache,  devWatcher,
    demoCache, demoWatcher;

async function js (input, cache, watcher, config) {
  let bundle = await rollup.rollup({
    input, cache, plugins,
    treeshake: PRODUCTION ? {
      pureExternalModules: true
    } : false
  });
  
  if (Array.isArray(config))
    for (let output of config)
      await bundle.write(output);
  else await bundle.write(config);
  
  if (watcher) watcher.update(bundle.watchFiles);
  
  return bundle.cache;
}

gulp.task('js', async function () {
  devCache = await js('src/main.js', devCache, devWatcher, PRODUCTION ? [
    {
      name: NAME,
      file: BUILDDIR + '/' + NAME + '.js',
      format: 'umd'
    }, {
      name: NAME,
      file: BUILDDIR + '/' + NAME + '.min.js',
      compact: true,
      format: 'umd'
    }, {
      file: BUILDDIR + '/' + NAME + '.es.js',
      format: 'es'
    }
  ] : {
    file: BUILDDIR + '/' + NAME + '.es.js',
    format: 'es'
  });
});

gulp.task('js:demo', async function () {
  demoCache = await js('demo/scripts/main.js', demoCache, demoWatcher, {
    file: DEMODIR + '/app.js',
    format: 'iife'
  });
});


// Watchers

gulp.task('watch', function (done) {
//  gulp.watch('src/styles/**/*.styl', gulp.series('css'));
  
  devWatcher = new utils.watcher(gulp.watch('src/main.js', gulp.series('js')));
  
  done();
});

gulp.task('watch:demo', function (done) {
  gulp.watch('assets/**',   gulp.series('assets'));
  gulp.watch('demo/*.html', gulp.series('html'));
  gulp.watch(['demo/styles/**/*.styl', 'build/*.css'], gulp.series('css:demo'));
  
  demoWatcher = new utils.watcher(gulp.watch('demo/scripts/main.js', gulp.series('js:demo')));
  
  done();
});

gulp.task('server', function () {
  sync.init({
    server: DEMODIR,
    files: DEMODIR + '/**/*',
    open: false
  });
});

gulp.task('build', gulp.series(/*'css',*/ 'js'));
gulp.task('dev',   gulp.series('watch', 'build'));

gulp.task('build:demo', gulp.series('assets', 'html', 'css:demo', 'js:demo'));
gulp.task('dev:demo',   gulp.series('watch:demo', 'build:demo', 'server'));

gulp.task('build:all', gulp.series('build', 'build:demo'));
gulp.task('dev:all',   gulp.series('dev',   'dev:demo'));

gulp.task('default', gulp.series('clear', 'build:all'));

