import * as vscode from 'vscode';

const channel = vscode.window.createOutputChannel('Beaker');

export class Notification {
  static show(
    level: 'info' | 'error' | 'warning',
    message: string,
    details?: string
  ) {
    if (details) {
      channel.show();
      channel.appendLine(details);
    }
    switch (level) {
      case 'info':
        vscode.window.showInformationMessage(message);
        break;
      case 'error':
        vscode.window.showErrorMessage(message);
        break;
      case 'warning':
        vscode.window.showWarningMessage(message);
        break;
      default:
        break;
    }
  }

  static log(message: string) {
    channel.show();
    channel.appendLine(message);
  }
}
