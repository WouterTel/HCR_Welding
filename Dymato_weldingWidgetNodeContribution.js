const WidgetNodeContribution = require('rodix_api').WidgetNodeContribution;

class Dymato_weldingWidgetNodeContribution extends WidgetNodeContribution {
    constructor(rodiAPI, dataModel){
        super();
        this.rodiAPI = rodiAPI;
        this.dataModel = dataModel;
        this.uiHandler = rodiAPI.getUIHandler();
        this.components = this.uiHandler.getAllUIComponents();

	this.extension = rodiAPI.getExtensionContribution('Dymato_weldingExtensionNodeContribution');
	this.console = this.rodiAPI.getUserInteraction().Console;
	this.uiHandler.on('radioBtn',this.setRadio.bind(this));
    }

    // When the radio button is switched on or off the value in the extension is changed to the desired value.
    setRadio(type, data){
	let antwoord;
	if(data.checked){antwoord = '1'}else{antwoord = '0'}
	this.extension.setWeldingOn(antwoord);
    }
    openView(){

    }
    closeView(){

    }
}


module.exports = Dymato_weldingWidgetNodeContribution;
