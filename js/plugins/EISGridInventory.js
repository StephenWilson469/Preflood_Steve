'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//=============================================================================
//  EISGridInventory.js
//=============================================================================

/*:
* @author Kino
* @plugindesc Creates a grid inventory scene in rpgmaker mv. <EIS_GridInv>
*
* @param Background Picture
* @desc The picture used as a Background; should be in your img/system folder.
* @default
*
* @param Num Columns
* @desc The number of of columns in the grid window.
* @default 10
*
* @param Max Items
* @desc The number of items in the grid window
* @default 50
*
* @param Grid Window Width
* @desc Width of the inventory window
* @default 400
*
* @param Grid Window Height
* @desc Height of the inventory window
* @default 300
*
* @param Empty Icon Number
* @desc The icon for an empty space.
* @default 16
*
* @param Help Window Font Size
* @desc Font Size of the help window.
* @default 10
*
* @param Sprite Choice
* @desc Whether you show battlers, or the walking character sprites.(Battler/Walk)
* @default Battler
*
*
* @help
//=============================================================================
//  Introduction
//=============================================================================
* This plugin adds a new scene to the game that displays a grid inventory scene.
* This will display an actor, and the actor's stats as you use inventory items
* on them.
* This plugin is a [WIP] Work in progress.
//=============================================================================
//  Script Call
//=============================================================================
* This plugin has a single script call.
* SceneManager.gotoGridScene();
* This will open up the grid inventory scene.
*
//=============================================================================
//  Exports
//=============================================================================
* For those who use a type of main menu manager, you can pass the grid inventory
* scene with 'Scene_GridInventory'. If you don't like the script call.
//=============================================================================
//  Contact Information
//=============================================================================
*
* Contact me via twitter: EISKino, or on the rpg maker forums.
* Username on forums: Kino.
*
* Forum Link: http://forums.rpgmakerweb.com/index.php?/profile/75879-kino/
* Twitter Link: https://twitter.com/EISKino
* Website: http://endlessillusoft.com/
* Patreon Link: https://www.patreon.com/EISKino
*
* Hope this plugin helps, and enjoy!
* --Kino
*/

