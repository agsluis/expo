import { vol } from 'memfs';
import path from 'path';
import resolveFrom from 'resolve-from';

import { loadReactNativeConfigAsync } from '../reactNativeConfig';

jest.mock('fs/promises');
jest.mock('resolve-from');

const EXPO_MONOREPO_ROOT = path.resolve(__dirname, '../../../../..');

describe(loadReactNativeConfigAsync, () => {
  afterEach(() => {
    vol.reset();
  });

  it('should load react-native.config.js', async () => {
    await jest.isolateModulesAsync(async () => {
      const config = {
        version: '1.0.0',
      };
      vol.fromJSON({
        '/app/react-native.config.js': JSON.stringify(config),
      });
      jest.doMock('/app/react-native.config.js', () => config, {
        virtual: true,
      });
      const result = await loadReactNativeConfigAsync('/app');
      expect(result).toEqual({ version: '1.0.0' });
    });
  });

  // This test case should be the first of react-native.config.ts test cases.
  // Because we cache the resolved typescript module, as long as typescript is resolved,
  // we have no longer to resolve typescript as mocked undefined result.
  it('should return null for react-native.confif.ts if typescript is not found', async () => {
    await jest.isolateModulesAsync(async () => {
      vol.fromJSON({
        '/app/react-native.config.ts': 'module.exports = { version: "1.0.0" };',
      });
      const mockResolveFrom = resolveFrom.silent as jest.MockedFunction<typeof resolveFrom.silent>;
      mockResolveFrom.mockReturnValueOnce(undefined);
      const result = await loadReactNativeConfigAsync('/app');
      expect(result).toBe(null);
    });
  });

  it('should load react-native.config.ts', async () => {
    await jest.isolateModulesAsync(async () => {
      vol.fromJSON({
        '/app/react-native.config.ts': 'export default { version: "1.0.0" };',
      });
      const mockResolveFrom = resolveFrom.silent as jest.MockedFunction<typeof resolveFrom>;
      mockResolveFrom.mockReturnValueOnce(
        path.join(EXPO_MONOREPO_ROOT, 'node_modules', 'typescript')
      );
      const result = await loadReactNativeConfigAsync('/app');
      expect(result).toEqual({ version: '1.0.0' });
    });
  });

  it('should load react-native.config.ts with cjs exports', async () => {
    await jest.isolateModulesAsync(async () => {
      vol.fromJSON({
        '/app/react-native.config.ts': 'module.exports = { version: "1.0.0" };',
      });
      const mockResolveFrom = resolveFrom.silent as jest.MockedFunction<typeof resolveFrom.silent>;
      // Use typescript from expo monorepo
      mockResolveFrom.mockReturnValueOnce(
        path.resolve(__dirname, '../../../../../node_modules', 'typescript')
      );
      const result = await loadReactNativeConfigAsync('/app');
      expect(result).toEqual({ version: '1.0.0' });
    });
  });
});
