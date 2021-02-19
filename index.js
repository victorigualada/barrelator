const { assets } = require('../package.json');
const fs = require('fs');

const baseDir = './';

String.prototype.toCamelCase = function() {
  return this.replace(/^([A-Z])|[\s-_](\w)/g, function(match, p1, p2, offset) {
    if (p2) return p2.toUpperCase();
    return p1.toLowerCase();
  });
};

const validateFilesProperty = (files) => {
  if (!Array.isArray(files)) {
    throw new Error('assets property should be an array');
  }
}

const validateDir = (files) => {
  if (!files) {
    throw new Error('assets directory is empty');
  }
}

const buildImportFile = (dir, name = 'assets', assets) => {
  let content = '';
  const assetNames = [];
  assets.forEach(asset => {
    const fileName = asset
      .slice(0, asset.lastIndexOf('.'))
      .toCamelCase();
    assetNames.push(fileName);
    content = content.concat(`import ${fileName} from './${asset}';\n`);
  });
  content = content.concat(`\nexport default ${name} = {\n`);
  assetNames.forEach(name => {
    content = content.concat(`  ${name},\n`)
  });
  content = content.concat(`}`);
  const outputFile = `${baseDir}${dir}/${name}.js`;
  console.log(content);
  fs.writeFileSync(outputFile, content);
}

const assetLoader = (options) => {
  validateFilesProperty(options);

  options.forEach(fileSet => {
    const { ext, dir, name } = fileSet;
    const assets = fs.readdirSync(dir);
    validateDir(assets);
    let matchedExtensions = assets;
    if (ext) {
       matchedExtensions = assets.filter(asset => asset.includes(ext));
    }
    buildImportFile(dir, name, matchedExtensions);
  });
}

assetLoader(assets);
