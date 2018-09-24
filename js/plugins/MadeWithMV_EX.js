/*:
 * NOTE: Images are stored in the img/system folder.
 *
 * @plugindesc Show a Splash Screen "Made with MV" and/or a Custom Splash Screen before going to main screen.
 * @author Dan "Liquidize" Deptula
 *
 * @help This plugin does not provide plugin commands.
 *
 * @param Show Made With MV
 * @desc Enabled/Disables showing the "Made with MV" splash screen.
 * OFF - false     ON - true
 * Default: ON
 * @default true
 *
 * @param Made with MV Image
 * @desc The image to use when showing "Made with MV"
 * Default: MadeWithMv
 * @default MadeWithMv
 * @require 1
 * @dir img/system/
 * @type file
 *
 * @param Show Custom Splash
 * @desc Enabled/Disables showing the "Made with MV" splash screen.
 * OFF - false     ON - true
 * Default: OFF
 * @default false
 *
 * @param Show Second Custom Splash
 * @desc Enabled/Disables showing the "Made with MV" splash screen.
 * OFF - false     ON - true
 * Default: OFF
 * @default false
 *
 * @param Custom Image
 * @desc The image to use when showing "Made with MV"
 * Default: 
 * @default 
 * @require 1
 * @dir img/system/
 * @type file
 * 
 * @param Custom Image 2
 * @desc The second image to use when showing "Made with MV"
 * Default: 
 * @default 
 * @require 1
 * @dir img/system/
 * @type file
 *
 * @param Fade Out Time
 * @desc The time it takes to fade out, in frames.
 * Default: 120
 * @default 120
 *
 * @param Fade In Time
 * @desc The time it takes to fade in, in frames.
 * Default: 120
 * @default 120
 *
 * @param Wait Time
 * @desc The time between fading in and out, in frames.
 * Default: 160
 * @default 160
 *
 */
/*
var Liquidize = Liquidize || {};
Liquidize.MadeWithMV = {};
*/
var Parameters = PluginManager.parameters('MadeWithMv_EX');

ShowMV = JSON.parse(Parameters["Show Made With MV"]);
MVImage = String(Parameters["Made with MV Image"]);
ShowCustom = JSON.parse(Parameters["Show Custom Splash"]);
ShowCustom2 = JSON.parse(Parameters["Show Second Custom Splash"]);
CustomImage = String(Parameters["Custom Image"]);
CustomImage2 = String(Parameters["Second Custom Image"]);
FadeOutTime = Number(Parameters["Fade Out Time"]) || 120;
FadeInTime = Number(Parameters["Fade In Time"]) || 120;
WaitTime = Number(Parameters["Wait Time"]) || 160;


//-----------------------------------------------------------------------------
// Scene_Splash
//
// This is a constructor, implementation is done in the inner scope.

function Scene_Splash() {
    this.initialize.apply(this, arguments);
}