(function () {

  var params = $plugins.filter(function (plugin) {
    if (/<EIS_GridInv>/ig.test(plugin.description)) {
      console.log("Loaded EISGridInventory");
      return true;
    } else return false;
  })[0].parameters;

  var GIParams = {
    background: String(params['Background Picture']),
    numColumns: Number(params['Num Columns']),
    maxItems: Number(params['Max Items']),
    gridwWidth: Number(params['Grid Window Width']),
    gridwHeight: Number(params['Grid Window Height']),
    emptyIcon: Number(params['Empty Icon Number']),
    helpFontSize: Number(params['Help Window Font Size']),
    spriteChoice: /Battler/ig.test(params['Sprite Choice'])
  };

  function setup() {
    'use strict';
    //=============================================================================
    //  InventoryRequester
    //=============================================================================

    var InventoryRequester = function () {
      function InventoryRequester() {
        _classCallCheck(this, InventoryRequester);
      }

      _createClass(InventoryRequester, null, [{
        key: 'useItem',
        value: function useItem(user, item) {
          user.useItem(item);
          var action = new Game_Action(user);
          action.setItemObject(item);
          action.apply(user);
          action.applyGlobal();
          console.log("Item Used");
          SoundManager.playRecovery();
        }
      }, {
        key: 'equipItem',
        value: function equipItem(user, item) {
          user.changeEquip(item.etypeId - 1, item);
          console.log("Item equipped");
          SoundManager.playEquip();
        }
      }, {
        key: 'forceEquip',
        value: function forceEquip(user, item) {
          if (item !== null) {
            user.eis_forceChangeEquip(item.etypeId, item);
            console.log(user.equips());
          }
        }
      }]);

      return InventoryRequester;
    }();
    //=============================================================================
    //  SceneObserver
    //=============================================================================


    var SceneObserver = function () {
      function SceneObserver(inventoryWindow, informationWindow, mouseWindow, characterWindow, characterStatWindow) {
        _classCallCheck(this, SceneObserver);

        this._inventoryWindow = inventoryWindow;
        this._infoWindow = informationWindow;
        this._mouseItem = mouseWindow;
        this._characterWindow = characterWindow;
        this._characterStatWindow = characterStatWindow;
        this.update();
        document.addEventListener('mousemove', this.trackMousePos.bind(this));
        this._mouseX = 0;
        this._mouseY = 0;
      }

      _createClass(SceneObserver, [{
        key: 'trackMousePos',
        value: function trackMousePos(event) {
          this._mouseX = Graphics.pageToCanvasX(event.pageX);
          this._mouseY = Graphics.pageToCanvasY(event.pageY);
        }
      }, {
        key: 'update',
        value: function update() {
          this.processHandling();
          this.requestUpdate();
        }
      }, {
        key: 'processHandling',
        value: function processHandling() {
          var item = this._inventoryWindow.currentItem() === undefined ? null : this._inventoryWindow.currentItem();
          this.updateItemInformation();
          this.updateStatInformation();
          this.processSwapping();
          this.processHoldingItem(item);
          this.processUsingItem();
          this.processWindowClosing();
        }
      }, {
        key: 'updateItemInformation',
        value: function updateItemInformation() {
          this._infoWindow.item = this._inventoryWindow.currentMousedItem() === undefined ? null : this._inventoryWindow.currentMousedItem();
          this._characterStatWindow.setTempEquip(this._mouseItem.item);
        }
      }, {
        key: 'updateStatInformation',
        value: function updateStatInformation() {
          var item = this._mouseItem.item;
          if (this._mouseItem.hasItem() && (DataManager.isWeapon(item) || DataManager.isArmor(item))) this._characterStatWindow.setShowStats(true);else this._characterStatWindow.setShowStats(false);
        }
      }, {
        key: 'processHoldingItem',
        value: function processHoldingItem(item) {
          var x = this._mouseX,
              y = this._mouseY;

          if (this._inventoryWindow.isTouchedInsideFrame() && this._inventoryWindow.currentItem() !== undefined && !this._mouseItem.hasItem()) {
            this._mouseItem.item = item;
            this._mouseItem._itemIndex = this._inventoryWindow.index();
          }

          if ((!this._inventoryWindow.isInsideFrame(x, y) || !this._characterWindow.isInsideFrame(x, y)) && TouchInput.isReleased()) setTimeout(this._mouseItem.removeItem.bind(this._mouseItem), 25);
        }
      }, {
        key: 'processSwapping',
        value: function processSwapping() {
          if (this._mouseItem.hasItem() && this._inventoryWindow.isTouchedInsideFrame() && TouchInput.isReleased()) {
            this._inventoryWindow.swapItem(this._mouseItem.item, this._mouseItem._itemIndex);
            this._mouseItem.removeItem();
          }
        }
      }, {
        key: 'processUsingItem',
        value: function processUsingItem() {
          if (this._mouseItem.hasItem() && this._characterWindow.isTouchedInsideFrame() && TouchInput.isReleased()) {
            if (DataManager.isWeapon(this._mouseItem.item) || DataManager.isArmor(this._mouseItem.item)) {
              InventoryRequester.equipItem(this._characterWindow.currentCharacter(), this._mouseItem.item);
              this._characterStatWindow.setTempActor();
            }
            if (DataManager.isItem(this._mouseItem.item)) {
              InventoryRequester.useItem(this._characterWindow.currentCharacter(), this._mouseItem.item);
            }
            this.removeItemFromWindows();
          }
        }
      }, {
        key: 'removeItemFromWindows',
        value: function removeItemFromWindows() {
          this._mouseItem.removeItem();
          this._inventoryWindow.updateItemList();
        }
      }, {
        key: 'processWindowClosing',
        value: function processWindowClosing() {
          var _infoWindow = this._infoWindow,
              x = _infoWindow.x,
              y = _infoWindow.y;

          if (!this._inventoryWindow.isInsideFrame(x, y)) this._infoWindow.item = null;
        }
      }, {
        key: 'requestUpdate',
        value: function requestUpdate() {
          requestAnimationFrame(this.update.bind(this));
        }
      }]);

      return SceneObserver;
    }();
    //=============================================================================
    //  Scene_GridInventory
    //=============================================================================    


    var Scene_GridInventory = function (_Scene_MenuBase) {
      _inherits(Scene_GridInventory, _Scene_MenuBase);

      function Scene_GridInventory() {
        _classCallCheck(this, Scene_GridInventory);

        return _possibleConstructorReturn(this, (Scene_GridInventory.__proto__ || Object.getPrototypeOf(Scene_GridInventory)).call(this));
      }

      _createClass(Scene_GridInventory, [{
        key: 'create',
        value: function create() {
          _get(Scene_GridInventory.prototype.__proto__ || Object.getPrototypeOf(Scene_GridInventory.prototype), 'create', this).call(this);
          this.createAllWindows();
          this.createHandlers();
          this.createObserver();
        }
      }, {
        key: 'createBackground',
        value: function createBackground() {
          this._backgroundSprite = new Sprite();
          this._backgroundSprite.bitmap = GIParams.background.length > 0 ? ImageManager.loadSystem(GIParams.background) : SceneManager.backgroundBitmap();
          this.addChild(this._backgroundSprite);
        }
      }, {
        key: 'createAllWindows',
        value: function createAllWindows() {
          this.createGridInventoryWindow();
          this.createCharacterWindow();
          this.createCharacterEquipWindow();
          this.createCharacterStatWindow();
          this.createInformationWindow();
          this.createMouseItem();
        }
      }, {
        key: 'createGridInventoryWindow',
        value: function createGridInventoryWindow() {
          this._gridInventoryWindow = new Window_GridInventory(275, 125, GIParams.gridwWidth, GIParams.gridwHeight);
          this.addWindow(this._gridInventoryWindow);
        }
      }, {
        key: 'createInformationWindow',
        value: function createInformationWindow() {
          this._informationWindow = new Window_Information();
          this.addWindow(this._informationWindow);
        }
      }, {
        key: 'createMouseItem',
        value: function createMouseItem() {
          this._mouseItem = new Mouse_Item(0, 0, 50, 50);
          this.addChild(this._mouseItem);
        }
      }, {
        key: 'createCharacterWindow',
        value: function createCharacterWindow() {
          this._characterWindow = new Window_Character(0, 125, 250, 250);
          this.addWindow(this._characterWindow);
        }
      }, {
        key: 'createCharacterEquipWindow',
        value: function createCharacterEquipWindow() {
          this._characterEqupWindow = new Window_CharacterEquipment(0, 375, 250, 75);
          this.addWindow(this._characterEqupWindow);
        }
      }, {
        key: 'createCharacterStatWindow',
        value: function createCharacterStatWindow() {
          this._characterStatWindow = new Window_CharacterStats(0, 455, Graphics.width, 170);
          this.addWindow(this._characterStatWindow);
        }
      }, {
        key: 'createHandlers',
        value: function createHandlers() {
          this._gridInventoryWindow.setHandler('ok', this.useItem.bind(this));
          this._gridInventoryWindow.setHandler('cancel', this.returnToCharWindow.bind(this));
          this._characterWindow.setHandler('ok', this.gotoInventory.bind(this));
          this._characterWindow.setHandler('cancel', this.processSceneExit.bind(this));
        }
      }, {
        key: 'useItem',
        value: function useItem() {
          var item = this._gridInventoryWindow.currentItem();
          var character = this._characterWindow.currentCharacter();
          if (DataManager.isItem(item)) InventoryRequester.useItem(character, item);
          if (DataManager.isWeapon(item) || DataManager.isArmor(item)) InventoryRequester.equipItem(character, item);
        }
      }, {
        key: 'returnToCharWindow',
        value: function returnToCharWindow() {
          this._gridInventoryWindow.deactivate();
          this._characterWindow.activate();
        }
      }, {
        key: 'gotoInventory',
        value: function gotoInventory() {
          this._gridInventoryWindow.activate();
          this._characterWindow.deactivate();
        }
      }, {
        key: 'createObserver',
        value: function createObserver() {
          this._observer = new SceneObserver(this._gridInventoryWindow, this._informationWindow, this._mouseItem, this._characterWindow, this._characterStatWindow);
        }
      }, {
        key: 'update',
        value: function update() {
          _get(Scene_GridInventory.prototype.__proto__ || Object.getPrototypeOf(Scene_GridInventory.prototype), 'update', this).call(this);
          this.updateCharacterInfo();
          this.processInputs();
        }
      }, {
        key: 'updateCharacterInfo',
        value: function updateCharacterInfo() {
          this._characterEqupWindow.setCharacter(this._characterWindow.currentCharacter());
          this._characterStatWindow.setCharacter(this._characterWindow.currentCharacter());
        }
      }, {
        key: 'processInputs',
        value: function processInputs() {
          this.processWindowActivation();
          if (this._characterWindow.active && !this._gridInventoryWindow.active) {
            if (Input.isTriggered('right')) {
              this._characterWindow.next();
              setTimeout(this._characterStatWindow.setTempActor.bind(this._characterStatWindow), 20);
            }
            if (Input.isTriggered('left')) {
              this._characterWindow.previous();
              this._characterStatWindow.setTempActor();
              setTimeout(this._characterStatWindow.setTempActor.bind(this._characterStatWindow), 20);
            }
          }
          this.processSceneExit();
        }
      }, {
        key: 'processWindowActivation',
        value: function processWindowActivation() {
          var _observer = this._observer,
              x = _observer._mouseX,
              y = _observer._mouseY;

          if (this._characterWindow.isTouchedInsideFrame()) {
            this._characterWindow.activate();
            this._gridInventoryWindow.deactivate();
          }
          if (this._gridInventoryWindow.isTouchedInsideFrame() || this._gridInventoryWindow.isInsideFrame(x, y) || Input.isTriggered('ok') && this._characterWindow.active) {
            this._gridInventoryWindow.activate();
            this._characterWindow.deactivate();
          } else if (!this._gridInventoryWindow.isTouchedInsideFrame()) {
            this._gridInventoryWindow.deactivate();
          }

          if (this._characterWindow.active && (TouchInput.isCancelled() || Input.isTriggered('cancel'))) {
            this._characterWindow.deactivate();
          }
        }
      }, {
        key: 'processSceneExit',
        value: function processSceneExit() {
          if ((Input.isTriggered('cancel') || TouchInput.isCancelled()) && this.windowsInactive()) {
            SceneManager.pop();
            SoundManager.playCancel();
          }
        }
      }, {
        key: 'windowsInactive',
        value: function windowsInactive() {
          return !this._gridInventoryWindow.active && !this._characterWindow.active;
        }
      }]);

      return Scene_GridInventory;
    }(Scene_MenuBase);
    //=============================================================================
    //  Window_Base
    //=============================================================================


    Window_Base.prototype.isTouchedInsideFrame = function () {
      var x = this.canvasToLocalX(TouchInput.x);
      var y = this.canvasToLocalY(TouchInput.y);
      return x >= 0 && y >= 0 && x < this.width && y < this.height;
    };

    Window_Base.prototype.isInsideFrame = function (x, y) {
      x = this.canvasToLocalX(x);
      y = this.canvasToLocalY(y);
      return x >= 0 && y >= 0 && x < this.width && y < this.height;
    };
    //=============================================================================
    //  Window_Character
    //=============================================================================

    var Window_Character = function (_Window_Base) {
      _inherits(Window_Character, _Window_Base);

      function Window_Character(x, y, width, height) {
        _classCallCheck(this, Window_Character);

        return _possibleConstructorReturn(this, (Window_Character.__proto__ || Object.getPrototypeOf(Window_Character)).call(this, x, y, width, height));
      }

      _createClass(Window_Character, [{
        key: 'initialize',
        value: function initialize(x, y, width, height) {
          _get(Window_Character.prototype.__proto__ || Object.getPrototypeOf(Window_Character.prototype), 'initialize', this).call(this, x, y, width, height);
          this._characters = $gameParty.members();
          this._index = 0;
          this.setupSprite();
          this.activate();
          this._handlers = [];
        }
      }, {
        key: 'setupSprite',
        value: function setupSprite() {
          if (GIParams.spriteChoice) {
            this._battlerSprite = new Sprite_WindowActor(this.currentCharacter(), this.contentsWidth() / 2 + 24, 150);
            this.addChild(this._battlerSprite);
            this._battlerSprite.startMotion('walk');
          }
        }
      }, {
        key: 'update',
        value: function update() {
          _get(Window_Character.prototype.__proto__ || Object.getPrototypeOf(Window_Character.prototype), 'update', this).call(this);
          this.processHandling();
          this.showActiveState();
          this.refresh();
        }
      }, {
        key: 'processHandling',
        value: function processHandling() {
          this.processOk();
          this.processCancel();
        }
      }, {
        key: 'processOk',
        value: function processOk() {
          if (this.active && Input.isTriggered('ok')) this.callHandler('ok');
        }
      }, {
        key: 'processCancel',
        value: function processCancel() {
          if (this.active && Input.isTriggered('cancel')) this.callHandler('cancel');
        }
      }, {
        key: 'showActiveState',
        value: function showActiveState() {
          if (this.active) this.setCursorRect(0, 0, this.contentsWidth(), this.lineHeight());else this.setCursorRect(0, 0, 0, 0);
        }
      }, {
        key: 'refresh',
        value: function refresh() {
          if (this.contents) {
            this.contents.clear();
            this.drawChangeCharacter();
            this.drawCurrentCharacter();
          }
        }
      }, {
        key: 'drawChangeCharacter',
        value: function drawChangeCharacter() {
          this.drawText('L', 0, 0, this.contentsWidth(), 'left');
          this.drawText('Change Character', 30, 0, this.contentsWidth() * .66, 'center');
          this.drawText('R', 0, 0, this.contentsWidth(), 'right');
        }
      }, {
        key: 'drawCurrentCharacter',
        value: function drawCurrentCharacter() {
          var character = this.currentCharacter();
          if (character !== undefined) {
            var xPos = this.contentsWidth() / 2;
            if (GIParams.spriteChoice) this.drawCharacterBattler(character);else this.drawCharacter(character.characterName(), character.characterIndex(), xPos, 120);

            this.drawCharacterInfo(character, xPos, 110);
          }
        }
      }, {
        key: 'drawCharacterBattler',
        value: function drawCharacterBattler(character) {
          this._battlerSprite.setBattler(character);
        }
      }, {
        key: 'drawCharacterInfo',
        value: function drawCharacterInfo(character, x, y) {
          this.drawActorHp(character, x - 100, y + 25, 200);
          this.drawActorMp(character, x - 100, y + 50, 200);
          this.drawText(character.name(), x - this.textWidth(character.name()) / 2, y - 90, this.contentsWidth());
          this.drawText('Lvl. ' + character.level, x - this.textWidth('Lvl. ' + character.level) / 2, y - 70, this.contentsWidth());
        }
      }, {
        key: 'currentCharacter',
        value: function currentCharacter() {
          return this._characters[this._index];
        }
      }, {
        key: 'next',
        value: function next() {
          SoundManager.playCursor();
          if (this._index < this._characters.length - 1) this._index++;else this._index = 0;
        }
      }, {
        key: 'previous',
        value: function previous() {
          SoundManager.playCursor();
          if (this._index > 0) this._index--;else this._index = this._characters.length - 1;
        }
      }, {
        key: 'setHandler',
        value: function setHandler(symbol, method) {
          this._handlers[symbol] = method;
        }
      }, {
        key: 'isHandled',
        value: function isHandled(symbol) {
          return !!this._handlers[symbol];
        }
      }, {
        key: 'callHandler',
        value: function callHandler(symbol) {
          if (this.isHandled(symbol)) {
            this._handlers[symbol]();
          }
        }
      }]);

      return Window_Character;
    }(Window_Base);
    //=============================================================================
    //  Window_CharacterEquipment
    //=============================================================================    


    var Window_CharacterEquipment = function (_Window_Selectable) {
      _inherits(Window_CharacterEquipment, _Window_Selectable);

      function Window_CharacterEquipment(x, y, width, height) {
        _classCallCheck(this, Window_CharacterEquipment);

        return _possibleConstructorReturn(this, (Window_CharacterEquipment.__proto__ || Object.getPrototypeOf(Window_CharacterEquipment)).call(this, x, y, width, height));
      }

      _createClass(Window_CharacterEquipment, [{
        key: 'initialize',
        value: function initialize(x, y, width, height) {
          _get(Window_CharacterEquipment.prototype.__proto__ || Object.getPrototypeOf(Window_CharacterEquipment.prototype), 'initialize', this).call(this, x, y, width, height);
          this._equipList = [];
          this._actor == null;
          this._iconWidth = Window_Base._iconWidth;
          this._iconHeight = Window_Base._iconHeight;
        }
      }, {
        key: 'maxCols',
        value: function maxCols() {
          return 5;
        }
      }, {
        key: 'maxItems',
        value: function maxItems() {
          return 5;
        }
      }, {
        key: 'spacing',
        value: function spacing() {
          return 0;
        }
      }, {
        key: 'update',
        value: function update() {
          _get(Window_CharacterEquipment.prototype.__proto__ || Object.getPrototypeOf(Window_CharacterEquipment.prototype), 'update', this).call(this);
          this.updateEquipList();
          this.refresh();
        }
      }, {
        key: 'updateEquipList',
        value: function updateEquipList() {
          if (this._actor !== null && this._actor !== undefined) this._equipList = this._actor.equips();
        }
      }, {
        key: 'drawItem',
        value: function drawItem(index) {
          var equip = this._equipList[index];
          var icon = equip === undefined || equip === null ? GIParams.emptyIcon : equip.iconIndex;
          var rect = this.itemRect(index);
          this.drawIcon(icon, rect.x, rect.y);
        }
      }, {
        key: 'setCharacter',
        value: function setCharacter(character) {
          this._actor = character;
        }
      }]);

      return Window_CharacterEquipment;
    }(Window_Selectable);
    //=============================================================================
    //  Window_CharacterStats
    //=============================================================================


    var Window_CharacterStats = function (_Window_Selectable2) {
      _inherits(Window_CharacterStats, _Window_Selectable2);

      function Window_CharacterStats(x, y, width, height) {
        _classCallCheck(this, Window_CharacterStats);

        return _possibleConstructorReturn(this, (Window_CharacterStats.__proto__ || Object.getPrototypeOf(Window_CharacterStats)).call(this, x, y, width, height));
      }

      _createClass(Window_CharacterStats, [{
        key: 'initialize',
        value: function initialize(x, y, width, height) {
          _get(Window_CharacterStats.prototype.__proto__ || Object.getPrototypeOf(Window_CharacterStats.prototype), 'initialize', this).call(this, x, y, width, height);
          this._actor = null;
          this._tempActor = null;
          this._statList = [];
          this._showStats = false;
        }
      }, {
        key: 'maxCols',
        value: function maxCols() {
          return 3;
        }
      }, {
        key: 'maxItems',
        value: function maxItems() {
          return 6;
        }
      }, {
        key: 'update',
        value: function update() {
          _get(Window_CharacterStats.prototype.__proto__ || Object.getPrototypeOf(Window_CharacterStats.prototype), 'update', this).call(this);
          this.refresh();
        }
      }, {
        key: 'refresh',
        value: function refresh() {
          _get(Window_CharacterStats.prototype.__proto__ || Object.getPrototypeOf(Window_CharacterStats.prototype), 'refresh', this).call(this);
        }
      }, {
        key: 'drawItem',
        value: function drawItem(index) {
          this.drawCharacterStats(index);
        }
      }, {
        key: 'drawCharacterStats',
        value: function drawCharacterStats(index) {
          if (this._actor !== null) {
            var _itemRectForText = this.itemRectForText(index),
                x = _itemRectForText.x,
                y = _itemRectForText.y,
                width = _itemRectForText.width;

            var statIndex = index + 2;
            this.changeTextColor(this.systemColor());
            this.drawText(TextManager.param(statIndex), x, y, width / 2);
            this.resetTextColor();
            this.drawText(this._actor.param(statIndex), x + 45, y, width / 2, 'right');
            if (this.showStats() && this._tempActor !== null && this._actor.param(statIndex) !== this._tempActor.param(statIndex)) {
              this.changeTextColor(this.systemColor());
              this.drawRightArrow(x + width - 65, y);
              this.changeTextColor(this.paramchangeTextColor(this._tempActor.param(statIndex) - this._actor.param(statIndex)));
              this.drawText(this._tempActor.param(statIndex), x + width - 45, y);
            }
          }
        }
      }, {
        key: 'drawRightArrow',
        value: function drawRightArrow(x, y) {
          this.changeTextColor(this.systemColor());
          this.drawText('\u2192', x, y, 32);
        }
      }, {
        key: 'setCharacter',
        value: function setCharacter(character) {
          this._actor = character;
        }
      }, {
        key: 'setTempActor',
        value: function setTempActor() {
          if (this._tempActor === null) this._tempActor = JsonEx.makeDeepCopy(this._actor);else this._tempActor = JsonEx.makeDeepCopy(this._actor);
          console.log("After Changes", this._tempActor);
        }
      }, {
        key: 'setTempEquip',
        value: function setTempEquip(item) {
          if (item !== null) {
            var tempActorEquip = {};
            if (this._tempActor !== null) tempActorEquip = this._tempActor._equips[item.etypeId - 1];
            if (tempActorEquip !== undefined && this._tempActor !== null && item.id !== tempActorEquip.itemId()) {
              InventoryRequester.forceEquip(this._tempActor, item);
            } else InventoryRequester.forceEquip(this._tempActor, null);
          }
        }
      }, {
        key: 'showStats',
        value: function showStats() {
          return this._showStats;
        }
      }, {
        key: 'setShowStats',
        value: function setShowStats(value) {
          this._showStats = value;
        }
      }]);

      return Window_CharacterStats;
    }(Window_Selectable);
    //=============================================================================
    //  Window_GridInventory
    //=============================================================================    


    var Window_GridInventory = function (_Window_Selectable3) {
      _inherits(Window_GridInventory, _Window_Selectable3);

      function Window_GridInventory(x, y, width, height) {
        _classCallCheck(this, Window_GridInventory);

        return _possibleConstructorReturn(this, (Window_GridInventory.__proto__ || Object.getPrototypeOf(Window_GridInventory)).call(this, x, y, width, height));
      }

      _createClass(Window_GridInventory, [{
        key: 'initialize',
        value: function initialize(x, y, width, height) {
          _get(Window_GridInventory.prototype.__proto__ || Object.getPrototypeOf(Window_GridInventory.prototype), 'initialize', this).call(this, x, y, width, height);
          this._itemList = $gameParty.allItems();
          this.deactivate();
          this._iconWidth = Window_Base._iconWidth;
          this._iconHeight = Window_Base._iconHeight;
          this._mouseIndex = 0;
          document.addEventListener('mousemove', this.updateCurrentMousedIndex.bind(this));
        }
      }, {
        key: 'maxCols',
        value: function maxCols() {
          return GIParams.numColumns;
        }
      }, {
        key: 'maxItems',
        value: function maxItems() {
          return GIParams.maxItems;
        }
      }, {
        key: 'spacing',
        value: function spacing() {
          return 1;
        }
      }, {
        key: 'iconWidth',
        value: function iconWidth() {
          return this._iconWidth;
        }
      }, {
        key: 'iconHeight',
        value: function iconHeight() {
          return this._iconHeight;
        }
      }, {
        key: 'update',
        value: function update() {
          _get(Window_GridInventory.prototype.__proto__ || Object.getPrototypeOf(Window_GridInventory.prototype), 'update', this).call(this);
          this.refresh();
        }
      }, {
        key: 'refresh',
        value: function refresh() {
          if (this.contents) {
            this.contents.clear();
            this.drawAllItems();
            this.drawGold();
          }
        }
      }, {
        key: 'updateItemList',
        value: function updateItemList() {
          this._itemList = $gameParty.allItems();
          this.deselect();
        }
      }, {
        key: 'updateCurrentMousedIndex',
        value: function updateCurrentMousedIndex(event) {
          var x = this.canvasToLocalX(Graphics.pageToCanvasX(event.pageX));
          var y = this.canvasToLocalY(Graphics.pageToCanvasY(event.pageY));
          this._mouseIndex = this.hitTest(x, y);
        }
      }, {
        key: 'drawItem',
        value: function drawItem(index) {
          this.drawGameItem(index);
        }
      }, {
        key: 'drawGameItem',
        value: function drawGameItem(index) {
          var item = this._itemList[index];
          var rect = this.itemRect(index);
          var icon = item === undefined ? GIParams.emptyIcon : item.iconIndex;
          this.drawIcon(icon, rect.x, rect.y);
          this.contents.fontSize = this.contents.fontSize * .70;
          if ($gameParty.numItems(item) > 0) this.drawText($gameParty.numItems(item), rect.x + this.iconWidth() * .55, rect.y + this.iconHeight() * .35);
          this.resetFontSettings();
        }
      }, {
        key: 'drawGold',
        value: function drawGold() {
          this.drawTextEx(TextManager.currencyUnit + ' ' + $gameParty.gold(), 0, this.contentsHeight() - this.lineHeight());
        }
      }, {
        key: 'swapItem',
        value: function swapItem(item, itemIndex) {
          var temp = this._itemList[this.index()];
          this._itemList[itemIndex] = temp;
          this._itemList[this.index()] = item;
          this.deselect();
          console.log('swapped');
        }
      }, {
        key: 'currentItem',
        value: function currentItem() {
          return this._itemList[this.index()];
        }
      }, {
        key: 'currentMousedItem',
        value: function currentMousedItem() {
          return this._itemList[this._mouseIndex];
        }
      }]);

      return Window_GridInventory;
    }(Window_Selectable);
    //=============================================================================
    //  Window_Information
    //=============================================================================    


    var Window_Information = function (_Window_Help) {
      _inherits(Window_Information, _Window_Help);

      function Window_Information() {
        _classCallCheck(this, Window_Information);

        return _possibleConstructorReturn(this, (Window_Information.__proto__ || Object.getPrototypeOf(Window_Information)).call(this));
      }

      _createClass(Window_Information, [{
        key: 'initialize',
        value: function initialize() {
          _get(Window_Information.prototype.__proto__ || Object.getPrototypeOf(Window_Information.prototype), 'initialize', this).call(this, 2);
          this._item = null;
          document.addEventListener('mousemove', this.followMouse.bind(this));
        }
      }, {
        key: 'standardFontSize',
        value: function standardFontSize() {
          return GIParams.helpFontSize;
        }
      }, {
        key: 'resetFontSettings',
        value: function resetFontSettings() {
          this.contents.fontFace = this.standardFontFace();
          this.contents.fontSize = this.standardFontSize();
          this.resetTextColor();
        }
      }, {
        key: 'update',
        value: function update() {
          _get(Window_Information.prototype.__proto__ || Object.getPrototypeOf(Window_Information.prototype), 'update', this).call(this);
          this.updateDimensions();
          this.processText();
          this.processClose();
        }
      }, {
        key: 'updateDimensions',
        value: function updateDimensions() {
          var _text$split = this._text.split('\n'),
              _text$split2 = _slicedToArray(_text$split, 2),
              firstLine = _text$split2[0],
              secondLine = _text$split2[1];

          var width = this.textWidth(firstLine) > this.textWidth(secondLine) ? this.textWidth(firstLine) : this.textWidth(secondLine);
          this.width = width + this.standardPadding() * 2.3;
          if (this.textWidth(secondLine) < 5) this.height = this.fittingHeight(1);else this.height = this.fittingHeight(2);
        }
      }, {
        key: 'processText',
        value: function processText() {
          if (this._item === null || this._item === undefined) {
            this.setText('');
          } else {
            this.setText(this._item.name + '\n' + this._item.description);
          }
        }
      }, {
        key: 'processClose',
        value: function processClose() {
          if (this._item === null || this._item === undefined || this._text.length < 1) this.close();else this.open();
        }
      }, {
        key: 'followMouse',
        value: function followMouse(event) {
          this.move(Graphics.pageToCanvasX(event.pageX), Graphics.pageToCanvasY(event.pageY), this.width, this.height);
        }
      }, {
        key: 'item',
        set: function set(item) {
          this._item = item;
        }
      }, {
        key: 'text',
        set: function set(value) {
          this._text = '' + value;
        }
      }]);

      return Window_Information;
    }(Window_Help);
    //=============================================================================
    //  Mouse_Window
    //=============================================================================


    var Mouse_Item = function (_Sprite_Base) {
      _inherits(Mouse_Item, _Sprite_Base);

      function Mouse_Item(x, y, width, height) {
        _classCallCheck(this, Mouse_Item);

        return _possibleConstructorReturn(this, (Mouse_Item.__proto__ || Object.getPrototypeOf(Mouse_Item)).call(this, x, y, width, height));
      }

      _createClass(Mouse_Item, [{
        key: 'initialize',
        value: function initialize(x, y, width, height) {
          _get(Mouse_Item.prototype.__proto__ || Object.getPrototypeOf(Mouse_Item.prototype), 'initialize', this).call(this);
          this.x = x;
          this.y = y;
          this.bitmap = new Bitmap(width, height);
          this._item = null;
          this._itemIndex = null;
          this.contents = this.bitmap;
          document.addEventListener('mousemove', this.followMouse.bind(this));
        }
      }, {
        key: 'update',
        value: function update() {
          _get(Mouse_Item.prototype.__proto__ || Object.getPrototypeOf(Mouse_Item.prototype), 'update', this).call(this);
          this.refresh();
        }
      }, {
        key: 'followMouse',
        value: function followMouse(event) {
          this.move(Graphics.pageToCanvasX(event.pageX), Graphics.pageToCanvasY(event.pageY));
        }
      }, {
        key: 'refresh',
        value: function refresh() {
          if (this.contents) {
            this.contents.clear();
            this.drawHeldItem();
          }
        }
      }, {
        key: 'drawHeldItem',
        value: function drawHeldItem() {
          if (this._item !== null && TouchInput.isPressed()) Window_Base.prototype.drawIcon.call(this, this._item.iconIndex, 0, 0);else this.contents.clear();
        }
      }, {
        key: 'hasItem',
        value: function hasItem() {
          if (this._item !== null && this._item !== undefined) return true;
        }
      }, {
        key: 'removeItem',
        value: function removeItem() {
          this._item = null;
          console.log("Item removed");
        }
      }, {
        key: 'item',
        set: function set(item) {
          this._item = item;
        },
        get: function get() {
          return this._item;
        }
      }, {
        key: 'itemIndex',
        set: function set(value) {
          this._itemIndex = value;
        },
        get: function get() {
          return this._itemIndex;
        }
      }]);

      return Mouse_Item;
    }(Sprite_Base);
    //=============================================================================
    // Sprite_WindowActor
    //=============================================================================


    var Sprite_WindowActor = function (_Sprite_Actor) {
      _inherits(Sprite_WindowActor, _Sprite_Actor);

      function Sprite_WindowActor(battler, x, y) {
        _classCallCheck(this, Sprite_WindowActor);

        return _possibleConstructorReturn(this, (Sprite_WindowActor.__proto__ || Object.getPrototypeOf(Sprite_WindowActor)).call(this, battler, x, y));
      }

      _createClass(Sprite_WindowActor, [{
        key: 'initialize',
        value: function initialize(battler, x, y) {
          _get(Sprite_WindowActor.prototype.__proto__ || Object.getPrototypeOf(Sprite_WindowActor.prototype), 'initialize', this).call(this, battler);
          this._posX = x;
          this._posY = y;
          this.setActorHome(x, y);
          this.setMotion('walk');
        }
      }, {
        key: 'setBattler',
        value: function setBattler(battler) {
          Sprite_Battler.prototype.setBattler.call(this, battler);
          var changed = battler !== this._actor;
          if (changed) {
            this._actor = battler;
            if (battler) {
              this.setActorHome(this._posX, this._posY);
            }
            this.startEntryMotion();
            this._stateSprite.setup(battler);
          }
        }
      }, {
        key: 'setMotion',
        value: function setMotion(motion) {
          this._setMotion = motion;
        }
      }, {
        key: 'refreshMotion',
        value: function refreshMotion() {
          var actor = this._actor;
          var motionGuard = Sprite_Actor.MOTIONS['guard'];
          if (actor) {
            this.startMotion(this._setMotion);
          }
        }
      }, {
        key: 'moveToStartPosition',
        value: function moveToStartPosition() {
          this.startMove(this._posX, this._posY, 0);
        }
      }, {
        key: 'setActorHome',
        value: function setActorHome(x, y) {
          this.setHome(x, y);
        }
      }, {
        key: 'update',
        value: function update() {
          _get(Sprite_WindowActor.prototype.__proto__ || Object.getPrototypeOf(Sprite_WindowActor.prototype), 'update', this).call(this);
          this.setPosition();
        }
      }, {
        key: 'setPosition',
        value: function setPosition() {
          this.move(this._posX, this._posY);
        }
      }]);

      return Sprite_WindowActor;
    }(Sprite_Actor);
    //=============================================================================
    //  Game_Actor
    //=============================================================================


    Game_Actor.prototype.eis_forceChangeEquip = function (slotId, item) {
      this._equips[slotId - 1].setObject(item);
      console.log(this.equips());
      // this.refresh();
    };
    //=============================================================================
    //  SceneManager
    //=============================================================================    
    SceneManager.gotoGridScene = function () {
      this.push(Scene_GridInventory);
    };
    //=============================================================================
    //  Exports
    //=============================================================================    
    window.Scene_GridInventory = Scene_GridInventory;
  }

  setup();
})();
//# sourceMappingURL=EISGridInventory.js.map