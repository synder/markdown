/**
 * @desc menus
 * */

const fs = require('fs');
const path = require('path');

const electron = require('electron');
const dialog = electron.dialog;


const EVENTS = require('./events');

exports.init = function (mainWindow, cache, app) {
    var temp =  [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New File...',
                    accelerator: 'CmdOrCtrl+N',
                    click: function () {
                        mainWindow.webContents.send(EVENTS.MENUS_EVENT.NEW_FILE, '');
                    }
                },
                {
                    label: 'Open File...',
                    accelerator: 'CmdOrCtrl+O',
                    click: function () {
                        dialog.showOpenDialog({
                            properties: ['openFile', 'openDirectory', 'multiSelections'],
                            filters: [
                                {name: 'Markdown', extensions: ['md', 'MD']}
                            ]
                        }, function (files) {
                            var filePath = files && files.length > 0 ? files[0] : null;
                            if (filePath) {
                                fs.readFile(filePath, {encoding: 'utf8'}, function (err, content) {
                                    if (err) {
                                        return dialog.showErrorBox('Open File Error', filePath);
                                    }

                                    mainWindow.webContents.send(EVENTS.MENUS_EVENT.OPEN_FILE, content);
                                });
                            }
                        });
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Save File...',
                    accelerator: 'CmdOrCtrl+S',
                    click: function () {

                        if(cache.filename){
                            return mainWindow.webContents.send(EVENTS.MENUS_EVENT.SAVE_FILE, cache.filename);
                        }

                        dialog.showSaveDialog({
                            title: 'Save an Markdown',
                            filters: [
                                { name: 'Markdown', extensions: ['md'] }
                            ]
                        }, function (filename) {
                            if(filename){
                                cache.filename = filename;
                                mainWindow.webContents.send(EVENTS.MENUS_EVENT.SAVE_FILE, filename);
                            }
                        });
                    }
                },
                {
                    label: 'Save File As',
                    accelerator: 'Shift+CmdOrCtrl+S',
                    click: function () {
                        dialog.showSaveDialog({
                            title: 'Save as Markdown or HTML',
                            filters: [
                                {name: 'All Files', extensions: ['*']}
                            ]
                        }, function (filename) {
                            if(filename){
                                mainWindow.webContents.send(EVENTS.MENUS_EVENT.SAVE_FILE, filename);
                            }
                        });
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Export to HTML',
                    accelerator: 'Shift+CmdOrCtrl+H',
                    click: function () {
                        dialog.showSaveDialog({
                            title: 'Export to HTML',
                            filters: [
                                {name: 'HTML', extensions: ['html']}
                            ]
                        }, function (filename) {
                            if(filename){
                                mainWindow.webContents.send(EVENTS.MENUS_EVENT.EXPORT_HTML_FILE, filename);
                            }
                        });
                    }
                },
                {
                    label: 'Export to PDF',
                    accelerator: 'Shift+CmdOrCtrl+H',
                    click: function () {
                        dialog.showSaveDialog({
                            title: 'Export to PDF',
                            filters: [
                                {name: 'All Files', extensions: ['*']}
                            ]
                        }, function (filename) {
                            if(filename){
                                cache.filename = filename;
                                mainWindow.webContents.send(EVENTS.MENUS_EVENT.EXPORT_PDF_FILE, filename);
                            }
                        });
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Print File',
                    accelerator: 'Shift+CmdOrCtrl+P',
                    click: function () {
                        console.log('print');
                    }
                }
            ]
        },
        {
            label: 'Eidt',
            submenu: [
                {
                    label: 'Undo',
                    accelerator: 'CmdOrCtrl+Z',
                    role: 'undo'
                },
                {
                    label: 'Redo',
                    accelerator: 'Shift+CmdOrCtrl+Z',
                    role: 'redo'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Cut',
                    accelerator: 'CmdOrCtrl+X',
                    role: 'cut'
                },
                {
                    label: 'Copy',
                    accelerator: 'CmdOrCtrl+C',
                    role: 'copy'
                },
                {
                    label: 'Paste',
                    accelerator: 'CmdOrCtrl+V',
                    role: 'paste'
                },
                {
                    label: 'Find',
                    accelerator: 'CmdOrCtrl+F',
                    role: 'paste'
                },
                {
                    label: 'Replace',
                    accelerator: 'CmdOrCtrl+F',
                    role: 'paste'
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Split View',
                    accelerator: 'Shift+S',
                    click: function (item, focusedWindow) {
                        mainWindow.webContents.send(EVENTS.MENUS_EVENT.SPLIT_VIEW);
                    }
                },
                {
                    label: 'Toggle Preview',
                    accelerator: 'CmdOrCtrl+P',
                    click: function (item, focusedWindow) {
                        mainWindow.webContents.send(EVENTS.MENUS_EVENT.PRE_VIEW);
                    }
                },
                {
                    label: 'Toggle Full Screen',
                    accelerator: (function () {
                        if (process.platform === 'darwin') {
                            return 'Ctrl+Command+F'
                        } else {
                            return 'F11'
                        }
                    })(),
                    click: function (item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
                        }
                    }
                },
                {
                    label: 'Lock Screen',
                    accelerator: 'CmdOrCtrl+L',
                    click: function () {
                        mainWindow.webContents.send(EVENTS.MENUS_EVENT.LOCK_VIEW);
                    }
                }
            ]
        },
        {
            label: 'Window',
            role: 'window',
            submenu: [
                {
                    label: 'Minimize',
                    accelerator: 'CmdOrCtrl+M',
                    role: 'minimize'
                },
                {
                    label: 'Colse',
                    accelerator: 'CmdOrCtrl+W',
                    role: 'close'
                }
            ]
        },
        {
            label: 'Help',
            role: 'help',
            submenu: [
                {
                    label: 'Slectron',
                    click: function () {
                        electron.shell.openExternal('http://electron.atom.io')
                    }
                }, {
                    label: 'Editor.md',
                    click: function () {
                        electron.shell.openExternal('https://pandao.github.io')
                    }
                }
            ]
        }
    ]

    if (process.platform === 'darwin') {
        temp.unshift({
            label: 'markdown',
            submenu: [
                {
                    label: 'About',
                    role: 'about'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Services',
                    role: 'services',
                    submenu: []
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Hide',
                    accelerator: 'Command+H',
                    role: 'hide'
                },
                {
                    label: 'Hide Others',
                    accelerator: 'Command+Alt+H',
                    role: 'hideothers'
                },
                {
                    label: 'Show All',
                    role: 'unhide'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Quit',
                    accelerator: 'Command+Q',
                    click: function () {
                        app.quit()
                    }
                }
            ]
        })
    }

    return temp;
};