//=============================================================================
// CloseGame.js
//=============================================================================
/*:
 * @plugindesc Adds a close option to the title command window.
 * @author Zach Aars
 *
 * @param exitName
 * @desc The offset value for the x coordinate.
 * @default exit
 * 
 * @help This plugin does not provide plugin commands.
 */

(function(){
	var custom_WT = Window_TitleCommand.prototype.makeCommandList;
	var custom_ST = Scene_Title.prototype.createCommandWindow;
	var custom_GE = Window_GameEnd.prototype.makeCommandList
	var custom_SE = Scene_GameEnd.prototype.createCommandWindow;
	var param = PluginManager.parameters('CloseGame');
	var exitName = String(param['exitName'] || 'exit');
	
	
	Window_TitleCommand.prototype.makeCommandList = function() {
		custom_WT.call(this);
		this.addCommand(exitName,   'exit');
	};
	
	Window_GameEnd.prototype.makeCommandList = function() {
		custom_GE.call(this);
		this.addCommand(exitName,  'exit');
	};
	
	Scene_Title.prototype.createCommandWindow = function() {
		custom_ST.call(this);
		this._commandWindow.setHandler('exit',  this.commandExit.bind(this));
	};
	
	Scene_GameEnd.prototype.createCommandWindow = function() {
		custom_SE.call(this);
		this._commandWindow.setHandler('exit',   this.exitCommand.bind(this));
	};
		
	Scene_Title.prototype.commandExit = function(){
		
		do{	
			this._commandWindow.close();
			this.fadeOutAll();
		}while(false);
		
		SceneManager.terminate();
	};
	
	Scene_GameEnd.prototype.exitCommand = function(){
		
		do{	
			this._commandWindow.close();
			this.fadeOutAll();
		}while(false);
		
		SceneManager.terminate();
	};
	
	
})();