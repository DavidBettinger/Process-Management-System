import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

describe('template syntax guard', () => {
  it('does not use deprecated structural directives', () => {
    const specFile = fileURLToPath(import.meta.url);
    const marker = `${path.sep}src${path.sep}app`;
    const markerIndex = specFile.lastIndexOf(marker);
    const appRoot =
      markerIndex >= 0
        ? specFile.slice(0, markerIndex + marker.length)
        : path.resolve(path.dirname(specFile), '..');
    const files = collectFiles(appRoot, ['.html', '.ts']);
    const forbidden = ['*ngIf', '*ngFor', '*ngSwitch', '*ngSwitchCase', '*ngSwitchDefault'];

    const matches = files.flatMap((file) => {
      if (file.endsWith('.spec.ts')) {
        return [];
      }
      const content = fs.readFileSync(file, 'utf8');
      const hits = forbidden.filter((token) => content.includes(token));
      if (hits.length === 0) {
        return [];
      }
      return [`${path.relative(appRoot, file)}: ${hits.join(', ')}`];
    });

    expect(matches).toEqual([]);
  });
});

function collectFiles(root: string, extensions: string[]): string[] {
  const entries = fs.readdirSync(root, { withFileTypes: true });
  return entries.flatMap((entry: { name: string; isDirectory(): boolean }) => {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', 'out-tsc', '.angular', '.git'].includes(entry.name)) {
        return [];
      }
      return collectFiles(entryPath, extensions);
    }
    if (extensions.includes(path.extname(entry.name))) {
      return [entryPath];
    }
    return [];
  });
}
