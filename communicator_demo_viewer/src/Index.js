const electron = require('electron');
const ipc = electron.ipcRenderer;
const fs = require("fs");
const os = require("os");
const child_process = require('child_process');
const remote = electron.remote;

const path = require('path');
const { v4: uuidv4 } = require('uuid');

var viewers = {};
var ApplicationConfig = null;


//setup message handlers for communication between main and render process
//See here for more info: https://electron.atom.io/docs/api/ipc-main/
//ipc.on( remote.getGlobal('messages').openFileMessage, function(event, paths) {
ipc.on( remote.getGlobal('messages').openFileMessage, function(event, paths, rendererType)
 {
    if( paths && paths.length > 0 && fs.existsSync(paths[0]) )
    {
        processFile( paths[0], rendererType );
    }
    else
    {
        $('#info-modal').on('show.bs.modal', function (event) 
        {
            let modal = $(this);
            let message;
            if(!paths || !paths[0])
            {
                message= 'ERROR: Please specify a valid file'; 
            }
            else
            {
                message= 'ERROR: File: <b>' + paths[0] + '</b> does not exist'; 
            } 

            modal.find('.modal-body').html(message);
          });

        $('#info-modal').modal('show');
        $('#modal-body').html("ERROR: File does not exist");
    }
})

ipc.on( remote.getGlobal('messages').exportFileMessage, function(event, fileName ) 
{
    alert( "Not implemented" );
    //exportToHTML( fileName ).then(()=>{alert("File saved")}).catch((reason)=>{alert(reason)});
})

ipc.on( remote.getGlobal('messages').toggleMessage, function(event, whatToToggle )
{
    //let menuToggleItem = remote.Menu.getApplicationMenu().getMenuItemById('nav-toggle');
    let activeTabId = $("#tab-list a.active").attr("id");
    if( whatToToggle == remote.getGlobal('strings').navCubeString )
    {
        toggleNavCube( activeTabId );
    }
    else if( whatToToggle == remote.getGlobal('strings').triadString )
    {
        toggleTriad( activeTabId );
    }
})

ipc.on( remote.getGlobal('messages').setViewMessage, function(event, whatViewToSet)
{   
    //let a = remote.Menu.getApplicationMenu().getMenuItemById(remote.getGlobal('viewOrientations').isoView);
    let activeTabId = $("#tab-list a.active").attr("id");
    setView( activeTabId, whatViewToSet );
})

ipc.on( remote.getGlobal('messages').setProjectionModeMessage, function(event, whatProjectionModeToSet)
{   
    let activeTabId = $("#tab-list a.active").attr("id");
    setProjection( activeTabId, whatProjectionModeToSet );
})

ipc.on( remote.getGlobal('messages').setDrawModeMessage, function(event, whatDrawModeToSet)
{   
    let activeTabId = $("#tab-list a.active").attr("id");
    setDraw( activeTabId, whatDrawModeToSet );
})

ipc.on( remote.getGlobal('messages').onUserCodeMessage, function(event, userCodeMessage )
{
   if( userCodeMessage == remote.getGlobal('strings').userCodeOne )
   {
        OnUserCode1();
   }
   else if( userCodeMessage == remote.getGlobal('strings').userCodeTwo )
   {
        OnUserCode2();
   }
   else if( userCodeMessage == remote.getGlobal('strings').userCodeThree )
   {
        OnUserCode3();
   }
})

/*****************************************
User code functions here.  You  have access to all the 
Communicator Web Viewer API listed here: https://docs.techsoft3d.com/communicator/latest/build/api_ref/typedoc/modules/communicator.html
There is one viewer per tab and you can access the viewer 
in the active tab by doing: let activeTabId = $("#tab-list a.active").attr("id");
You can also check if the home tab is active by checking if actoveTabId == "home-tab" 
*******************************************/
function OnUserCode1()
{
    let activeTabId = $("#tab-list a.active").attr("id");
    if( activeTabId != "home-tab"){
        viewers[activeTabId].getStatistics().then(function(totals)
        {
            alert( "Triangles rendered: " + totals.triangle_count );
        });
    }
}

function OnUserCode2(){
    alert( "On user code 2");
}

function OnUserCode3(){
    alert( "On user code 3");
}

