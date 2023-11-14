const Application = require('spectron').Application;
const fs = require('fs');
const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

var electronPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron');

if (process.platform === 'win32') {
    electronPath += '.cmd';
}

var appPath = path.join(__dirname, '..');

var app = new Application({
            path: electronPath,
            args: [appPath]
        });


global.before(function () {
    chai.should();
    chai.use(chaiAsPromised);
});

describe('HCDV tests', function () {

    this.timeout(60000);

    beforeEach(function () {
        return app.start();
    });

    beforeEach(function () {
        chaiAsPromised.transferPromiseness = app.transferPromiseness
    });

    before(function() {
        if(!fs.existsSync(path.join(__dirname,'test_data/microengine.scz')) ||
           !fs.existsSync(path.join(__dirname, 'test_data/landinggearmainshaftwithpmi_fullpmi.catpart'))){
            chai.assert.isOk(false,'ERROR: Test data not found. Please run: dev/set_communicator_package.js once before running tests');
        }
    });
  
    afterEach(function () {
        return app.stop();
    });

    it('Test basic startup', function () {
        return app.client.waitUntilWindowLoaded()
        .getWindowCount().should.eventually.equal(1)
        .getText('#home-tab').should.eventually.equal('Home')
        .browserWindow.isMinimized().should.eventually.be.false
        .browserWindow.isDevToolsOpened().should.eventually.be.false
        .browserWindow.isVisible().should.eventually.be.true
        .browserWindow.isFocused().should.eventually.be.true
        .browserWindow.getBounds().should.eventually.have.property('width').and.be.above(0)
        .browserWindow.getBounds().should.eventually.have.property('height').and.be.above(0);
    });

    //Adding the "done" callback tells mocha to wait to finish the test
    //until the callback is fired with or without an error.  This is
    //how you handle async tasks in mocha

    it('Test open valid file with CSR', function(done){
        app.client.waitUntilWindowLoaded()
            .then(function () { 
                app.browserWindow.send('open-file',[path.join(__dirname,'test_data/microengine.scz')], 'client');
                let testPass = true;

                setTimeout(function(){
                    app.client.getText('.nav-link.active').then((text)=>{
                        if(text.indexOf("microengine") === -1){
                            testPass = false;
                        }
                        return app.client.isVisible('#loading-icon');
                    }).then(function(isVisible){
                        if(isVisible){
                            testPass = false;
                        }
                    }).then(function(){
                        return app.client.$('#tab-list a.active').getAttribute("id").then(function(tabID){
                            return app.webContents.executeJavaScript('viewers["'+tabID+'"].model._engine._statistics.triangle_count')
                                .then(function (triangleCount) {
                               if(triangleCount <= 0 ){
                                   testPass = false;
                               }
                            })
                        });
                    }).then(function(){
                        if(testPass){
                            done();
                        }
                        else{
                            done("ERROR: File failed to load");
                        }
                    });
                }, 10000);
            });
    });

    it('Test open valid file with SSR', function(done){
        app.client.waitUntilWindowLoaded()
            .then(function () { 
                app.browserWindow.send('open-file',[path.join(__dirname,'test_data/microengine.scz')], 'server');
                let testPass = true;

                setTimeout(function(){
                    app.client.getText('.nav-link.active').then(function(text){
                        if(text.indexOf("microengine") === -1){
                            testPass = false;
                        }
                        return app.client.isVisible('#loading-icon');
                    }).then(function(isVisible){
                        if(isVisible){
                            testPass = false;
                        }
                    }).then(function(){
                        return app.client.$('#tab-list a.active').getAttribute("id").then(function(tabID){
                            return app.webContents.executeJavaScript('viewers["'+tabID+'"].model._engine._statistics.triangle_count')
                                .then(function (triangleCount) {
                               if(triangleCount <= 0 ){
                                   testPass = false;
                               }
                            })
                        });
                    }).then(function(){
                        if(testPass){
                            done();
                        }
                        else{
                            done("ERROR: File failed to load");
                        }
                    });
                }, 10000);
            });
    });

    it('Test import valid file with CSR', function(done){
        app.client.waitUntilWindowLoaded()
            .then(function () { 
                app.browserWindow.send('open-file',[path.join(__dirname,'test_data/landinggearmainshaftwithpmi_fullpmi.catpart')], 'client');
                let testPass = true;

                setTimeout(function(){
                    app.client.getText('.nav-link.active').then(function(text){
                        if(text.indexOf("landinggearmainshaftwithpmi_fullpmi") === -1){
                            testPass = false;
                        }
                        return app.client.isVisible('#loading-icon');
                    }).then(function(isVisible){
                        if(isVisible){
                            testPass = false;
                        }
                    }).then(function(){
                    return app.client.$('#tab-list a.active').getAttribute("id").then(function(tabID){
                        return app.webContents.executeJavaScript('viewers["'+tabID+'"].model._engine._statistics.triangle_count')
                            .then(function (triangleCount) {
                            if(triangleCount <= 0 ){
                                testPass = false;
                            }
                        })
                    });
                    }).then(function(){
                        if(testPass){
                            done();
                        }
                        else{
                            done("ERROR: File failed to load");
                        }
                    });
                }, 25000);
            });
    });

    it('Test import valid file with SSR', function(done){
        app.client.waitUntilWindowLoaded()
            .then(function () { 
                app.browserWindow.send('open-file',[path.join(__dirname,'test_data/landinggearmainshaftwithpmi_fullpmi.catpart')], 'server');
                let testPass = true;

                setTimeout(function(){
                    app.client.getText('.nav-link.active').then(function(text){
                        if(text.indexOf("landinggearmainshaftwithpmi_fullpmi") === -1){
                            testPass = false;
                        }
                        return app.client.isVisible('#loading-icon');
                    }).then(function(isVisible){
                        if(isVisible){
                            testPass = false;
                        }
                    }).then(function(){
                        return app.client.$('#tab-list a.active').getAttribute("id").then(function(tabID){
                            return app.webContents.executeJavaScript('viewers["'+tabID+'"].model._engine._statistics.triangle_count')
                                .then(function (triangleCount) {
                               if(triangleCount <= 0 ){
                                   testPass = false;
                               }
                            })
                    });
                    }).then(function(){
                        if(testPass){
                            done();
                        }
                        else{
                            done("ERROR: File failed to load");
                        }
                    });
                }, 25000);
            });
    });

    it('Test open non-existent file with CSR', function(done){
        app.client.waitUntilWindowLoaded().then(function(){
           app.browserWindow.send('open-file',['iDontExist.stl'], 'client');
           let testPass = true; 

           setTimeout(function(){
                app.client.isVisible('#info-modal').then(function(isVisible){
                    if( !isVisible ){
                        testPass = false;
                    }
                    return app.client.getText('.modal-body');
                }).then(function(modalText){
                    if( modalText !== 'ERROR: File: iDontExist.stl does not exist'){
                        testPass = false;
                    }
                }).then(function(){
                    if(testPass){
                        done();
                    }
                    else{
                        done("ERROR: Invalid file didn't trigger error");
                    }
                });
           }, 500);
        });
    });

    it('Test open non-existent file with SSR', function(done){
        app.client.waitUntilWindowLoaded().then(function(){
           app.browserWindow.send('open-file',['iDontExist.stl'], 'server');
           let testPass = true; 

           setTimeout(function(){
                app.client.isVisible('#info-modal').then(function(isVisible){
                    if( !isVisible ){
                        testPass = false;
                    }
                    return app.client.getText('.modal-body');
                }).then(function(modalText){
                    if( modalText !== 'ERROR: File: iDontExist.stl does not exist'){
                        testPass = false;
                    }
                }).then(function(){
                    if(testPass){
                        done();
                    }
                    else{
                        done("ERROR: Invalid file didn't trigger error");
                    }
                });
           }, 500);
        });
    });

    it('Test empty file name with CSR', function(done){
        app.client.waitUntilWindowLoaded().then(function(){
           app.browserWindow.send('open-file',[], 'client');
           let testPass = true; 

           setTimeout(function(){
                app.client.isVisible('#info-modal').then(function(isVisible){
                    if( !isVisible ){
                        testPass = false;
                    }
                    return app.client.getText('.modal-body');
                }).then(function(modalText){
                    if( modalText !== 'ERROR: Please specify a valid file'){
                        testPass = false;
                    }
                }).then(function(){
                    if(testPass){
                        done();
                    }
                    else{
                        done("ERROR: Invalid file didn't trigger error");
                    }
                });
           }, 500);
        });
    });

    //The function expects an array so test sending just an empty string
    it('Test sending string into open file function', function(done){
        app.client.waitUntilWindowLoaded().then(function(){
           app.browserWindow.send('open-file','', 'client');
           let testPass = true; 

           setTimeout(function(){
                app.client.isVisible('#info-modal').then(function(isVisible){
                    if( !isVisible ){
                        testPass = false;
                    }
                    return app.client.getText('.modal-body');
                }).then(function(modalText){
                    if( modalText !== 'ERROR: Please specify a valid file'){
                        testPass = false;
                    }
                }).then(function(){
                    if(testPass){
                        done();
                    }
                    else{
                        done("ERROR: Invalid file didn't trigger error");
                    }
                });
           }, 500);
        });
    });

    it('Test toggle nav cube', function(done){
           app.client.waitUntilWindowLoaded()
            .then(function () { 
                app.browserWindow.send('open-file',[path.join(__dirname,'test_data/microengine.scz')], 'client');
                let testPass = true;

                setTimeout(function(){
                   return app.client.$('#tab-list a.active').getAttribute("id").then(function(tabID){
                            return app.webContents.executeJavaScript('viewers["'+tabID+'"].getView().getNavCube().getEnabled()')
                                .then(function (isEnabled) {
                                    if(!isEnabled)
                                    {
                                        testPass = false;
                                    }
                                })
                    }).then(function(){
                        //toggle the nav cube which is enabled by default
                        app.browserWindow.send('toggle-this', 'navCube');
                        return app.client.$('#tab-list a.active').getAttribute("id").then(function(tabID){
                            return app.webContents.executeJavaScript('viewers["'+tabID+'"].getView().getNavCube().getEnabled()')
                                .then(function (isEnabled) {
                                    //verify the nav cube is disabled
                                    if(isEnabled)
                                    {
                                        testPass = false;
                                    }
                                })
                        })
                    }).then(function(){
                        //toggle the nav cube again
                        app.browserWindow.send('toggle-this', 'navCube');
                        return app.client.$('#tab-list a.active').getAttribute("id").then(function(tabID){
                            return app.webContents.executeJavaScript('viewers["'+tabID+'"].getView().getNavCube().getEnabled()')
                                .then(function (isEnabled) {
                                    //verify the nav cube is disabled
                                    if(!isEnabled)
                                    {
                                        testPass = false;
                                    }
                                })
                            })
                    }).then(function(){
                        if(testPass)
                        {
                            done();
                        }
                        else
                        {
                            done("ERROR: Nav cube didn't toggle properly");
                        }
                    })
                }, 5000);
            }); 
    });

    it('Test toggle axis triad', function(done){
        app.client.waitUntilWindowLoaded()
        .then(function () { 
            app.browserWindow.send('open-file',[path.join(__dirname,'test_data/microengine.scz')], 'client');
            let testPass = true;

            setTimeout(function(){
                return app.client.$('#tab-list a.active').getAttribute("id").then(function(tabID){
                        return app.webContents.executeJavaScript('viewers["'+tabID+'"].getView().getAxisTriad().getEnabled()')
                            .then(function (isEnabled) {
                                if(isEnabled)
                                {
                                    testPass = false;
                                }
                            })
                }).then(function(){
                    //toggle the triad which is disabled by default
                    app.browserWindow.send('toggle-this', 'triad');
                    return app.client.$('#tab-list a.active').getAttribute("id").then(function(tabID){
                        return app.webContents.executeJavaScript('viewers["'+tabID+'"].getView().getAxisTriad().getEnabled()')
                            .then(function (isEnabled) {
                                //verify the triad is enabled
                                if(!isEnabled)
                                {
                                    testPass = false;
                                }
                            })
                    })
                }).then(function(){
                    //toggle the triad again
                    app.browserWindow.send('toggle-this', 'triad');
                    return app.client.$('#tab-list a.active').getAttribute("id").then(function(tabID){
                        return app.webContents.executeJavaScript('viewers["'+tabID+'"].getView().getAxisTriad().getEnabled()')
                            .then(function (isEnabled) {
                                //verify the triad is disabled
                                if(isEnabled)
                                {
                                    testPass = false;
                                }
                            })
                        })
                }).then(function(){
                    if(testPass)
                    {
                        done();
                    }
                    else
                    {
                        done("ERROR: Triad didn't toggle properly");
                    }
                })
            }, 5000);
        });  
    });

    it('Test projection mode change', function(done){
        app.client.waitUntilWindowLoaded()
        .then(function () { 
            app.browserWindow.send('open-file',[path.join(__dirname,'test_data/microengine.scz')], 'server');
            let testPass = true;

            setTimeout(function(){
                //Set projection to ortho and verify with the viewer it was set
                //Should also check that the menu is in the correct state once 
                //that logic is added
                    app.browserWindow.send('set-projection-mode', 'orthographic');
                    return app.client.$('#tab-list a.active').getAttribute("id").then(function(tabID){
                        return app.webContents.executeJavaScript('viewers["'+tabID+'"].getView().getCamera().getProjection()')
                            .then(function (currentProjection) {
                                //orothographic = 0
                                //perspective = 1
                                if( currentProjection != 0 )
                                {
                                    testPass = false;
                                }
                            })
                    }).then(function(){
                        //Now set the view to perspective and verify with the
                        //viewer it's set
                       app.browserWindow.send('set-projection-mode', 'perspective');
                        return app.client.$('#tab-list a.active').getAttribute("id").then(function(tabID){
                            return app.webContents.executeJavaScript('viewers["'+tabID+'"].getView().getCamera().getProjection()')
                                .then(function (currentProjection) {
                                    //orothographic = 0
                                    //perspective = 1
                                    if( currentProjection != 1 )
                                    {
                                        testPass = false;
                                    }
                                }) 
                            })
                    }).then(function(){
                        if(testPass)
                        {
                            done();
                        }
                        else
                        {
                            done("ERROR: Projection mode didn't change properly");
                        } 
                    })
            }, 5000);
        });
    });

    it('Test view orientation change', function(done){
        done("ERROR: Test not implemented yet");
    });

    it('Test draw mode change', function(done){
        done("ERROR: Test not implemented yet");
    });

    it('Test drag and drop to open a file', function(done){
            done("ERROR: Test not implemented yet");
    });


  });