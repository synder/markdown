/**
 * Created by synder on 16/5/2.
 */

const config = require('./config');
const file = require('./script/file');
const menus = require('./script/menus');
const EVENTS = require('./script/events');
const path = require('path');
const electron = require('electron');
const ipcMain = electron.ipcMain;
const app = electron.app;

const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu

let mainWindow = null;
let dirname = __dirname;

var cache = {};

/**
* @desc create app menus
*/
function appCreateMenus(window, cache, app){
    const template = menus.init(window, cache, app);
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
};


/**
 * @desc create windows
 */
function appCreateWindow(){
    mainWindow = new BrowserWindow({width: config.window.width, height: config.window.height});

    mainWindow.loadURL(`file://${dirname}/app/html/index.html`);

    if(config.dev){
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    return mainWindow;
}



/**
 * @desc app event
 * */
app.on('ready', function () {
    appCreateMenus(appCreateWindow(), cache, app);
});

app.on('activate', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('window-all-closed', function () {
    if (mainWindow === null) {
        appCreateMenus(appCreateWindow(), cache, app);
    }
});

