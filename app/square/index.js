const https = require('https');
const MDI = require('markdown-it');
const AdmZip = require('adm-zip');
const os = require('os');
const path = require('path');
const fs = require('fs');

async function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const rawData = get(res.headers.location);
        resolve(rawData);
        return;
      }
      let rawData = '';
      res.on('data', chunk => {
        rawData += chunk;
      });
      res.on('end', () => {
        resolve(rawData);
        return;
      });
    }).on('error', error => {
      reject(error);
      return;
    });
  });
}

async function getRes(url) {
  return new Promise(async (resolve, reject) => {
    https.get(url, async (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        res = await getRes(res.headers.location);
        resolve(res);
        return;
      }
      resolve(res);
      return;
    }).on('error', error => {
      reject(error);
      return;
    });
  });
}

exports.main = function(webview) {

}

exports.getAppIndex = async function() {
  const url = `https://raw.githubusercontent.com/Sneezry/beaker-square/master/index.json`;
  const rawIndex = await get(url);
  return JSON.parse(rawIndex);
}

exports.getReadme = async function(repo) {
  const url = `https://raw.githubusercontent.com/${repo}/master/README.md`;
  const rawReadme = await get(url);
  return new MDI().render(rawReadme);
}

exports.install = async function(repo, release, bin) {
  return new Promise(async (resolve) => {
    const url = `https://github.com/${repo}/releases/download/${release}/${bin}`;
    const tmpPath = path.join(os.tmpdir(), bin);
    const stream = fs.createWriteStream(tmpPath);
    stream.on('finish', () => {
      const id = path.basename(bin, '.tka');
      const appDirPath = path.join(os.homedir(), '.vscode-toolkit', id);
      const zip = new AdmZip(tmpPath);
      zip.extractAllTo(appDirPath, true);
      resolve();
      return;
    });
    const res = await getRes(url);
    res.pipe(stream);
  });
}

exports.isInstalled = async function(bin) {
  return new Promise(resolve => {
    const id = path.basename(bin, '.tka');
    const appPath = path.join(os.homedir(), '.vscode-toolkit', id);
    fs.exists(appPath, resolve);
  });
}