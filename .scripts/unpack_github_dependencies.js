require('shelljs/global');
require('colors');

var download = require('download-git-repo');
var fs = require('fs-extra');
var path = require('path');

var cacheFolder = '.cache';
var srcPackagesFolder = path.join(cacheFolder, 'packages');
var targetPackageFolder = 'packages';

var unpack = [
  {
    from: path.join(srcPackagesFolder, 'easysearch:elasticsearch'),
    to: path.join(targetPackageFolder, 'easysearch_elasticsearch')
  },
  {
    from: path.join(srcPackagesFolder, 'easysearch:core'),
    to: path.join(targetPackageFolder, 'easysearch_core')
  }
];

if (!test('-d', '.cache')) {
  mkdir(cacheFolder);
}

download('bompi88/meteor-easy-search', cacheFolder, function(error) {
  if (error) {
    throw new Error(error);
  }

  if (!test('-d', 'packages')) {
    mkdir('packages');
  }

  for (var i = 0; i < unpack.length; i++) {
    if (test('-d', unpack[i].to)) {
      fs.removeSync(unpack[i].to);
    }
    mv(unpack[i].from, unpack[i].to);
  }
});
