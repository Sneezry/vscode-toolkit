const vscode = require('vscode');
const AdmZip = require('adm-zip');
const os = require('os');
const path = require('path');
let wv;

exports.main = async function(webview) {
  wv = webview;
  await updateApps();
}

exports.launch = function(app) {
  vscode.commands.executeCommand('vscode-toolkit.launch', app)
}

exports.install = async function() {
  const appPathChoice = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    filters: {
      'Toolkit App': ['tka']
    }
  });

  if (!appPathChoice || !appPathChoice[0]) {
    return;
  }

  const appPath = appPathChoice[0].fsPath;
  const id = path.basename(appPath, '.tka');
  const appDirPath = path.join(os.homedir(), '.vscode-toolkit', id);
  const zip = new AdmZip(appPath);
  zip.extractAllTo(appDirPath, true);
  await updateApps();
}

async function updateApps() {
  const apps = await vscode.commands.executeCommand('vscode-toolkit.getApps');
  wv.send(apps);
}