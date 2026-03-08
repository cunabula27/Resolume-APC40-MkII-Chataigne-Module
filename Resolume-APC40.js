var x = local.parameters.deckWidth.get();
var y = local.parameters.deckHeight.get();
var refresh = local.parameters.generateDecks.get();

function init() {
	if (refresh == true) {
		generateDecks(x, y);		
	};
};

function moduleParameterChanged(param) {
	if (param.isParameter()) {

		if (param.name == "generateDecks" && param.get() == true) {
			x = local.parameters.deckWidth.get();
			y = local.parameters.deckHeight.get();
			generateDecks(x, y);
		};
		script.log("Module parameter changed : " + param.name + " > " + param.get());
	} else {
		script.log("Module parameter triggered : " + param.name);
	}
};

function generateDecks(deckWidth, deckHeight) {
	for (var i = 1; i < deckWidth + 1; i++) {
		for (var j = 1; j < deckHeight + 1; j++) {
			var subDeckName = "subDeck" + i + "_" + j;
			var subDeckNiceName = "Sub Deck " + i + " - " + j;
			local.values.addContainer(subDeckNiceName);
			local.values[subDeckName].addContainer("Clip Status");
			local.values[subDeckName].addContainer("Select");
			local.values[subDeckName].addContainer("Connect");
			for (var k = (j - 1) * 5 + 1; k < (j * 5) + 1; k++) {
				for (var l = (i - 1) * 8 + 1; l < (i * 8) + 1; l++) {
					var connectedAddress = "/composition/layers/" + k + "/clips/" + l + "/connected";
					local.values[subDeckName].clipStatus.addIntParameter(connectedAddress, "", "", 0, 4);
					var selectAddress = "/composition/layers/" + k + "/clips/" + l + "/select";
					local.values[subDeckName].select.addTrigger(selectAddress, "Select Clip"); 									//This will add a trigger (button)
					var connectAddress = "/composition/layers/" + k + "/clips/" + l + "/connect";
					local.values[subDeckName].connect.addBoolParameter(connectAddress, "True if Connected", false); 			//This will add a boolean parameter (toggle), defaut unchecked
				};
			};
		};
	};
};

function moduleValueChanged(value) {
	if (value.getParent().name == "crossfadeAssign_AB_") {
		local.send(value.niceName, value.get());
	}
	else if (value.getParent().name == "connect") {
		local.send(value.niceName, value.get());
		if (value.get() == 1) {
			pingKnobValue(value.niceName, "connect");
		};
	}
	else if (value.getParent().name == "select") {
		local.send(value.niceName);
		pingKnobValue(value.niceName, "select");
	};
};

function oscEvent(address, args) {
	var oscAddArr = address.split("/");
	var layerStr = oscAddArr[3];
	var clipStr = oscAddArr[5];
	if (local.match(address, "/composition/layers/*/clips/*/dashboard/link?")) {	// Set Knob Custom Variable on Clip Load
		var knob = "knob" + oscAddArr[7].charAt(4);
		root.customVariables.trackKnobs.variables[knob][knob].set(args[0]);
	} else if (local.match(address, "/composition/layers/*/clips/*/connected")) {	// Light Clip Stop Pads
		var layerVar = "clipInLayer" + layerStr;
		var clipVar = "layer" + layerStr + "Playing";
		if (args[0] > 2) {
			root.customVariables.helpers.variables[layerVar][layerVar].set(parseInt(clipStr));
			root.customVariables.helpers.variables[clipVar][clipVar].set(true);
		} else if (args[0] < 3 && root.customVariables.helpers.variables[layerVar][layerVar].get() == parseInt(clipStr)) {
			root.customVariables.helpers.variables[clipVar][clipVar].set(false);
		};
	} else if (local.match(address, "/composition/columns/*/connected")) {
		var columnVar = "column" + layerStr; 										// It's the column number but no point in renaming for the sake of it
		if (args[0] == 2) {
			root.customVariables.columns.variables[columnVar][columnVar].set(true);
		} else {
			root.customVariables.columns.variables[columnVar][columnVar].set(false);
		};
	};
};

function pingKnobValue(address, arg) { // Incoming address and string to replace from it
	var knobQuery;
	for (i = 1; i < 9; i++) {
		knobQuery = "dashboard/link" + i;
		var pingAddress = address.replace(arg, knobQuery);
		local.send(pingAddress, "?");
	};
};