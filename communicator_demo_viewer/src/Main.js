const electron = require("electron");
const ipc = electron.ipcMain;
const dialog = electron.dialog;
const app = electron.app;
const Menu = electron.Menu;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const url = require("url");

//message strings - defined global so they can be used in the render process
global.messages = { openFileMessage: 'open-file',
                    exportFileMessage: 'export-file',
                    toggleMessage: 'toggle-this',
                    onUserCodeMessage: 'user-code',
                    setViewMessage: 'set-view-orientation',
                    setProjectionModeMessage: 'set-projection-mode',
                    setDrawModeMessage: 'set-draw-mode'
                  };

global.strings = { navCubeString: 'navCube',
                   triadString: 'triad',
                   notImplemented: 'Function not implemented',
                   userCodeOne: 'user-one',
                   userCodeTwo: 'user-two',
                   userCodeThree: 'user-three',
                 };

global.viewOrientations = { isoView: 'iso',
                            backView: 'back',
                            frontView: 'front',
                            leftView: 'left',
                            rightView: 'right',
                            topView: 'top',
                            bottomView: 'bottom'
                          };

global.projectionModes = { orthographic: 'orthographic',
                           perspective: 'perspective'
                         };

global.drawModes = { wireframeOnShaded: 'wireframe-on-shaded',
                     shaded: 'shaded',
                     wireframe: 'wireframe',
                     hiddenLine: 'hidden-line',
                     xRay: 'x-ray'
                   };

let win = null;

function notImplemented(){
     dialog.showMessageBox({
        type: "error",
        buttons: ["Ok"],
        message: global.strings.notImplemented
     });
}

function createWindow(){
    win = new BrowserWindow({
        width:1024, 
        height: 768, 
        show: false, 
        title: "Hoops Communicator Desktop",
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    win.once('ready-to-show', () => {
        win.show();
    })

    win.on('closed', () => {
        win = null;
    });

    createMenu(win);
}

app.disableDomainBlockingFor3DAPIs();

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});

function openFileDialog(win, rendererType){
    dialog.showOpenDialog({properties: ['openFile'], filters: [
            {name: 'All Supported Files ', extensions: ['scz','hsf','obj','pdf','prc','skp','stl',
            'u3d','WRL','VRML','sat','sab','ipt','iam','model','session','dlv','exp','CATDrawing','CATPart',
            'CATProduct','CATShape','cgr','3dxml','asm','neu','prt','xax','xpr','mf1','arc','unv','pkg','ifc','ifczip',
            'igs','iges','jt','x_b','x_t','xmt','xmt_txt','3DM','asm','par','pwd','psm','sldasm','sldprt','stp','step',
            'stp.z','vda','dwg','dxf']},
            {name: 'Stream Cache', extensions: ['scz']},
            {name: 'HOOPS Stream Format (HSF)', extensions: ['hsf']},
            {name: 'OBJ', extensions: ['obj']},
            {name: 'PDF', extensions: ['pdf']},
            {name: 'PRC', extensions: ['prc']},
            {name: 'Sketchup', extensions: ['skp']},
            {name: 'Stero Lithography (STL)', extensions: ['stl']},
            {name: 'Universal 3D', extensions: ['u3d']},
            {name: 'VRML', extensions: ['WRL','VRML']},
            {name: 'ACIS', extensions: ['sat','sab']},
            {name: 'Autodesk Inventor', extensions: ['ipt','iam']},
            {name: 'CATIA V4', extensions: ['model','session','dlv','exp']},
            {name: 'CATIA V5', extensions: ['CATDrawing','CATPart','CATProduct','CATShape','cgr']},
            {name: 'CATIA V5/V6[3DXML]', extensions: ['3dxml']},
            {name: 'Creo - Pro/E', extensions: ['asm','neu','prt','xas','xpr']},
            {name: 'I-deas', extensions: ['mf1','arc','unv','pkg']},
            {name: 'IFC', extensions: ['ifc','ifczip']},
            {name: 'IGES', extensions: ['igs','iges']},
            {name: 'JT', extensions: ['jt']},
            {name: 'Parasolid', extensions: ['x_b','x_t','xmt','xmt_txt']},
            {name: 'Rhino3D', extensions: ['3DM']},
            {name: 'Solid Edge', extensions: ['asm','par','pwd','psm']},
            {name: 'SolidWorks', extensions: ['sldasm','sldprt']},
            {name: 'STEP', extensions: ['stp','step','stp.z']},
            {name: 'Unigraphics-NX', extensions: ['prt']},
            {name: 'VDA-FS', extensions: ['vda']},
            {name: 'DWG', extensions: ['dwg']},
            {name: 'DXF', extensions: ['dxf']}],
            title: 'Import File'},
        ( files ) => {
            if( files ){
                win.webContents.send( global.messages.openFileMessage, files, rendererType );
            }
        }
    )
}