(function() {

    //-----------------------------------------------------------------------------
    // Scene_Boot
    //
    // The scene class for dealing with the game boot.
    
    var _Scene_Boot_loadSystemImages = Scene_Boot.prototype.loadSystemImages;
    Scene_Boot.prototype.loadSystemImages = function() {
        _Scene_Boot_loadSystemImages.call(this);
        if (ShowMV) {
            ImageManager.loadSystem(MVImage);
        }
        if (ShowCustom) {
            ImageManager.loadSystem(CustomImage);
        }
        if (ShowCustom2) {
            ImageManager.loadSystem(CustomImage2);
        }
    };

    var _Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function() {
        if ((ShowMV || ShowCustom || ShowCustom2) && !DataManager.isBattleTest() && !DataManager.isEventTest()) {
            SceneManager.goto(Scene_Splash);
        } else {
            _Scene_Boot_start.call(this);
        }
    };

    //-----------------------------------------------------------------------------
    // Scene_Splash
    //
    // The scene class for dealing with the splash screens.

    Scene_Splash.prototype = Object.create(Scene_Base.prototype);
    Scene_Splash.prototype.constructor = Scene_Splash;

    Scene_Splash.prototype.initialize = function() {
        Scene_Base.prototype.initialize.call(this);
        this._mvSplash = null;
        this._customSplash = null;
        this._customSplash2 = null;
        this._mvWaitTime = WaitTime;
        this._customWaitTime = WaitTime;
        this._mvFadeOut = false;
        this._mvFadeIn = false;
        this._customFadeOut = false;
        this._customFadeIn = false;
    };

    Scene_Splash.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this.createSplashes();
    };

    Scene_Splash.prototype.start = function() {
        Scene_Base.prototype.start.call(this);
        SceneManager.clearStack();
        if (this._mvSplash != null) {
            this.centerSprite(this._mvSplash);
        }
        if (this._customSplash != null) {
            this.centerSprite(this._customSplash);
        }
        if (this._customSplash2 != null) {
            this.centerSprite(this._customSplash2);
        }
    };

    Scene_Splash.prototype.update = function() {
        if (ShowMV) {
            if (!this._mvFadeIn) {
                this.startFadeIn(FadeInTime, false);
                this._mvFadeIn = true;
            } else {
                if (this._mvWaitTime > 0 && this._mvFadeOut == false) {
                    this._mvWaitTime--;
                } else {
                    if (this._mvFadeOut == false) {
                        this._mvFadeOut = true;
                        this.startFadeOut(FadeOutTime, false);
                    }
                }
            }
        }

        if (ShowCustom) {
            if (ShowMV && this._mvFadeOut == true) {
                if (!this._customFadeIn && this._fadeDuration == 0) {
                    this._customSplash.opacity = 255;
                    this._customWaitTime = WaitTime;
                    this.startFadeIn(FadeInTime, false);
                    this._customFadeIn = true;
                } else {
                    if (this._customWaitTime > 0 && this._customFadeOut == false) {
                        this._customWaitTime--;
                    } else {
                        if (this._customFadeOut == false) {
                            this._customFadeOut = true;
                            this.startFadeOut(FadeOutTime, false);
                        }
                    }
                }
            } else if (!ShowMV) {
                if (!this._customFadeIn) {
                    this._customSplash.opacity = 255;
                    this.startFadeIn(FadeInTime, false);
                    this._customFadeIn = true;
                } else {
                    if (this._customWaitTime > 0 && this._customFadeOut == false) {
                        this._customWaitTime--;
                    } else {
                        if (this._customFadeOut == false) {
                            this._customFadeOut = true;
                            this.startFadeOut(FadeOutTime, false);
                        }
                    }
                }
            }
        }

        if (ShowCustom) {
            if (ShowMV && this._mvFadeOut == true && this._customFadeOut == true) {
                this.gotoTitleOrTest();
            } else if (!ShowMV && this._customFadeOut == true) {
                this.gotoTitleOrTest();
            }
        } else {
            if (this._mvFadeOut == true) {
                this.gotoTitleOrTest();
            }
        }

        if (ShowCustom2) {
            if (ShowMV && this._mvFadeOut == true) {
                if (!this._customFadeIn && this._fadeDuration == 0) {
                    this._customSplash2.opacity = 255;
                    this._customWaitTime = WaitTime;
                    this.startFadeIn(FadeInTime, false);
                    this._customFadeIn = true;
                } else {
                    if (this._customWaitTime > 0 && this._customFadeOut == false) {
                        this._customWaitTime--;
                    } else {
                        if (this._customFadeOut == false) {
                            this._customFadeOut = true;
                            this.startFadeOut(FadeOutTime, false);
                        }
                    }
                }
            } else if (!ShowMV) {
                if (!this._customFadeIn) {
                    this._customSplash2.opacity = 255;
                    this.startFadeIn(FadeInTime, false);
                    this._customFadeIn = true;
                } else {
                    if (this._customWaitTime > 0 && this._customFadeOut == false) {
                        this._customWaitTime--;
                    } else {
                        if (this._customFadeOut == false) {
                            this._customFadeOut = true;
                            this.startFadeOut(FadeOutTime, false);
                        }
                    }
                }
            }
        }

        if (ShowCustom2) {
            if (ShowMV && this._mvFadeOut == true && this._customFadeOut == true) {
                this.gotoTitleOrTest();
            } else if (!ShowMV && this._customFadeOut == true) {
                this.gotoTitleOrTest();
            }
        } else {
            if (this._mvFadeOut == true) {
                this.gotoTitleOrTest();
            }
        }

        Scene_Base.prototype.update.call(this);
    };

    Scene_Splash.prototype.createSplashes = function() {
        if (ShowMV) {
            this._mvSplash = new Sprite(ImageManager.loadSystem(MVImage));
            this.addChild(this._mvSplash);
        }
        if (ShowCustom) {
            this._customSplash = new Sprite(ImageManager.loadSystem(CustomImage));
            this._customSplash.opacity = 0;
            this.addChild(this._customSplash);
        }
        if (ShowCustom2) {
            this._customSplash2 = new Sprite(ImageManager.loadSystem(CustomImage2));
            this._customSplash2.opacity = 0;
            this.addChild(this._customSplash2);
        }
    };

    Scene_Splash.prototype.centerSprite = function(sprite) {
        sprite.x = Graphics.width / 2;
        sprite.y = Graphics.height / 2;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
    };

    Scene_Splash.prototype.gotoTitleOrTest = function() {
        Scene_Base.prototype.start.call(this);
        SoundManager.preloadImportantSounds();
        if (DataManager.isBattleTest()) {
            DataManager.setupBattleTest();
            SceneManager.goto(Scene_Battle);
        } else if (DataManager.isEventTest()) {
            DataManager.setupEventTest();
            SceneManager.goto(Scene_Map);
        } else {
            this.checkPlayerLocation();
            DataManager.setupNewGame();
            SceneManager.goto(Scene_Title);
            Window_TitleCommand.initCommandPosition();
        }
        this.updateDocumentTitle();
    };

    Scene_Splash.prototype.updateDocumentTitle = function() {
        document.title = $dataSystem.gameTitle;
    };

    Scene_Splash.prototype.checkPlayerLocation = function() {
        if ($dataSystem.startMapId === 0) {
            throw new Error('Player\'s starting position is not set');
        }
    };

})();