function processFile(openedFile, rendererType){
    if(openedFile){
        let ext = path.extname(openedFile);
        let modelName = path.basename(openedFile, ext);

        let viewerId = uuidv4();
        let tabId = uuidv4();

        if (ext === ".scz"){
            let tabContentId = addTab(modelName, tabId, "loading");
            let modelDir = path.dirname(openedFile);
            spawnViewer(modelDir, modelName, tabId, tabContentId, viewerId, rendererType);
        }
        else{
            let tabContentId = addTab(modelName, tabId, "converting");
            convertFile(openedFile, modelName).then((filePath)=>{
                spawnViewer(ApplicationConfig.MODEL_REPO, modelName, tabId, tabContentId, viewerId, rendererType);
            });
        }
    }
}

function initPage(){
    ApplicationConfig = initConfig(__dirname);

    $(document).on("click", ".close", (event) =>{
        closeTab($(event.target).parent().attr("id"));
    })

    $(window).resize(()=>{
        resizeActiveCanvas();
    });

    $(document).on('shown.bs.tab', '.nav-tabs a', function(event){
        resizeActiveCanvas();
    });
}

function resizeActiveCanvas(){
    let activeTabId = $("#tab-list a.active").attr("id");

    if (viewers.hasOwnProperty(activeTabId)){
        viewers[activeTabId].resizeCanvas();
    }
}

function closeTab(tabId){
    let $tab = $('#'+ tabId);
    let $tabcontent = $($tab.attr("href"))

    $tabcontent.remove();
    $tab.parent().remove();
    $('#tab-list a:last').tab('show');

    if (viewers.hasOwnProperty(tabId)){
        viewers[tabId].shutdown();
        delete viewers[tabId];
    }
}

function toggleNavCube(tabId){
    if( tabId != "home-tab" )
    {
        let $navCube = viewers[tabId].getView().getNavCube();
        if( $navCube.getEnabled())
            $navCube.disable();
        else
            $navCube.enable();
    }
}

function toggleTriad(tabId){
    if( tabId != "home-tab" )
    {
        let $triad = viewers[tabId].getView().getAxisTriad();
        if( $triad.getEnabled())
            $triad.disable();
        else
            $triad.enable();
    }
}

function setView(tabId, whatViewToSet){
    if( tabId != "home-tab" )
    {
        switch(whatViewToSet) 
        {
            case remote.getGlobal('viewOrientations').isoView:
                viewers[tabId].setViewOrientation(Communicator.ViewOrientation.Iso);
                break;
            case remote.getGlobal('viewOrientations').backView:
                viewers[tabId].setViewOrientation(Communicator.ViewOrientation.Back);
                break;
            case remote.getGlobal('viewOrientations').frontView:
                viewers[tabId].setViewOrientation(Communicator.ViewOrientation.Front);
                break;
            case remote.getGlobal('viewOrientations').leftView:
                viewers[tabId].setViewOrientation(Communicator.ViewOrientation.Left);
                break;
            case remote.getGlobal('viewOrientations').rightView:
                viewers[tabId].setViewOrientation(Communicator.ViewOrientation.Right);
                break;
            case remote.getGlobal('viewOrientations').topView:
                viewers[tabId].setViewOrientation(Communicator.ViewOrientation.Top);
                break;
            case remote.getGlobal('viewOrientations').bottomView:
                viewers[tabId].setViewOrientation(Communicator.ViewOrientation.Bottom);
                break;
            default:
                console.log('Error: setView() view setting undefined.');
        }
    } 
}

function setProjection(tabId, whatProjectionModeToSet){
    if( tabId != "home-tab" ) 
    {
        switch(whatProjectionModeToSet) 
        {
            case remote.getGlobal('projectionModes').orthographic:
                viewers[tabId].view.setProjectionMode(Communicator.Projection.Orthographic);
                break;
            case remote.getGlobal('projectionModes').perspective:
                viewers[tabId].view.setProjectionMode(Communicator.Projection.Perspective);
                break;
            default:
                console.log('Error: setProjection() projection mode setting undefined.');
        }
    }
}