function createMenu(win){
    const appMenu = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open With CSR...',
                    accelerator: 'Ctrl+O',
                    click: () => {
                        openFileDialog(win, "client");
                    }
                },
                {
                    label: 'Open With SSR...',
                    accelerator: 'Shift+Ctrl+O',
                    click: () => {
                        openFileDialog(win, "server");
                    }
                },
                {type: 'separator'},
                {
                    label: 'Export',
                    accelerator: 'Ctrl+E',
                    click: () => {
                        notImplemented();
                        /*
                        dialog.showSaveDialog({ title: "Export File",
                                                filters: [
                                                         { name: "HTML", extensions: ['html'] },
                                                         { name: "3D PDF", extensions: ['pdf'] }
                                                ]
                        },
                        ( fileName ) => {
                            if( fileName ){
                                win.webContents.send( global.messages.exportFileMessage, fileName );
                            }
                        })
                        */
                    }
                },
                {type: 'separator'},
                {
                    label: 'Exit',
                    accelerator: 'Ctrl+X',
                    click: () => {app.quit();}
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Toggle Nav Cube',
                    // id: 'nav-toggle',
                    // type: 'checkbox',
                    // checked: true,
                    click: () => {
                        win.webContents.send( global.messages.toggleMessage, global.strings.navCubeString );
                    }
                },
                {
                    label: 'Toggle Triad',
                    // id: 'triad-toggle',
                    // type: 'checkbox',
                    // checked: false,
                    click: () => {
                        win.webContents.send( global.messages.toggleMessage, global.strings.triadString );
                    }
                },
                {type: 'separator'},
                {
                    label: 'Set Camera View',
                    submenu: [
                        {
                            label: 'Iso',
                            //id: global.viewOrientations.isoView,
                            //type: 'checkbox',
                            click: () => {
                                win.webContents.send( global.messages.setViewMessage, global.viewOrientations.isoView);
                            }
                        },
                        {
                            label: 'Back',
                            //id: global.viewOrientations.backView,
                            //type: 'checkbox',
                            click: () => {
                                win.webContents.send( global.messages.setViewMessage, global.viewOrientations.backView);
                            }
                        },
                        {
                            label: 'Front',
                            // id: global.viewOrientations.frontView,
                            //type: 'checkbox',
                            click: () => {
                                win.webContents.send( global.messages.setViewMessage, global.viewOrientations.frontView);
                            }
                        },
                        {
                            label: 'Left',
                            //id: global.viewOrientations.leftView,
                            //type: 'checkbox',
                            click: () => {
                                win.webContents.send( global.messages.setViewMessage, global.viewOrientations.leftView);
                            }
                        },
                        {
                            label: 'Right',
                            //id: global.viewOrientations.rightView,
                            //type: 'checkbox',
                            click: () => {
                                win.webContents.send( global.messages.setViewMessage, global.viewOrientations.rightView);
                            }
                        },
                        {
                            label: 'Top',
                            //id: global.viewOrientations.topVie,
                            //type: 'checkbox',
                            click: () => {
                                win.webContents.send( global.messages.setViewMessage, global.viewOrientations.topView);
                            }
                        },
                        {
                            label: 'Bottom',
                            // id: global.viewOrientations.bottomView,
                            // type: 'checkbox',
                            click: () => {
                                win.webContents.send( global.messages.setViewMessage, global.viewOrientations.bottomView);
                            }
                        }
                    ]
                },
                {
                    label: 'Set Projection Mode',
                    submenu: [
                        {
                            label: 'Orthographic',
                            // id: global.projectionModes.orthographic,
                            // type: 'checkbox',
                            click: () => {
                                win.webContents.send( global.messages.setProjectionModeMessage, global.projectionModes.orthographic);
                            }
                        },
                        {
                            label: 'Perspective',
                            // id: global.projectionModes.perspective,
                            // type: 'checkbox',
                            click: () => {
                                win.webContents.send( global.messages.setProjectionModeMessage, global.projectionModes.perspective);
                            }
                        }
                    ]
                },
                {
                    label: 'Set Drawing Mode',
                    submenu: [
                        {
                            label: 'Wireframe on Shaded',
                            // id: global.drawModes.wireframeOnShaded,
                            // type: 'checkbox',
                            click: () => {
                                win.webContents.send( global.messages.setDrawModeMessage, global.drawModes.wireframeOnShaded);
                            }
                        },
                        {
                            label: 'Shaded',
                            // id: global.drawModes.shaded,
                            // type: 'checkbox',
                            click: () => {
                                win.webContents.send( global.messages.setDrawModeMessage, global.drawModes.shaded);
                            }
                        },
                        {
                            label: 'Wireframe',
                            // id: global.drawModes.wireframe,
                            // type: 'checkbox',
                            click: () => {
                                win.webContents.send( global.messages.setDrawModeMessage, global.drawModes.wireframe);
                            }
                        },
                        {
                            label: 'Hidden Line',
                            // id: global.drawModes.hiddenLine,
                            // type: 'checkbox',
                            click: () => {
                                win.webContents.send( global.messages.setDrawModeMessage, global.drawModes.hiddenLine);
                            }
                        },
                        {
                            label: 'X-Ray',
                            // id: global.drawModes.xRay,
                            // type: 'checkbox',
                            click: () => {
                                win.webContents.send( global.messages.setDrawModeMessage, global.drawModes.xRay);
                            }
                        }
                    ]
                }
            ]
        },
        {
            label: 'User Code',
            submenu: [
                {
                    label: "User Code 1",
                    click: () => {
                        win.webContents.send( global.messages.onUserCodeMessage, global.strings.userCodeOne );
                    }
                },
                {
                    label: "User Code 2",
                    click: () => {
                        win.webContents.send( global.messages.onUserCodeMessage, global.strings.userCodeTwo );
                    }
                },
                {
                    label: "User Code 3",
                    click: () => {
                        win.webContents.send( global.messages.onUserCodeMessage, global.strings.userCodeThree );
                    }
                }
            ]
        },
        {
            label: 'Electron Debug',
            submenu: [
                {role: 'reload'},
                {role: 'forcereload'},
                {role: 'toggledevtools'},
            ]
        },
       {
          role: 'help',
          submenu: [
            {
                label: 'Learn More',
                click () { electron.shell.openExternal('https://developer.techsoft3d.com/hoops/hoops-communicator/') }
            },
            {
               label: 'About',
               click(){
                    dialog.showMessageBox({
                        title: "About this application",
                        type: "info",
                        buttons: ["Ok"],
                        message: `This is a getting started application showing how\nHOOPS Communicator can be used with Electron.js.\nThis is meant to be sample code only and is not meant for production`
                    });
               }
            }
          ]
        }
      ]
    
      const menu = Menu.buildFromTemplate(appMenu);
      Menu.setApplicationMenu(menu);
}