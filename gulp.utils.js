const { minify } = require('uglify-js');

class PluginsCache {
  constructor () {
    this.cache = {};
  }

  get (name) {
    if (!(name in this.cache)) this.cache[name] = require('rollup-plugin-' + name);
    return this.cache[name];
  }
}

function uglify (options) {
  return {
    name: 'uglify',

    renderChunk (code, chunk, outputOptions) {
      if (!outputOptions.compact) return code;

      let output = minify(code, options);
      if (output.error) throw output.error;
      return output.code;
    }
  };
}

let plugins = new PluginsCache();
exports.getPlugins = function getPlugins (PRODUCTION) {
  return [
    plugins.get('json')(),
    plugins.get('typescript')(),
    PRODUCTION ? uglify() : undefined
  ];
};

exports.watcher = class Watcher {
  constructor (watcher) {
    this.watcher  = watcher;
    this.oldFiles = [];
  }

  update (watchFiles) {
    let newWatchFiles = watchFiles.filter(file => !file.startsWith('\u0000')),
        watch = newWatchFiles.filter(file => this.oldFiles.indexOf(file) == -1),
        unwatch = this.oldFiles.filter(file => watchFiles.indexOf(file) == -1);

    this.watcher.unwatch(unwatch);
    this.watcher.add(watch);
    this.oldFiles = watchFiles;
  }
};
