const fs = require('fs');

let baseDir;

String.prototype.toCamelCase = function() {
  return this.replace(/^([A-Z])|[\s-_]+(\w)/g, (match, p1, p2, offset) => p2 ? p2.toUpperCase() : p1)
};

const validateFilesProperty = (imports) => {
  if (!Array.isArray(imports)) {
    throw new Error('assets-barrel property should be an array');
  }
  if (imports.length === 0) {
    throw new Error('assets-barrel property should have at least one element');
  }
}

const validateDir = (files, dir) => {
  if (files.length === 0) {
    throw new Error(`Directory '${dir}' is empty`);
  }
}

const buildImportFile = (dir, name, assets, parse) => {
  let content = '';
  const assetNames = [];
  assets.forEach(asset => {
    const fileName = asset
      .slice(0, asset.lastIndexOf('.'))
      .toCamelCase();
    const variable = parse ? `${fileName}` : `'${dir}/${asset}': ${fileName}`;
    assetNames.push(variable);
    content = content.concat(`import ${fileName} from './${asset}';\n`);
  });
  content = content.concat(`\nconst ${name} = {\n`);
  assetNames.forEach(assetName => {
    content = content.concat(`  ${assetName},\n`)
  });
  content = content.concat(`}\n`);
  content = content.concat(`\nexport default ${name}`);
  const outputFile = `${baseDir}/${dir}/${name}.js`;
  fs.writeFileSync(outputFile, content);
}

const assetLoader = (config) => {
  config.forEach((fileSet, index) => {
    const step = `[${index + 1} / ${config.length}]`;
    const { exts, dir, name = 'assets', parse = false } = fileSet;
    const previousFile = `${baseDir}/${dir}/${name}.js`;
    if (fs.existsSync(previousFile)) {
      fs.unlinkSync(previousFile);
    }
    const assets = fs
      .readdirSync(`${baseDir}/${dir}`)
      .filter(asset => !asset.startsWith('.'));
    validateDir(assets, dir);
    let matchedFiles = assets;
    if (exts) {
      matchedFiles = assets.filter(asset => exts.some(ext => asset.includes(ext)));
    }
    if (matchedFiles.length) {
      buildImportFile(dir, name, matchedFiles, parse);
      console.log(`${step} Created barrel file ${previousFile}`);
    } else {
      throw new Error(`${step} No files matched the specified extensions [${exts || '*'}] in ${dir}`);
    }
  });
}

const findConfig = () => {
  const configFile = `${baseDir}/assets-barrel.json`;
  if (fs.existsSync(configFile)) {
    return require(`${baseDir}/assets-barrel.json`);
  } else {
    const { 'assets-barrel': packageConfig } = require(`${baseDir}/package.json`);
    return packageConfig;
  }
}

const run = () => {
  baseDir = process.cwd();
  const config = findConfig();
  validateFilesProperty(config);
  assetLoader(config);
}

module.exports = {
  run
};
