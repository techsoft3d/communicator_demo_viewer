const { contextBridge, ipcRenderer, remote } = require('electron')
//const globalMessages = require('./utils.js') as of version 20 of electron this isn't allowed
//so for now just using strings until I can figure out a better way without compromising security

contextBridge.exposeInMainWorld('electronAPI', {
    handleOpenFile: (callback) => ipcRenderer.on('open-file',callback),
    handleOnUserCode: (callback) => ipcRenderer.on('user-code',callback),
    handleToggle: (callback) => ipcRenderer.on('toggle-this',callback),
    handleSetView: (callback) => ipcRenderer.on('set-view-orientation',callback),
    handleSetProjection: (callback) => ipcRenderer.on('set-projection-mode',callback),
    handleSetDrawMode: (callback) => ipcRenderer.on('set-draw-mode',callback)
})