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
};

/** ACTIONS */

const action = {
    settings:{},
    onDidReceiveSettings: function(jsn) {
        console.log('%c%s', 'color: white; background: red; font-size: 15px;', '[app.js]onDidReceiveSettings:');
		console.log(jsn.payload);
        this.settings = Utils.getProp(jsn, 'payload.settings', {});
        this.doSomeThing(this.settings, 'onDidReceiveSettings', 'orange');
		var json = {
				payload: this.settings,
				settings: this.settings };
		console.log("edited uuid: ",$SD.uuid,"global password set to: ", this.settings["vlcPassword"]);
				
			$SD.api.setGlobalSettings($SD.uuid, this.settings);

        /**
         * In this example we put a HTML-input element with id='mynameinput'
         * into the Property Inspector's DOM. If you enter some data into that
         * input-field it get's saved to Stream Deck persistently and the plugin
         * will receice the updated 'didReceiveSettings' event.
         * Here we look for this setting and use it to change the title of
         * the key.
         */

         this.setTitle(jsn);
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
		let e=jsn.payload.settings.vlccommand;
		
		/*This bit caused me some problems, so here's an explanation if anyone else is new to JS
		
		The code that changes the image is $SD.api.setImage(), but it requires  the image to be in base64
		Which is what Utils.loadImage() does. But loadImage has a second arguement of a callback, which is 
		what is run *after* the image has been loaded, doing loadImage(URL, return var) doesnt work as js sees 
		loadImage as completed before its completed.
		Ultimately callback is what what needs to call $SD.api, yes this makes it a little harder to 
		understand if you're newer to js */
		
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
		break;
		case "voldown10pc":
			//changebackground to action/images/play.png
			var out = Utils.loadImage("action/images/-10.png", 
				function(output) { $SD.api.setImage(jsn.context, output); });
		break;
		case "voldown5pc":
			//changebackground to action/images/play.png
			var out = Utils.loadImage("action/images/-5.png", 
				function(output) { $SD.api.setImage(jsn.context, output); });
		break;
		case "volup5pc":
			//changebackground to action/images/play.png
			var out = Utils.loadImage("action/images/+5.png", 
				function(output) { $SD.api.setImage(jsn.context, output); });
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
        this.settings = jsn.payload.settings;

        // nothing in the settings pre-fill something just for demonstration purposes
        //if (!this.settings || Object.keys(this.settings).length === 0) {
           // this.settings.mynameinput = 'TEMPLATE';
        //}
        //this.setTitle(jsn);
    },
	sendRequest: function (commandSTR) {
		//VLC requires a password, change this to accept a string from the PI
		var vlcPass="password";
		
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
	changeVolume: function (oldVol, volDiff) {
		var newVol = Math.round(((oldVol/2.56)+volDiff)*2.56);
		if (newVol>320) return 320;
		if (newVol<0) return 0;
		return newVol;
	},

    onKeyUp: function (jsn) {
		var fullJSON = Utils.parseJson(this.sendRequest(""));
		var request = jsn.payload.settings.vlccommand;
		switch(request) {
			case "play":
				this.sendRequest("pl_pause");
			break;
			case "volup10pc":
				var newVol = this.changeVolume(fullJSON.volume, 10);
				this.sendRequest("volume&val="+newVol);
			break;
			case "voldown10pc":
				var newVol = this.changeVolume(fullJSON.volume, -10);
				this.sendRequest("volume&val="+newVol);
			break;
			case "voldown5pc":
				var newVol = this.changeVolume(fullJSON.volume, -5);
				this.sendRequest("volume&val="+newVol);
			break;
			case "volup5pc":
				var newVol = this.changeVolume(fullJSON.volume, 5);
				this.sendRequest("volume&val="+newVol);
			break;
			case "next":
				this.sendRequest("pl_next");
			break;
			case "previous":
				this.sendRequest("pl_previous");
			break;
			
		}
		
		
		
		//as a test just pause the current song.
        //this.sendRequest("pl_pause");
    },
	

    onSendToPlugin: function (jsn) {
        /**
         * this is a message sent directly from the Property Inspector 
         * (e.g. some value, which is not saved to settings) 
         * You can send this event from Property Inspector (see there for an example)
         */ 
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

    setTitle: function(jsn) {
        if (this.settings && this.settings.hasOwnProperty('mynameinput')) {
            console.log("watch the key on your StreamDeck - it got a new title...", this.settings.mynameinput);
            $SD.api.setTitle(jsn.context, this.settings.mynameinput);
        }
    },

    /**
     * Finally here's a methood which gets called from various events above.
     * This is just an idea how you can act on receiving some interesting message
     * from Stream Deck.
     */

    doSomeThing: function(inJsonData, caller, tagColor) {
        //console.log('%c%s', `color: white; background: ${tagColor || 'grey'}; font-size: 15px;`, `[app.js]doSomeThing from: ${caller}`);
        // console.log(inJsonData);
    }, 


};

