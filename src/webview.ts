import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

import {FsPromise} from './fsPromise';
import {Launcher} from './launcher';

export class Webview {
  private panel: vscode.WebviewPanel|undefined;
  constructor(
      private isBuiltinApp: boolean, private name: string,
      private rootPath: string, private launcher: Launcher) {}

  async show() {
    const pagePath = path.join(this.rootPath, 'index.html');
    const pageExsits = await FsPromise.exists(pagePath);
    if (!pageExsits) {
      throw new Error('Cannot open index.html');
    }
    const rootPathFs =
        vscode.Uri.file(this.rootPath).with({scheme: 'vscode-resource'});
    const rootPath = rootPathFs.toString() + '/';
    let html = await FsPromise.readFile(pagePath);
    let titleMath = html.match('<title>(.*?)</title>');
    const title = titleMath && titleMath[1] ? titleMath[1] : this.name;
    const injectScript = `<script>
  const vscode = acquireVsCodeApi();
  const resolveStack = [];
  const NodeJS = new Proxy(() => {}, {
    get: (_, key, reciver) => {
      return async function(...args) {
        return new Promise(resolve => {
          const type = 'function';
          const messageId = new Date().getTime() + Math.random();
          vscode.postMessage({
            type,
            messageId,
            key,
            args
          });

          resolveStack.push({messageId, resolve});
        })
      }
    }
  });

  window.addEventListener('message', event => {
    const message = event.data;
  
    if (message.type === 'function') {
      for (let index = 0; index < resolveStack.length; index++) {
        const resolveItem = resolveStack[index];
        if (resolveItem.messageId === message.messageId) {
          resolveItem.resolve(message.result);
          resolveStack.splice(index, 1);
          break;
        }
      }
    } else if (message.type === 'message') {
      if (typeof messager === 'function') {
        messager(message.payload);
      }
    }
  });
    </script>`;
    if (/(<head(\s.*)?>)/.test(html)) {
      html = html.replace(
          /(<head(\s.*)?>)/, `$1<base href="${rootPath}">${injectScript}`);
    } else if (/(<html(\s.*)?>)/.test(html)) {
      html = html.replace(
          /(<html(\s.*)?>)/,
          `$1<head><base href="${rootPath}">${injectScript}</head>`);
    } else {
      html = `<head><base href="${rootPath}">${injectScript}</head>${html}`;
    }

    const builtinAppDir =
        vscode.Uri.file(path.join(__dirname, '..', 'app')).with({
          scheme: 'vscode-resource'
        });
    const rootAppDir =
        vscode.Uri.file(path.join(os.homedir(), '.vscode-toolkit')).with({
          scheme: 'vscode-resource'
        });
    this.panel = vscode.window.createWebviewPanel(
        'vscode-toolkit', title, vscode.ViewColumn.One, {
          enableScripts: true,
          enableCommandUris: true,
          retainContextWhenHidden: true,
          localResourceRoots: this.isBuiltinApp ? [builtinAppDir, rootAppDir] :
                                                  [rootPathFs]
        });
    this.panel.webview.html = html;
    this.panel.webview.onDidReceiveMessage(async message => {
      const type = message.type;
      if (type !== 'function') {
        return;
      }
      const messageId = message.messageId;
      const result =
          await this.launcher.entry[message.key].apply(null, message.args);
      if (this.panel) {
        this.panel.webview.postMessage({type, messageId, result});
      }
    });
    this.panel.onDidDispose(() => {
      try {
        this.launcher.entry.destroy();
      } catch (ignore) {
      }

      delete this.panel;
      delete this.launcher.entry;
      delete this.launcher;
    }, this);
  }

  send(message: string) {
    if (this.panel) {
      this.panel.webview.postMessage({type: 'message', payload: message});
    }
  }
}