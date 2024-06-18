import { vol } from 'memfs';

import { anyMatchAsync, everyMatchAsync } from '../glob';

// See: https://github.com/isaacs/node-glob/issues/515#issuecomment-1478780708
jest.mock('node:fs/promises');

describe(everyMatchAsync, () => {
  beforeEach(() => {
    vol.reset();
  });

  it('returns all matches for a glob pattern', async () => {
    vol.fromJSON(
      {
        'src/index.ts': '',
        'src/components/index.ts': '',
        'package.json': '',
      },
      '/project'
    );

    await expect(everyMatchAsync('**/*.ts', { cwd: '/project' })).resolves.toEqual([
      'src/index.ts',
      'src/components/index.ts',
    ]);
  });

  it('returns empty array for no matches', async () => {
    await expect(everyMatchAsync('**/*.ts')).resolves.toEqual([]);
  });
});

describe(anyMatchAsync, () => {
  beforeEach(() => {
    vol.reset();
  });

  it('returns the first match for a glob pattern', async () => {
    vol.fromJSON(
      {
        'src/index.ts': '',
        'src/components/index.ts': '',
        'package.json': '',
      },
      '/project'
    );

    await expect(anyMatchAsync('**/*.ts', { cwd: '/project' })).resolves.toEqual(['src/index.ts']);
  });

  it('returns empty array for no matches', async () => {
    await expect(anyMatchAsync('**/*.ts')).resolves.toEqual([]);
  });
});
