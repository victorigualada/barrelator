const fs = require('fs');

const baseDir = process.cwd();
const { assets } = require(`${baseDir}/package.json`);

String.prototype.toCamelCase = function() {
  return this.replace(/^([A-Z])|[\s-_]+(\w)/g, (match, p1, p2, offset) => p2 ? p2.toUpperCase() : p1)
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

const buildImportFile = (dir, name, assets) => {
  let content = '';
  const assetNames = [];
  assets.forEach(asset => {
    const fileName = asset
      .slice(0, asset.lastIndexOf('.'))
      .toCamelCase();
    assetNames.push(fileName);
    content = content.concat(`import ${fileName} from './${asset}';\n`);
  });
  content = content.concat(`\nconst ${name} = {\n`);
  assetNames.forEach(name => {
    content = content.concat(`  ${name},\n`)
  });
  content = content.concat(`}\n`);
  content = content.concat(`\nexport default ${name}`);
  const outputFile = `${baseDir}/${dir}/${name}.js`;
  fs.writeFileSync(outputFile, content);
}

const assetLoader = (options) => {
  validateFilesProperty(options);

  options.forEach(fileSet => {
    const { ext, dir, name = 'assets' } = fileSet;
    const previousFile = `${baseDir}/${dir}/${name}.js`;
    if (fs.existsSync(previousFile)) {
      fs.unlinkSync(previousFile);
    }

    const assets = fs.readdirSync(dir);
    validateDir(assets);
    let matchedExtensions = assets;
    if (ext) {
      matchedExtensions = assets.filter(asset => asset.includes(ext));
    }
    buildImportFile(dir, name, matchedExtensions);
    console.log(`Created barrel file ${previousFile}`);
  });
}

assetLoader(assets);
