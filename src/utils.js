
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

module.exports = global;