const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron')
const path = require('node:path')
const global = require('./utils.js')
const child_process = require('child_process')
const uuidv4 = require('uuidv4');
const fs = require("fs");
const os = require("os");

//app level vars
var ApplicationConfig = initConfig(__dirname)
var scPort = 55555; //Port to start incrementint from for stream cache servers

function initConfig(baseDir){
    let modelRepo = path.join(os.homedir(), "CommunicatorModels");
    let isWin = /^win/.test(process.platform);
    let serverBinary = (isWin) ? "ts3d_sc_server.exe" : "ts3d_sc_server";
    let convertBinary = (isWin) ? "converter.exe" : "converter";

    if( isWin ){

    }

    if (!fs.existsSync(modelRepo)){
        fs.mkdirSync(modelRepo);
    }

    let binDir = path.join(baseDir, "..", "bin");

    return {
        SC_SERVER_APP: path.join(binDir, serverBinary ),
        CONVERTER: path.join(binDir, convertBinary),
        MODEL_REPO: modelRepo,
        HTML_TEMPLATE: path.join(binDir, "HOOPSCommunicatorTemplate.html"),

        LICENSE: 'Add your license here'
    }
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('src/index.html')
 createMenu(win)
}

app.whenReady().then(() => {
createWindow()
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function notImplemented(){
     dialog.showMessageBox({
        type: "error",
        buttons: ["Ok"],
        message: global.strings.notImplemented
     });
}

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
   ).then(result => {
        if(!result.canceled){
            let ext = path.extname(result.filePaths[0]);
            let modelName = path.basename(result.filePaths[0], ext);
            let modelDir = path.dirname(result.filePaths[0]);
            let viewerId = uuidv4.uuid();

            if( ext == '.scz'){
                let port = spawnServer( modelDir, viewerId );
                win.webContents.send( global.messages.openFileMessage, modelName, viewerId, port, rendererType );
            }
            else {
                convertFile(result.filePaths[0], modelName).then((filepath)=>{
                    let port = spawnServer( ApplicationConfig.MODEL_REPO, viewerId );
                    win.webContents.send( global.messages.openFileMessage, modelName, viewerId, port, rendererType );
                });
            }
        }
    })
}


function spawnServer(modelDir, viewerId ){
    let streamcachePort = scPort++;

    let args = [
        "--id" , viewerId,
        "--license", ApplicationConfig.LICENSE,
        "--model-search-directories", modelDir,
        "--sc-port", streamcachePort.toString(),
        "--csr", "yes",
        "--ssr", "yes"
    ];

    let scServer = child_process.spawn(ApplicationConfig.SC_SERVER_APP, args);

    scServer.on("exit", (code) => {
        console.log(`Process exited with: ${code}`)
    })
    return streamcachePort;
}

function convertFile(filePath, modelName){
    return new Promise((resolve, reject) =>{
        let outputPath = path.join(ApplicationConfig.MODEL_REPO, modelName);

        let args = [
            "--license", ApplicationConfig.LICENSE,
            "--input", filePath,
            "--output_sc", outputPath,
            "--sc_compress_models", "true"
        ];

        let converter = child_process.spawn(ApplicationConfig.CONVERTER, args);

        converter.stdout.on('data', (data) => {
            console.log(data.toString());
        });

        converter.stderr.on('data', (data) => {
            console.log(data.toString());
        });

        converter.on("exit", (code)=>{
            if (code == 0){
                resolve(outputPath);
            }
            else{
                reject(null);
            }
        });
    });
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