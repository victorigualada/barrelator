# assets-barrel

After a lack of an easy way to create static websites with dynamic files (from a JSON file for example),
this project aims to build a barrel file to import those files. Providing so a `const` variable with the imported files.

## Installation

```shell script
npm i assets-barrel --save-dev
```

## Configuration
In a `assets-barrel.json` file:
```json
[
  {
    "dir": "src/Assets"
  },
  {
    "dir": "src/model/images",
    "exts": ["png"],
    "name": "myImages",
    "parse": true
  }
]
```

In `package.json`, just add an `assets-barrel` property:

```json
"assets-barrel": [
  {
    "dir": "src/Assets"
  },
  {
    "dir": "src/model/images",
    "exts": ["png"],
    "name": "myImages",
    "parse": true
  }
]
```

| Property |   Type  | Mandatory | Default | Description                                 |
|:--------:|:-------:|:---------:|:-------:|---------------------------------------------|
|   `dir`  |  string |    yes    |    -    | Directory from which import files           |
|  `exts`  |  array  |     no    |    -    | Array of extensions that should be included |
|  `name`  |  string |     no    |  assets | Exported property name                      |
|  `parse` | boolean |     no    |  false  | Camel case the file names                   |
## Run

```shell script
npx assets-barrel
```

This will generate a file for each element in the `assets-barrel` array in the `package.josn`.

## Example

For the previous configuration, assuming both folders two files `image1.png` and `image2.jpg`, the results would be:

`src/Assets/assets.js`
```javascript
import image1 from 'src/model/images/image1.png'
import image2 from 'src/model/images/image2.png'

const assets = {
  'src/model/images/image1.png': image1,
  'src/model/images/image2.png': image2,
};

export const assets;
```

`src/model/images/myImages.js`
```javascript
import image1 from 'src/model/images/image1.png'

const myImages = {
  image1,
};

export const myImages;
```

Then in a component:

```javascript
import assets from '../Assets/assets'
import myImages from '../model/images/images'

function MyComponent({ dynamicImage }) {
  const image = myImages[dynamicImage]; // dynamicImage will be 'src/model/images/image1.png'
  const { image1, image2 } = assets;
}
```

## Notes
The `parse` options intends to export the files in a more readable way in case this module is not used
to import files dynamically, but just to have all files imported in a barrel file.

A file called `src/assets/My-song.mp3` will parse into a property called `MySong`.
