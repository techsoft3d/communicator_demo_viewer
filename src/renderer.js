var viewers = {}

//IPC message handlers
//You can read more about how this works in electron by going here: https://www.electronjs.org/docs/latest/tutorial/ipc
window.electronAPI.handleOpenFile((event, filePath, viewerId, streamcachePort, renderType) => {
    processFile(filePath, viewerId, streamcachePort, renderType);
})

window.electronAPI.handleOnUserCode((event, userCodeMessage) =>{
    if( userCodeMessage == 'user-one' )
    {
        OnUserCode1();
    }
    else if( userCodeMessage == 'user-two')
    {
        OnUserCode2();
    }
    else if( userCodeMessage == 'user-three')
    {
        OnUserCode3();
    }
})

window.electronAPI.handleToggle((event, whatToToggle) => {

    let activeTabId = $("#tab-list a.active").attr("id");
    if( whatToToggle == 'navCube' )
    {
        toggleNavCube( activeTabId );
    }
    else if( whatToToggle == 'triad' )
    {
        toggleTriad( activeTabId );
    }
})

window.electronAPI.handleSetView((event, newViewState) => {
    let activeTabId = $("#tab-list a.active").attr("id");
    setView( activeTabId, newViewState );
})

window.electronAPI.handleSetProjection((event, newProjection) => {
    let activeTabId = $("#tab-list a.active").attr("id");
    setProjection( activeTabId, newProjection );
})

window.electronAPI.handleSetDrawMode((event, newDrawMode) => {
    let activeTabId = $("#tab-list a.active").attr("id");
    setDraw( activeTabId, newDrawMode );
})

//Util functions
function initPage(){

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
            case 'iso':
                viewers[tabId].setViewOrientation(Communicator.ViewOrientation.Iso);
                break;
            case 'back':
                viewers[tabId].setViewOrientation(Communicator.ViewOrientation.Back);
                break;
            case 'front':
                viewers[tabId].setViewOrientation(Communicator.ViewOrientation.Front);
                break;
            case 'left':
                viewers[tabId].setViewOrientation(Communicator.ViewOrientation.Left);
                break;
            case 'right':
                viewers[tabId].setViewOrientation(Communicator.ViewOrientation.Right);
                break;
            case 'top':
                viewers[tabId].setViewOrientation(Communicator.ViewOrientation.Top);
                break;
            case 'bottom':
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
            case 'orthographic':
                viewers[tabId].view.setProjectionMode(Communicator.Projection.Orthographic);
                break;
            case 'perspective':
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
            case 'wireframe-on-shaded':
                viewers[tabId].view.setDrawMode(Communicator.DrawMode.WireframeOnShaded);
                break;
            case 'shaded':
                viewers[tabId].view.setDrawMode(Communicator.DrawMode.Shaded);
                break;
            case 'wireframe':
                viewers[tabId].view.setDrawMode(Communicator.DrawMode.Wireframe);
                break;
            case 'hiddenLine':
                viewers[tabId].view.setDrawMode(Communicator.DrawMode.HiddenLine);
                break;
            case 'x-ray':
                viewers[tabId].view.setDrawMode(Communicator.DrawMode.XRay);
                break;
            default:
                console.log('Error: setDraw() draw mode setting undefined.');
        }
    }
}

function addTab(label, tabId, action) {
    let tabContent = crypto.randomUUID();

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

function processFile(openedFile, viewerId, streamcachePort, rendererType){
    if(openedFile){

        let tabId = crypto.randomUUID();
        let tabContentId = addTab(openedFile + " - " + rendererType, tabId, "loading");
           
        createHWV(openedFile, tabId, tabContentId, viewerId, streamcachePort, rendererType);
    }
}

function createHWV(modelName, tabId, tabContentId, viewerId, port, rendererType){
    let $tabContent = $('#' + tabContentId);
    $tabContent.empty();
    $tabContent.append("<div id='"+ viewerId +"' class='viewer-canvas'></div>");

    let webviewerrenderertype = (rendererType === "server") ? Communicator.RendererType.Server : Communicator.RendererType.Client;

    var viewer = new Communicator.WebViewer({
        containerId: viewerId,
        endpointUri: "ws://localhost:" + port.toString(),
        rendererType: webviewerrenderertype,
        model: modelName
    });

    viewer.setCallbacks({
        sceneReady: function (){
            //ssr does not support transparent background, so we fake it by setting background color to the same color as the tab background
            if( viewer.getRendererType() == Communicator.RendererType.Server )
            {
                let backgroundcolor = new Communicator.Color(221,221,221);
                viewer.getView().setBackgroundColor(backgroundcolor, backgroundcolor);
            }
            viewer.getView().getNavCube().enable();
        }
    });
    viewers[tabId] = viewer;

    viewer.start();
}

/*****************************************
user code functions here.  you  have access to all the 
communicator web viewer api listed here: https://docs.techsoft3d.com/communicator/latest/build/api_ref/typedoc/modules/communicator.html
there is one viewer per tab and you can access the viewer 
in the active tab by doing: let activetabid = $("#tab-list a.active").attr("id");
you can also check if the home tab is active by checking if actovetabid == "home-tab" 
*******************************************/
function onusercode1()
{
    let activetabid = $("#tab-list a.active").attr("id");
    if( activetabid != "home-tab"){
        viewers[activetabid].getstatistics().then(function(totals)
        {
            alert( "triangles rendered: " + totals.triangle_count );
        });
    }
}

function onusercode2(){
    alert( "on user code 2");
}

function onusercode3(){
    alert( "on user code 3");
}

//utility functions
function addtab(label, tabid, action) {
    let tabcontent = crypto.randomUUID();

    let params = {
        tabid: tabid,
        tabcontent: tabcontent,
        tabname: label,
        actionname: action
    }

    $("#tab-list").append(tmpl("tabheadertemplate", params));
    $("#tab-content").append(tmpl("tabcontenttemplate", params));
    $('#tab-list a[href="#' + tabcontent + '"]').tab('show');

    return tabcontent;
}