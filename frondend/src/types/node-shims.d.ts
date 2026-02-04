declare module 'node:fs' {
  export interface Dirent {
    name: string;
    isDirectory(): boolean;
  }

  interface FsModule {
    readFileSync(path: string, encoding: 'utf8'): string;
    readdirSync(path: string, options: { withFileTypes: true }): Dirent[];
  }

  const fs: FsModule;
  export default fs;
}

declare module 'node:path' {
  interface PathModule {
    sep: string;
    resolve(...segments: string[]): string;
    dirname(path: string): string;
    join(...segments: string[]): string;
    extname(path: string): string;
    relative(from: string, to: string): string;
  }

  const path: PathModule;
  export default path;
}

declare module 'node:url' {
  export function fileURLToPath(url: string): string;
}
