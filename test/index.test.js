const fs = require('fs');
const assetsBarrel = require('../lib/index');

describe('assets-barrel tests', () => {
  let cwdStub;

  beforeAll(() => {
    cwdStub = jest.spyOn(process, 'cwd');
  });

  afterAll(() => {
    cwdStub.restoreObjectToOriginalState();
  });

  it('should throw error when non array', () => {
    cwdStub.mockReturnValue('../test/mocks/non-array');
    expect(assetsBarrel.run).toThrowError('assets-barrel property should be an array');
  });

  it('should throw error when empty array', () => {
    cwdStub.mockReturnValue('../test/mocks/empty-array');
    expect(assetsBarrel.run).toThrowError('assets-barrel property should have at least one element');
  });

  it('should throw error when dir is empty', () => {
    cwdStub.mockReturnValue('../test/mocks/empty-dir');
    const mockedAssets = fs.readdirSync('test/mocks/empty-dir/files');
    jest.spyOn(fs, 'readdirSync').mockReturnValueOnce(mockedAssets);
    expect(assetsBarrel.run).toThrowError(`Directory 'files' is empty`);
  });

  it('should throw error when no matched extensions', () => {
    cwdStub.mockReturnValue('../test/mocks/unmatched-exts');
    const mockedAssets = fs.readdirSync('test/mocks/unmatched-exts/files');
    jest.spyOn(fs, 'readdirSync').mockReturnValueOnce(mockedAssets);
    expect(assetsBarrel.run).toThrowError('[1 / 1] No files matched the specified extensions [jpg] in files');
  });

  it('should create barrel file', () => {
    const expectedContent = 'import image2 from \'./image2.jpg\';\n\nconst images = {\n  \'files/image2.jpg\': image2,\n}\n\nexport default images'
    cwdStub.mockReturnValue('../test/mocks/success');
    const mockedAssets = fs.readdirSync('test/mocks/success/files');
    jest.spyOn(fs, 'readdirSync').mockReturnValueOnce(mockedAssets);
    const writeStub = jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {});
    assetsBarrel.run();
    expect(writeStub).toHaveBeenLastCalledWith('../test/mocks/success/files/images.js', expectedContent);
  });

  it('should create barrel file using assets-barrel.json config', () => {
    const expectedContent = 'import image2 from \'./image2.jpg\';\n\nconst images = {\n  \'files/image2.jpg\': image2,\n}\n\nexport default images'
    cwdStub.mockReturnValue('../test/mocks/success');
    const mockedAssets = fs.readdirSync('test/mocks/success/files');
    jest.spyOn(fs, 'readdirSync').mockReturnValueOnce(mockedAssets);
    const writeStub = jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {});
    assetsBarrel.run();
    expect(writeStub).toHaveBeenLastCalledWith('../test/mocks/success/files/images.js', expectedContent);
  });

  it('should create barrel file with parsed variable names', () => {
    const expectedContent = 'import image2 from \'./image2.jpg\';\n\nconst images = {\n  image2,\n}\n\nexport default images'
    cwdStub.mockReturnValue('../test/mocks/success-parse');
    const mockedAssets = fs.readdirSync('test/mocks/success-parse/files');
    jest.spyOn(fs, 'readdirSync').mockReturnValueOnce(mockedAssets);
    const writeStub = jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {});
    assetsBarrel.run();
    expect(writeStub).toHaveBeenLastCalledWith('../test/mocks/success-parse/files/images.js', expectedContent);
  });
});
