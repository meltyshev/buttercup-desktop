import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { isHighSierra, isOSX } from '../shared/utils/platform';
import configureStore from '../shared/store/configure-store';
import { filterStore } from '../shared/store/filter-store';
import { setupWindows } from './windows';
import pify from 'pify';
import log from 'electron-log';
// import jsonStorage from 'electron-json-storage';
import { getWindowManager } from './lib/window-manager';

// const storage = pify(jsonStorage);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  const windowManager = getWindowManager();

  // let state = {};
  // try {
  //   jsonStorage.get('state', (err, d) => {
  //     console.log(d);
  //   });
  //   log.info('Restoring state...', state);
  // } catch (err) {
  //   log.error('Unable to read state json file', err);
  // }

  setupWindows();
  windowManager.buildWindowOfType('main', win => {});

  app.on('activate', function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    // if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