function setDraw(tabId, whatDrawModeToSet){
    if( tabId != "home-tab" ) 
    {
        switch(whatDrawModeToSet) 
        {
            case remote.getGlobal('drawModes').wireframeOnShaded:
                viewers[tabId].view.setDrawMode(Communicator.DrawMode.WireframeOnShaded);
                break;
            case remote.getGlobal('drawModes').shaded:
                viewers[tabId].view.setDrawMode(Communicator.DrawMode.Shaded);
                break;
            case remote.getGlobal('drawModes').wireframe:
                viewers[tabId].view.setDrawMode(Communicator.DrawMode.Wireframe);
                break;
            case remote.getGlobal('drawModes').hiddenLine:
                viewers[tabId].view.setDrawMode(Communicator.DrawMode.HiddenLine);
                break;
            case remote.getGlobal('drawModes').xRay:
                viewers[tabId].view.setDrawMode(Communicator.DrawMode.XRay);
                break;
            default:
                console.log('Error: setDraw() draw mode setting undefined.');
        }
    }
}

function addTab(label, tabId, action) {
    let tabContent = uuidv4();

    let params = {
        tabId: tabId,
        tabContent: tabContent,
        tabName: label,
        actionName: action
    }

    $("#tab-list").append(tmpl("tabHeaderTemplate", params));
    $("#tab-content").append(tmpl("tabContentTemplate", params));
    $('#tab-list a[href="#' + tabContent + '"]').tab('show');

    return tabContent;
}

var scPort = 11000;

function spawnViewer(modelDir, modelName, tabId, tabContentId, viewerId, rendererType){
    let streamcachePort = scPort++;

    let ssrEnabled = (rendererType === "client") ? false : true;

    let args = [
        "--sc-port", streamcachePort.toString(),
        "--id", viewerId.toString(),
        "--csr", (!ssrEnabled).toString(),
        "--ssr", ssrEnabled.toString(),
        "--model-search-directories", modelDir,
        "--license", ApplicationConfig.LICENSE 
    ];

    let scServer = child_process.spawn(ApplicationConfig.SC_SERVER_APP, args);

    //this is temporary but right now we have no way of knowing when the server is ready to accept connections
    setTimeout(()=>{
        createHWV(modelName, tabId, tabContentId, viewerId, streamcachePort, rendererType);
    }, 500);
}

function createHWV(modelName, tabId, tabContentId, viewerId, port, rendererType){
    let $tabContent = $('#' + tabContentId);
    $tabContent.empty();
    $tabContent.append("<div id='"+ viewerId +"' class='viewer-canvas'></div>");

    let webviewerRendererType = (rendererType === "server") ? Communicator.RendererType.Server : Communicator.RendererType.Client;

    var viewer = new Communicator.WebViewer({
        containerId: viewerId,
        endpointUri: "ws://localhost:" + port.toString(),
        rendererType: webviewerRendererType,
        model:modelName
    });

    viewer.setCallbacks({
        sceneReady: function (){
            //SSR does not support Transparent Background, so we fake it by setting background color to the same color as the tab background
            if( viewer.getRendererType() == Communicator.RendererType.Server )
            {
                let backgroundColor = new Communicator.Color(221,221,221);
                viewer.getView().setBackgroundColor(backgroundColor, backgroundColor);
            }
            viewer.getView().getNavCube().enable();
        }
    });

    viewers[tabId] = viewer;

    viewer.start();
}

function convertFile(filePath, modelName){
    return new Promise((resolve, reject) =>{
        let outputPath = path.join(ApplicationConfig.MODEL_REPO, modelName);

        let args = [
            "--license", ApplicationConfig.LICENSE,
            "--input", filePath,
            "--output_sc", outputPath,
            "--sc_create_scz", "true",
            "--sc_compress_scz", "true"
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

// Rob - Dosn't work yet because you can't convert SCZ->HTML
//I'll rethinkg how to do this and re-implement. Update:
//Apparently you can export SC(s/z) to html using the authoring
//library.  I need to make a small executable that does that
//and add it to this project.  We can then call that from
//this function.
function exportToHTML( fileName, modelName ){
    return new Promise((resolve, reject) => {

        if( fs.existsSync(fileName )){
            reject( "ERROR: File exists" );
        }

        let args = [
            "--input", path.join(ApplicationConfig.MODEL_REPO, modelName + ".scz" ),
            "--input_html_template_file", ApplicationConfig.HTML_TEMPLATE,
            "--output_html", fileName,
            "--license", ApplicationConfig.LICENSE
        ];

        let converter = child_process.spawn(ApplicationConfig.CONVERTER, args );

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
                reject("ERROR: File could not be saved");
            }
        });
    });
}
 
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
        
        LICENSE: "Add license here"
    }
}
