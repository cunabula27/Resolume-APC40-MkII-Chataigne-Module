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
					var myStringParam = local.values[subDeckName].selected.addStringParameter(selectName, "", selectAddress);
					var connectAddress = "/composition/layers/" + k + "/clips/" + l + "/connect";
					var connectName = "Layer " + k + ", Clip " + l + " - Triggered";
					var myStringParam = local.values[subDeckName].triggered.addStringParameter(connectName, "", connectAddress);
				};
			};
		};
	};
};

function moduleValueChanged (value) {
	if (value.getParent().name == "crossfader"){
	local.send(value.niceName, value.get()); 
	};
};

function oscEvent(address, args)
{
	//param "address" is the address of the OSC Message
	//param "args" is an array containing all the arguments of the OSC Message

	script.log("OSC Message received "+address+", "+args.length+" arguments");
	for(var i=0; i < args.length; i++)
	{
		script.log(" > "+args[i]);
	}
}
