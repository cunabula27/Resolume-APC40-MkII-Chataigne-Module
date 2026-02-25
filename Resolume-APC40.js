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
		x = local.parameters.deckWidth.get();
		y = local.parameters.deckHeight.get();
		if (param.name == "generateDecks" && param.get() == true) {
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
			var container = local.values.addContainer(subDeckNiceName);
			var connected = local.values[subDeckName].addContainer("Clip Status");
			var select = local.values[subDeckName].addContainer("Selected");
			var connect = local.values[subDeckName].addContainer("Triggered");
			for (var k = (j - 1) * 5 + 1; k < (j * 5) + 1; k++) {
				for (var l = (i - 1) * 8 + 1; l < (i * 8) + 1; l++) {
					var connectedName = "/composition/layers/" + k + "/clips/" + l + "/connected";
					var myIntParam = local.values[subDeckName].clipStatus.addIntParameter(connectedName, "", "", 0, 4);
					var selectAddress = "/composition/layers/" + k + "/clips/" + l + "/select";
					var selectName = "Layer " + k + ", Clip " + l + " - Selected";
					myStringParam = local.values[subDeckName].selected.addStringParameter(selectName, "", selectAddress);
					var connectAddress = "/composition/layers/" + k + "/clips/" + l + "/connect";
					var connectName = "Layer " + k + ", Clip " + l + " - Triggered";
					myStringParam = local.values[subDeckName].triggered.addStringParameter(connectName, "", connectAddress);
				};
			};
		};
	};
};

function moduleValueChanged (value) {
	if (value.getParent().name == "crossfadeAssign_AB_"){
	local.send(value.niceName, value.get()); 
	};
};

function oscEvent(address, args) {

	if (local.match(address, "/composition/layers/?/clips/?/dashboard/link?")) { 	// Set Knob Custom Variable on Clip Load
		if ((args[0] > 2)) {
			var knob = "selectedClip_Knob" + address.charAt(44);
			root.customVariables.knobs.variables[knob][knob].set(args[0]);
		};
	} else

	if (local.match(address, "/composition/layers/?/clips/?/connected")) { 			// Light Clip Stop Pads
		if ((args[0] > 2)) {
			var clip = "clipLayer" + address.charAt(20);
			root.customVariables.helpers.variables[clip][clip].set(true);
		};
	};
};
