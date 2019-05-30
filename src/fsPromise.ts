import * as fs from 'fs';

export class FsPromise {
  static async exists(fsPath: string) {
    return new Promise((resolve: (value: boolean) => void) => {
      fs.exists(fsPath, (isExist: boolean) => {
        resolve(isExist);
      });
    });
  }

  static async mkdir(fsPath: string) {
    return new Promise(
      (resolve: (value: void) => void, reject: (reason: Error) => void) => {
        fs.mkdir(fsPath, (error: Error | null) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
          return;
        });
      }
    );
  }

  static async readFile(fsPath: string) {
    return new Promise(
      (resolve: (value: string) => void, reject: (reason: Error) => void) => {
        fs.readFile(fsPath, (error: Error | null, data: Buffer) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(data.toString());
          return;
        });
      }
    );
  }

  static async readdir(fsPath: string) {
    return new Promise(
      (resolve: (value: string[]) => void, reject: (reason: Error) => void) => {
        fs.readdir(fsPath, (error: Error | null, files: string[]) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(files);
          return;
        });
      }
    );
  }

  static async stat(fsPath: string) {
    return new Promise(
      (resolve: (value: fs.Stats) => void, reject: (reason: Error) => void) => {
        fs.stat(fsPath, (error: Error | null, stats: fs.Stats) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(stats);
          return;
        });
      }
    );
  }
}
