/* global $CC, Utils, $SD */

/**
 * Here are a couple of wrappers we created to help ypu quickly setup
 * your plugin and subscribe to events sent by Stream Deck to your plugin.
 */

 /**
  * The 'connected' event is sent to your plugin, after the plugin's instance
  * is registered with Stream Deck software. It carries the current websocket
  * and other information about the current environmet in a JSON object
  * You can use it to subscribe to events you want to use in your plugin.
  */

$SD.on('connected', (jsonObj) => connected(jsonObj));

function connected(jsn) {
    /** subscribe to the willAppear and other events */
    $SD.on('com.adm.vlc.action.willAppear', (jsonObj) => action.onWillAppear(jsonObj));
    $SD.on('com.adm.vlc.action.keyUp', (jsonObj) => action.onKeyUp(jsonObj));
    $SD.on('com.adm.vlc.action.sendToPlugin', (jsonObj) => action.onSendToPlugin(jsonObj));
    $SD.on('com.adm.vlc.action.didReceiveSettings', (jsonObj) => action.onDidReceiveSettings(jsonObj));
    $SD.on('com.adm.vlc.action.propertyInspectorDidAppear', (jsonObj) => {
        console.log('%c%s', 'color: white; background: black; font-size: 13px;', '[app.js]propertyInspectorDidAppear:');
    });
    $SD.on('com.adm.vlc.action.propertyInspectorDidDisappear', (jsonObj) => {
        console.log('%c%s', 'color: white; background: red; font-size: 13px;', '[app.js]propertyInspectorDidDisappear:');
    });
	//finally subscribe to the global settings event so we can update settings[vlcPassword]
	$SD.on('didReceiveGlobalSettings', (jsonObj) => action.recieveGlobals(jsonObj));
};

/** ACTIONS */

