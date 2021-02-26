const fs = require('fs');
const assetsBarrel = require('../lib/index');

describe('barrelator tests', () => {
  let cwdStub;

  beforeAll(() => {
    cwdStub = jest.spyOn(process, 'cwd');
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    cwdStub.restoreObjectToOriginalState();
  });

  it('should throw error when non array', () => {
    cwdStub.mockReturnValue('../test/mocks/non-array');
    expect(assetsBarrel.run).toThrowError('barrelator property should be an array');
  });

  it('should throw error when empty array', () => {
    cwdStub.mockReturnValue('../test/mocks/empty-array');
    expect(assetsBarrel.run).toThrowError('barrelator property should have at least one element');
  });

  it('should throw error when dir is empty', () => {
    cwdStub.mockReturnValue('../test/mocks/empty-dir');
    const mockedAssets = [];
    jest.spyOn(fs, 'readdirSync').mockReturnValueOnce(mockedAssets);
    expect(assetsBarrel.run).toThrowError(`Directory '.' is empty`);
  });

  it('should throw error when no matched extensions', () => {
    cwdStub.mockReturnValue('../test/mocks/unmatched-exts');
    const mockedAssets = ['image1.png'];
    jest.spyOn(fs, 'readdirSync').mockReturnValueOnce(mockedAssets);
    expect(assetsBarrel.run).toThrowError('[1 / 1] No files matched the specified extensions [jpg] in files');
  });

  it('should create barrel file', () => {
    const expectedContent = 'import image2 from \'./image2.jpg\';\n\nexport default {\n  \'./image2.jpg\': image2,\n}';
    cwdStub.mockReturnValue('../test/mocks/success');
    const mockedAssets = ['image1.png', 'image2.jpg'];
    jest.spyOn(fs, 'readdirSync').mockReturnValueOnce(mockedAssets);
    const writeStub = jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {});
    assetsBarrel.run();
    expect(writeStub).toHaveBeenLastCalledWith('../test/mocks/success/./images.js', expectedContent);
  });

  it('should create barrel file using barrelator.json config', () => {
    const expectedContent = 'import image2 from \'./image2.jpg\';\n\nexport default {\n  \'./image2.jpg\': image2,\n}';
    cwdStub.mockReturnValue('../test/mocks/success');
    const mockedAssets = ['image1.png', 'image2.jpg'];
    jest.spyOn(fs, 'readdirSync').mockReturnValueOnce(mockedAssets);
    const writeStub = jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {});
    assetsBarrel.run();
    expect(writeStub).toHaveBeenLastCalledWith('../test/mocks/success/./images.js', expectedContent);
  });

  it('should create barrel file with parsed variable names', () => {
    const expectedContent = 'import image2 from \'./image2.jpg\';\n\nexport default {\n  image2,\n}';
    cwdStub.mockReturnValue('../test/mocks/success-parse');
    const mockedAssets = ['image1.png', 'image2.jpg'];
    jest.spyOn(fs, 'readdirSync').mockReturnValueOnce(mockedAssets);
    const writeStub = jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {});
    assetsBarrel.run();
    expect(writeStub).toHaveBeenLastCalledWith('../test/mocks/success-parse/./images.js', expectedContent);
  });

  it('should create barrel index.d.ts file with parsed variable names', () => {
    const expectedContent = 'import image2 from \'./image2.jpg\';\n\nexport {\n  image2,\n}';
    cwdStub.mockReturnValue('../test/mocks/success-noname');
    const mockedAssets = ['image1.png', 'image2.jpg'];
    jest.spyOn(fs, 'readdirSync').mockReturnValueOnce(mockedAssets);
    const writeStub = jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {});
    assetsBarrel.run();
    expect(writeStub).toHaveBeenLastCalledWith('../test/mocks/success-noname/./index.d.ts', expectedContent);
  });
});
