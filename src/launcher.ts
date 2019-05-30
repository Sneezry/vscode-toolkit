import * as os from 'os';
import * as path from 'path';
import { FsPromise } from './fsPromise';
import { Webview } from './webview';

export class Launcher {
  entry: any;
  webview: Webview | undefined;
  constructor(private id: string) {}

  async run() {
    return new Promise(
      async (
        resolve: (value: void) => void,
        reject: (reason: Error) => void
      ) => {
        let toolkitDir = '';
        const isBuiltinApp = /^::/.test(this.id);
        if (isBuiltinApp) {
          const id = this.id.substr(2);
          toolkitDir = path.join(__dirname, '..', 'app', id);
        } else {
          const homeDir = os.homedir();
          toolkitDir = path.join(homeDir, '.vscode-toolkit', this.id);
        }

        const toolkitDitExists = await FsPromise.exists(toolkitDir);
        if (!toolkitDitExists) {
          const error = new Error(
            `Cannot launch ${this.id}, directory not found.`
          );
          reject(error);
          return;
        }

        const packageJsonPath = path.join(toolkitDir, 'package.json');
        const packageJsonExists = await FsPromise.exists(packageJsonPath);
        if (!packageJsonExists) {
          const error = new Error(
            `Cannot launch ${this.id}, package.json not found.`
          );
          reject(error);
          return;
        }

        const packageJson = require(packageJsonPath) as {
          main: string;
          displayName: string;
          view: string;
        };
        const entryRelativePath = packageJson.main;
        if (!entryRelativePath) {
          const error = new Error(
            `Cannot launch ${this.id}, entry file path not found.`
          );
          reject(error);
          return;
        }

        const entryPath = path.join(toolkitDir, entryRelativePath);
        const entryExists = await FsPromise.exists(entryPath);
        if (!entryExists) {
          const error = new Error(
            `Cannot launch ${this.id}, entry file not found.`
          );
          reject(error);
          return;
        }

        if (!packageJson.view) {
          const error = new Error(
            `Cannot launch ${this.id}, view path not found.`
          );
          reject(error);
          return;
        }

        this.entry = await import(entryPath);

        const viewPath = path.join(toolkitDir, packageJson.view);
        const viewPagePath = path.join(viewPath, 'index.html');
        const viewPageExists = await FsPromise.exists(viewPagePath);
        if (!viewPageExists) {
          const error = new Error(
            `Cannot launch ${this.id}, view path not found.`
          );
          reject(error);
        }
        this.webview = new Webview(
          this.id,
          isBuiltinApp,
          packageJson.displayName,
          viewPath,
          this
        );

        try {
          await this.webview.show();
          await this.entry.main(this.webview);
        } catch (error) {
          reject(error);
          return;
        }

        resolve();
        return;
      }
    );
  }
}