const action = {
    settings:{},
    onDidReceiveSettings: function(jsn) {
        console.log('%c%s', 'color: white; background: red; font-size: 15px;', '[app.js]onDidReceiveSettings:');
		
		//the icon may have changed so update this instances icon
		this.setIcon(jsn.payload.settings.vlccommand, jsn)
        this.settings = Utils.getProp(jsn, 'payload.settings', {});
		
		$SD.api.setGlobalSettings($SD.uuid, this.settings["vlcPassword"]);
    },
	recieveGlobals: function(jsn){
		//store the (global)vlcPassword in the settings file, check it exists first, as we dont want it to overwrite an exising password.
		if(jsn.payload.settings.hasOwnProperty("vlcPassword")) {
			//we need to only specify ["vlcPassword"], as if we just use this.settings, vlccommand will be overwriten
			this.settings["vlcPassword"] = jsn.payload.settings.vlcPassword; }
	},

    /** 
     * The 'willAppear' event is the first event a key will receive, right before it gets
     * showed on your Stream Deck and/or in Stream Deck software.
     * This event is a good place to setup your plugin and look at current settings (if any),
     * which are embedded in the events payload.
     */

    onWillAppear: function (jsn) {
		
		/**
         * "The willAppear event carries your saved settings (if any). You can use these settings
         * to setup your plugin or save the settings for later use. 
         * If you want to request settings at a later time, you can do so using the
         * 'getSettings' event, which will tell Stream Deck to send your data 
         * (in the 'didReceiceSettings above)
         * 
         * $SD.api.getSettings(jsn.context);
        */
		//console.log(jsn.payload.settings);
		let e=jsn.payload.settings.vlccommand;
		
		//set the right icon for the right button
		this.setIcon(e, jsn);
        this.settings = jsn.payload.settings;
		$SD.api.getGlobalSettings($SD.uuid);
		$SD.api.setSettings($SD.uuid, this.settings);
		/*$SD.api.send($SD.uuid, "setGlobalSettings",  { payload: newset });*/

        // nothing in the settings pre-fill something just for demonstration purposes
        //if (!this.settings || Object.keys(this.settings).length === 0) {
           // this.settings.mynameinput = 'TEMPLATE';
        //}
        //this.setTitle(jsn);
    },
	sendRequest: function (commandSTR) {
		/**
		commands are sent to the webserver address of 
		http://127.0.0.1:8080/requests/status.json?command=pl_plause
		where pl_pause is the command to be executed, we also reuse this code if we dont want to send a command but we want the results from the JSON
		
		for example the current volume*/
		//VLC requires a password, change this to accept a string from the PI
		var vlcPass=this.settings["vlcPassword"];
		
		//set the address to VLC's webserver
		//the file /requests/status.json accepts an arguement of command=
		var vlcAddress = "http://127.0.0.1:8080/requests/status.json?command=";
		
		//setup a httprequest
		var request = new XMLHttpRequest();
		//setup the request
		request.open("get", vlcAddress+commandSTR, false, "", vlcPass);
		//actually send the request now
		request.send();
		//for debugging purposes:
		//console.log(request.response);
		return request.response;
		
	},
	setIcon: function(e, jsn) {
		/*This bit caused me some problems, so here's an explanation if anyone else is new to JS
		
		The code that changes the image is $SD.api.setImage(), but it requires  the image to be in base64
		Which is what Utils.loadImage() does. But loadImage has a second arguement of a callback, which is 
		what is run *after* the image has been loaded, doing loadImage(URL, return var) doesnt work as js sees 
		loadImage as completed before its completed.
		Ultimately callback is what what needs to call $SD.api, yes this makes it a little harder to 
		understand if you're newer to js */
		
		//if we wanted to display the current volume we'd use these lines
		//var curVol = Math.round(Utils.parseJson(this.sendRequest("")).volume/2.56);

		
		switch(e) {
		case "play":
			//changebackground to action/images/play.png
			var out = Utils.loadImage("action/images/play.png", 
				function(output) { $SD.api.setImage(jsn.context, output); });
		break;
		case "volup10pc":
			//changebackground to action/images/play.png
			var out = Utils.loadImage("action/images/+10.png", 
				function(output) { $SD.api.setImage(jsn.context, output); });
			//this.setTitle(jsn, curVol);
		break;
		case "voldown10pc":
			//changebackground to action/images/play.png
			var out = Utils.loadImage("action/images/-10.png", 
				function(output) { $SD.api.setImage(jsn.context, output); });
			//this.setTitle(jsn, curVol);
		break;
		case "voldown5pc":
			//changebackground to action/images/play.png
			var out = Utils.loadImage("action/images/-5.png", 
				function(output) { $SD.api.setImage(jsn.context, output); });
			//this.setTitle(jsn, curVol);
		break;
		case "volup5pc":
			//changebackground to action/images/play.png
			var out = Utils.loadImage("action/images/+5.png", 
				function(output) { $SD.api.setImage(jsn.context, output); });
			//this.setTitle(jsn, curVol);
		break;
		case "next":
			//changebackground to action/images/play.png
			var out = Utils.loadImage("action/images/next.png", 
				function(output) { $SD.api.setImage(jsn.context, output); });
		break;
		case "previous":
			//changebackground to action/images/play.png
			var out = Utils.loadImage("action/images/prev.png", 
				function(output) { $SD.api.setImage(jsn.context, output); });
		break;
		}
	},
	changeVolume: function (oldVol, volDiff) {
		/** 
		simply converts the old volume (between 0-320) and adds the differentaial to it
		You'll notice the 2.56, thats because the desktop app runs 0-125, but the web controller uses 320 as the max
		We also need some over/under-flow control as its possible to set the volumme to -1 or +320, both which make no difference but can make it take longer to reach a useable level.*/
		var newVol = Math.round(((oldVol/2.56)+volDiff)*2.56);
		if (newVol>320) return 320;
		if (newVol<0) return 0;
		return newVol;
	},

    onKeyUp: function (jsn) {
		/** 
		When a key is pressed we need to take the jsn.settings.vlccommand(unique to each button) and act upon it
		for the volume we need to get the current volume from status.json
		fullJSON actually contains all details about the current song, we'll parse it so we can access each element natively
		using a switch as it's just a little bit easier to read.*/
		var fullJSON = Utils.parseJson(this.sendRequest(""));
		var request = jsn.payload.settings.vlccommand;
		
		switch(request) {
			case "play":
				this.sendRequest("pl_pause");
			break;
			case "volup10pc":
				var newVol = this.changeVolume(fullJSON.volume, 10);
				this.sendRequest("volume&val="+newVol);
				//this.setTitle(jsn, Math.round(newVol/2.56));
			break;
			case "voldown10pc":
				var newVol = this.changeVolume(fullJSON.volume, -10);
				this.sendRequest("volume&val="+newVol);
				//this.setTitle(jsn, Math.round(newVol/2.56));
			break;
			case "voldown5pc":
				var newVol = this.changeVolume(fullJSON.volume, -5);
				this.sendRequest("volume&val="+newVol);
				//this.setTitle(jsn, Math.round(newVol/2.56));
			break;
			case "volup5pc":
				var newVol = this.changeVolume(fullJSON.volume, 5);
				this.sendRequest("volume&val="+newVol);
				//this.setTitle(jsn, Math.round(newVol/2.56));
			break;
			case "next":
				this.sendRequest("pl_next");
			break;
			case "previous":
				this.sendRequest("pl_previous");
			break;
			default:
				//if the button has never had a action linked log a warning, and display a alert on the SD
				console.warn("Button needs an action assosiating with it");
				$SD.api.showAlert(jsn.context);
			break;
		}
    },
	

    onSendToPlugin: function (jsn) {
	/**
	when something has changed in the PI we need to save the global password
	the vlccommand is sent with every keypress, so we dont need to worry about saving it*/
	if(jsn.payload.hasOwnProperty('sdpi_collection')) {
		if (jsn.payload.sdpi_collection.hasOwnProperty('key') && jsn.payload.sdpi_collection.key != '') {
			if(jsn.payload.sdpi_collection.key == "vlcPassword") {
				console.log("vlcpass has changed");
				let pl = {
					vlcPassword: jsn.payload.sdpi_collection.value
				};
			$SD.api.send($SD.uuid, "setGlobalSettings",  { payload: pl });
			this.settings["vlcPassword"]=jsn.payload.sdpi_collection.value;
			}
		}
	}
    },

    /**
     * This snippet shows, how you could save settings persistantly to Stream Deck software
     * It is not used in this example plugin.
     */

    saveSettings: function (jsn, sdpi_collection) {
        console.log('saveSettings:', jsn);
        if (sdpi_collection.hasOwnProperty('key') && sdpi_collection.key != '') {
            if (sdpi_collection.value && sdpi_collection.value !== undefined) {
                this.settings[sdpi_collection.key] = sdpi_collection.value;
                console.log('setSettings....', this.settings);
                $SD.api.setSettings(jsn.context, this.settings);
            }
        }
    },

    /**
     * Here's a quick demo-wrapper to show how you could change a key's title based on what you
     * stored in settings.
     * If you enter something into Property Inspector's name field (in this demo),
     * it will get the title of your key.
     * 
     * @param {JSON} jsn // the JSON object passed from Stream Deck to the plugin, which contains the plugin's context
     * 
     */

    setTitle: function(jsn, newTitle) {
            $SD.api.setTitle(jsn.context, newTitle);
    },

};