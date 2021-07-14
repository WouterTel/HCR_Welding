const ExtensionNodeContribution = require('rodix_api').ExtensionNodeContribution;

/////////////////////////////////////////////////////////////////////////////////
/*

This is the extension node contribution for the welding plug-in for the Dymato 
welding application.
This extension contains the safety features for the welding application.
In short the code below makes shure of the following:
	When the program is pauzed the torch is turned off.
	When the program is stopped the torch is turned off.
	When the emergency button is pressed the torch is turned off.

*/
/////////////////////////////////////////////////////////////////////////////////

class Dymato_weldingExtensionNodeContribution extends ExtensionNodeContribution {
    constructor(rodiAPI, dataModel){
        super();
        this.rodiAPI = rodiAPI;
        this.dataModel = dataModel;
        this.uiHandler = rodiAPI.getUIHandler();
        this.components = this.uiHandler.getAllUIComponents();

	this.eventModel = rodiAPI.getEventModel();			// Defining the Event model
        this.commandModel = this.rodiAPI.getCommandModel();		// Defining the Command model
	this.ioModel = this.rodiAPI.getIOModel(); 			// Defining the Input/Output model
	
	this.console = this.rodiAPI.getUserInteraction().Console;	// Defining console, this is only used for checks during debugging
	
	this.dataModel.set('torchOutput', 0);				// Defining the output with which the torch is turned on. Default is 0.
	
	// Defining to which outputs warning light is connected and setting light to green
	this.dataModel.set('greenLight', 5);
	this.dataModel.set('orangeLight', 6);
	this.dataModel.set('redLight', 7);
	this.setLights('green');

	// Listener that checks the program status in case pauze or stop button is pressed.
	this.eventModel.addListener(this.eventModel.getNames().PROGRAM_STATUS, this.onPauze.bind(this));

	// Listener that checks for runtime errors (i.e. collision, joint overload, etc.).
	// It seems that this listener is never activated and when it is in the program the extension page won't load.
	//this.eventModel.addListener(this.eventModel.getNames().PROGRAM_RUNTIME_ERROR, this.onStop.bind(this));

    }

    openView(){

    }
    closeView(){

    }
    generateScript(enterWriter, exitWriter){

    }

    // When program status changes, listener is triggered and onPauze function is called
    onPauze(event){
	let torchOutput = this.dataModel.get('torchOutput');	// get output that switches torch	
	let outputs = this.getIOStatus();			// get current output status
	let inputs = this.getInputs();				// get current input status
	let torchOn = this.dataModel.get('selected');		// check whether welding process is selected
	//this.console.log(`${event.status}`)

	// if the program status is pauzing or stopping and the torch is switched on, torch is switched off and program is stopped.
	if(outputs[torchOutput]==1 && event.status == "PROGRAM_STATE_PAUSING"){
		//this.console.log(`Program pausing called`);
		this.commandModel.program_stop();
	}
	else if(outputs[torchOutput]==1 && event.status == "PROGRAM_STATE_STOPPING"){
		//this.console.log(`Program stopping called`);
		this.commandModel.set_io_digital({io_number:torchOutput, type:"GEN", value:0});
		this.setLights('red');
		this.commandModel.script(`popup("Program stopped while welding process was active. Please move the robot away from the workpiece and start a new process.",2)`);
	}
	// if the program status is running and the command to switch on the torch is selected, it is checked whether the welding machine is ready. If not, program is stopped.
	else if(event.status =="PROGRAM_STATE_RUN" && inputs[0]==0 && torchOn == 1){
		this.commandModel.script(`popup("Power source is not ready!",2)`);
	}
	else if(event.status =="PROGRAM_STATE_RUN"){
		this.setLights('orange');
	}
	else if(outputs[torchOutput]==0 && event.status == "PROGRAM_STATE_STOPPED"){
		this.setLights('green');
	}
    }	
/*
    // When the program runs into an error like a collision, listener is triggered and onStop function is called. Torch is turned off.
    OnStop(event){
	this.console.log(`Runtime error called`);
	this.commandModel.set_io_digital({io_number:torchOutput, type:"GEN", value:0});
    }
*/
    // function getIOStatus gets current status of the general outputs.
    getIOStatus() {
	var ios = this.ioModel.getGeneralDigitalOutput();
	var outputs = [];

        for(var io of ios) {
            let getValue = io.getValue();
            outputs.push(getValue);	
        }
	return outputs;
    }
    getInputs() {
	var ios = this.ioModel.getGeneralDigitalInput();
	var inputs = [];

        for(var io of ios) {
            let getValue = io.getValue();
            inputs.push(getValue);	
        }
	return inputs;
    }
    setWeldingOn(value){
	this.dataModel.set('selected',value);
    }
    getWeldingOn(){
	let value = this.dataModel.get('selected');
	return value;
    }
    setLights(color){
	switch(color){
		case 'green':
			this.commandModel.set_io_digital({io_number:this.dataModel.get('greenLight'), type:"GEN", value:1});
			this.commandModel.set_io_digital({io_number:this.dataModel.get('orangeLight'), type:"GEN", value:0});
			this.commandModel.set_io_digital({io_number:this.dataModel.get('redLight'), type:"GEN", value:0});
			//this.console.log(`green`);
			break;
		case 'orange':
			this.commandModel.set_io_digital({io_number:this.dataModel.get('greenLight'), type:"GEN", value:0});
			this.commandModel.set_io_digital({io_number:this.dataModel.get('orangeLight'), type:"GEN", value:1});
			this.commandModel.set_io_digital({io_number:this.dataModel.get('redLight'), type:"GEN", value:0});
			//this.console.log(`orange`);
			break;
		case 'red':
			this.commandModel.set_io_digital({io_number:this.dataModel.get('greenLight'), type:"GEN", value:0});
			this.commandModel.set_io_digital({io_number:this.dataModel.get('orangeLight'), type:"GEN", value:0});
			this.commandModel.set_io_digital({io_number:this.dataModel.get('redLight'), type:"GEN", value:1});
			//this.console.log(`red`);
			break;
	}
    }
}


module.exports = Dymato_weldingExtensionNodeContribution;
