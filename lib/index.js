const fs = require('fs');

const DEFAULT_NAME = 'index';
const DEFAULT_PARSE = true;
const DEFAULT_TS = false;
const DEFAULT_EXCLUDED_FILES = ['.spec', '.test'];
let baseDir;

String.prototype.toCamelCase = function() {
  return this.replace(/^([A-Z])|[\s-_]+(\w)/g, (match, p1, p2, offset) => p2 ? p2.toUpperCase() : p1)
};

const validateFilesProperty = (imports) => {
  if (!imports) {
    throw new Error('No config found, please refer to README.md');
  }
  if (!Array.isArray(imports)) {
    throw new Error('barrelator property should be an array');
  }
  if (imports.length === 0) {
    throw new Error('barrelator property should have at least one element');
  }
  if (!!imports.dir) {
    throw new Error('dir property is mandatory');
  }
}

const validateDir = (files, dir) => {
  if (files.length === 0) {
    throw new Error(`Directory '${dir}' is empty`);
  }
}

const buildImportFile = (options, assets) => {
  const { dir, name = DEFAULT_NAME, parse = DEFAULT_PARSE, ts = DEFAULT_TS } = options;
  let content = '';
  let exportedVars = '';
  assets.forEach(asset => {
    const fileName = asset
      .slice(0, asset.lastIndexOf('.'))
      .toCamelCase();
    const variable = parse ? `${fileName}` : `'${dir}/${asset}': ${fileName}`;
    exportedVars = exportedVars.concat(`  ${variable},\n`);
    content = content.concat(`import ${fileName} from './${asset}';\n`);
  });
  let extension;
  if (ts) {
    content = content.concat(`\nexport {\n`);
    extension = 'd.ts';
  } else {
    content = content.concat(`\nexport default {\n`);
    extension = 'js';
  }

  content = content.concat(`${exportedVars}`);
  content = content.concat(`}`);

  const outputFile = `${baseDir}/${dir}/${name}.${extension}`;
  fs.writeFileSync(outputFile, content);
}

const excludeUnwantedFiles = (assets, exts) => {
  return assets.filter(asset => [...exts, ...DEFAULT_EXCLUDED_FILES].some(ext => asset.includes(ext)));
}

const assetLoader = (config) => {
  config.forEach((barrel, index) => {
    const step = `[${index + 1} / ${config.length}]`;
    const { exts, dir, name = 'assets' } = barrel;
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
      matchedFiles = excludeUnwantedFiles(assets, exts);
    }
    if (matchedFiles.length) {
      buildImportFile(barrel, matchedFiles);
      console.log(`${step} Created barrel file ${previousFile}`);
    } else {
      throw new Error(`${step} No files matched the specified extensions [${exts || '*'}] in ${dir}`);
    }
  });
}

const findConfig = () => {
  const configFile = `${baseDir}/barrelator.json`;
  if (fs.existsSync(configFile)) {
    return require(`${baseDir}/barrelator.json`);
  } else {
    const { 'barrelator': packageConfig } = require(`${baseDir}/package.json`);
    return packageConfig;
  }
}

const run = (options) => {
  baseDir = process.cwd();
  const config = options || findConfig();
  validateFilesProperty(config);
  assetLoader(config);
}

module.exports = {
  run
};
