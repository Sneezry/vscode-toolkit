import * as vscode from 'vscode';

import {Gallery} from './gallery';
import {Launcher} from './launcher';
import {Notification} from './notification';
import {Webview} from './webview';
import {WebviewStack} from './webviewStack';

export async function activate(context: vscode.ExtensionContext) {
  const bar =
      vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 999999);
  bar.color = '#4CAF50';
  bar.text = '$(beaker)';
  bar.command = 'vscode-toolkit.gallery';
  bar.tooltip = 'Beaker Launcher';
  bar.show();

  let gallery =
      vscode.commands.registerCommand('vscode-toolkit.gallery', async () => {
        try {
          await Gallery.init();
        } catch (error) {
          Notification.show(
              'error', 'Beaker launcher initialize failed.',
              (error as Error).message);
          return;
        }

        new Launcher('::launcher').run();
      });

  let getApps = vscode.commands.registerCommand(
      'vscode-toolkit.getApps', Gallery.getApps);

  let launcher =
      vscode.commands.registerCommand('vscode-toolkit.launch', async (id: string) => {
        if (WebviewStack.stack[id]) {
          WebviewStack.stack[id].show();
          return;
        }
        const launcher = new Launcher(id);
        try {
          await launcher.run();
          WebviewStack.stack[id] = launcher.webview as Webview;
        } catch (error) {
          Notification.log((error as Error).message);
        }
      });

  context.subscriptions.push(gallery);
  context.subscriptions.push(getApps);
  context.subscriptions.push(launcher);
}

export function deactivate() {}
