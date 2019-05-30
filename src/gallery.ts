import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { FsPromise } from './fsPromise';

export class Gallery {
  private static getRootFolder() {
    const homeDir = os.homedir();
    const toolkitDir = path.join(homeDir, '.vscode-toolkit');
    return toolkitDir;
  }

  private static async getAppInfo(fsPath: string) {
    const stats = await FsPromise.stat(fsPath);
    const isDirectory = stats.isDirectory();
    if (!isDirectory) {
      return null;
    }

    const packageJsonPath = path.join(fsPath, 'package.json');
    const packageJsonExist = await FsPromise.exists(fsPath);
    if (!packageJsonExist) {
      return null;
    }

    const packageJson = (await import(packageJsonPath)) as {
      displayName: string;
      icon: string;
    };
    const displayName = packageJson.displayName;
    const icon = vscode.Uri.file(path.join(fsPath, packageJson.icon))
      .with({ scheme: 'vscode-resource' })
      .toString();
    return { id: path.basename(fsPath), displayName, icon };
  }

  static async init() {
    const toolkitDir = Gallery.getRootFolder();
    const toolkitDitExists = await FsPromise.exists(toolkitDir);
    if (!toolkitDitExists) {
      await FsPromise.mkdir(toolkitDir);
    }
  }

  static async getApps() {
    const apps: Array<{ id: string; displayName: string; icon: string }> = [];
    const toolkitDir = Gallery.getRootFolder();
    const files = await FsPromise.readdir(toolkitDir);
    for (const file of files) {
      const fullPath = path.join(toolkitDir, file);
      const appInfo = await Gallery.getAppInfo(fullPath);
      if (appInfo) {
        apps.push(appInfo);
      }
    }

    return apps;
  }
}
