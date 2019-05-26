import * as vscode from 'vscode';

import {Gallery} from './gallery';
import {Launcher} from './launcher';
import {Notification} from './notification';

export async function activate(context: vscode.ExtensionContext) {
  const bar =
      vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 999999);
  bar.color = '#4CAF50';
  bar.text = '$(beaker)';
  bar.command = 'vscode-toolkit.gallery';
  bar.tooltip = 'Toolkit Launcher';
  bar.show();

  let gallery =
      vscode.commands.registerCommand('vscode-toolkit.gallery', async () => {
        try {
          await Gallery.init();
        } catch (error) {
          Notification.show(
              'error', 'Toolkit launcher initialize failed.',
              (error as Error).message);
          return;
        }

        new Launcher('::launcher').run();
      });

  let getApps = vscode.commands.registerCommand(
      'vscode-toolkit.getApps', Gallery.getApps);

  let launcher =
      vscode.commands.registerCommand('vscode-toolkit.launch', (id: string) => {
        const launcher = new Launcher(id);
        try {
          launcher.run();
        } catch (error) {
          Notification.log((error as Error).message);
        }
      });

  context.subscriptions.push(gallery);
  context.subscriptions.push(getApps);
  context.subscriptions.push(launcher);
}

export function deactivate() {}
