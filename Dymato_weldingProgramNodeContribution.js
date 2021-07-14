const ProgramNodeContribution = require('rodix_api').ProgramNodeContribution;

/////////////////////////////////////////////////////////////////////////////////
/*

This is the program node contribution for the welding plug-in for the Dymato 
welding application.
This program contains all the functionality of the welding application.
In short the code below makes shure of the following:
	torch is turned on and off
	weaving is turned on and off
	correct weaving parameters are selected
	job bits are turned on and off	

*/
/////////////////////////////////////////////////////////////////////////////////

class Dymato_weldingProgramNodeContribution extends ProgramNodeContribution {
    constructor(rodiAPI, dataModel){
        super();
        this.rodiAPI = rodiAPI;						// Defining API
        this.dataModel = dataModel;					// Defining Datamodel
        this.uiHandler = rodiAPI.getUIHandler();			// Defining UI handler
        this.components = this.uiHandler.getAllUIComponents();		// Defining interface components
	this.programModel = this.rodiAPI.getProgramModel();		// Defining program model
	this.uuid = this.rodiAPI.getUuid();				// Defining uuid of this program node
	this.console = this.rodiAPI.getUserInteraction().Console;	// Defining console, this is only used for checks during debugging
	this.commandModel = this.rodiAPI.getCommandModel();		// Defining the command model
	this.eventModel = rodiAPI.getEventModel();			// Defining the event model

	// Defining extension belonging to this program node
	this.extension = rodiAPI.getExtensionContribution('Dymato_weldingExtensionNodeContribution');

	// Defining the output with which the torch is turned on. Default is 0.
	this.dataModel.set('torchOutput', 0);	

	// Setting the default values for every variable.	
	this.setDefaultsToDataModel();
	
	// Defining what function to trigger when a certain value in the program node is changed or button is pressed.
	this.uiHandler.on("weavingType",this.weavingTypeSelect.bind(this));
	this.uiHandler.on("weavingLeftAmp",this.weavingLeftAmpSelect.bind(this));
	this.uiHandler.on("weavingRightAmp",this.weavingRightAmpSelect.bind(this));
	this.uiHandler.on("weavingFreq",this.weavingFreqSelect.bind(this));
	this.uiHandler.on("weavingWait",this.weavingWaitSelect.bind(this));
	this.uiHandler.on("weavingWaitStop",this.weavingWaitStopSelect.bind(this));
	this.uiHandler.on("weavingJobOne",this.weavingBitOneSelect.bind(this));
	this.uiHandler.on("weavingJobTwo",this.weavingBitTwoSelect.bind(this));
	this.uiHandler.on("weavingJobThree",this.weavingBitThreeSelect.bind(this));
	this.uiHandler.on("velocitySelect",this.velocitySelect.bind(this));
	this.uiHandler.on("btnStandard",this.pressStnd.bind(this));
	this.uiHandler.on("btnAdvanced",this.pressAdv.bind(this));
    }

    initializeNode(thisNode, callback) {
        callback(null, thisNode);
    }

    // When the standard options tab is selected this function is called
    pressStnd(){

	this.components.btnStandard.setClassName("knopje-actief");
	this.components.btnAdvanced.setClassName("knopje-nonactief");
	this.components.standardPage.setVisible(true);
	this.components.advancedPage.setVisible(false);

	this.uiHandler.render()
    }

    // When the advanced options tab is selected this function is called
    pressAdv(){

	this.components.btnStandard.setClassName("knopje-nonactief");
	this.components.btnAdvanced.setClassName("knopje-actief");
	this.components.standardPage.setVisible(false);
	this.components.advancedPage.setVisible(true);

	this.uiHandler.render()
    }

    // When the program note is displayed in Rodi the openView function is called to update the page.
    openView(){	
   	// All variables are retrieved with the getData function	
	const {
	    commandType,
            leftAmplitude,
            rightAmplitude,
	    leftStopSettlingTime,
	    rightStopSettlingTime,
            frequency,
	    velocity,
	    torchOn,
	    waitMove,
	    waitAfterMove,
	    bitOne,
	    bitTwo,
	    bitThree,
        } = this.getData();

   	// All text inputs and checkboxes are set to the previously sellected values.	
        this.components.weavingType.selectItem(commandType);
        this.components.weavingLeftAmp.setText(leftAmplitude);
        this.components.weavingRightAmp.setText(rightAmplitude);
        this.components.weavingFreq.setText(frequency);
	this.components.velocitySelect.setText(velocity);
	this.components.weavingWait.setText(waitMove);
	this.components.weavingWaitStop.setText(waitAfterMove);
	this.components.weavingJobOne.setChecked(bitOne);
	this.components.weavingJobTwo.setChecked(bitTwo);
	this.components.weavingJobThree.setChecked(bitThree);
	
	// The screen is updated.
        this.uiHandler.render();

    }
    closeView(){

    }

    // When the 'Apply' button is pressed the generateScript function is called to create the contribution to the program.
    generateScript(enterWriter, exitWriter){

	// All variables are retrieved with the getData function
	const {
	    commandType,
            leftAmplitude,
            rightAmplitude,
	    leftStopSettlingTime,
	    rightStopSettlingTime,
            frequency,
	    velocity,
	    torchOn,
	    waitMove,
	    waitAfterMove,
	    bitOne,
	    bitTwo,
	    bitThree,
        } = this.getData();


	// Check whether non-movement nodes are added to this node and change velocity of all movement nodes.
	let myNode = this.programModel.getNode(this.uuid);
	let kinders = myNode.getChildren();
	let i;
	
	// Check for non-movement nodes and give a warning if one is detected.
	for (i = 0; i < kinders.length; i++){
		if(kinders[i].type != "MOVE"){
			this.commandModel.script(`popup("Warning!! ${myNode.name} contains non-movement commands",0)`);
			return;
		}
	}

	// Change config of child nodes to velocity that is entered in this node.
	for(i=0; i<kinders.length; i++){

		let moveNode = this.programModel.getProgramNodeFactory().createMoveNode();
		let figCon;

		if (kinders[i].config.type == "MoveLinearConfig" || kinders[i].config.type == "MoveJointConfig"){
			let goalPose = myNode.children[i].getConfig().getWaypoint();
			figCon = moveNode.getConfigFactory().createConfig(moveNode.getConfigFactory().configTypes().LINEAR);
			figCon.setRadius(0);
			figCon.setNonStopFlag(false);
			figCon.setWaypoint(goalPose);
		} else if(kinders[i].config.type == "MoveArcConfig"){
			let goalPose1 = myNode.children[i].getConfig().getWaypoint1();
			let goalPose2 = myNode.children[i].getConfig().getWaypoint2();
			figCon = moveNode.getConfigFactory().createConfig(moveNode.getConfigFactory().configTypes().ARC);
			figCon.setWaypoint1(goalPose1);
			figCon.setWaypoint2(goalPose2);
		} else if(kinders[i].config.type == "MoveCircleConfig"){
			let goalPose1 = myNode.children[i].getConfig().getWaypoint1();
			let goalPose2 = myNode.children[i].getConfig().getWaypoint2();
			figCon = moveNode.getConfigFactory().createConfig(moveNode.getConfigFactory().configTypes().CIRCLE);
			figCon.setWaypoint1(goalPose1);
			figCon.setWaypoint2(goalPose2);
		}

		figCon.setMaxVelocity(velocity);
		figCon.setMaxAcceleration(500);
		myNode.children[i].setConfig(figCon);
		myNode.children[i].setFrame(moveNode.frameTypes().TCP);
	}
	this.programModel.updateNode(myNode);

	// If there are child nodes that are not linear movements, the program gives an error.
	//let check = this.dataModel.get('check');
	//enterWriter.appendLine(`if(${check}){popup("Commands under welding node can only be linear movement commands, problem found at node: ${thisNode.name}.",2)};`);

	// If the power source is not ready for use and you try to turn on the torch a pop up will appear.
	//enterWriter.appendLine(`if(getGeneralDigitalInput(0) == 0 && ${torchOn}){popup("Power source is not ready!",2)};`);

	// Checking if job bits are set on or off.
	let bitOneOnOff, bitTwoOnOff, bitThreeOnOff;
	if(bitOne){bitOneOnOff = 1}else{bitOneOnOff = 0}
	if(bitTwo){bitTwoOnOff = 1}else{bitTwoOnOff = 0}
	if(bitThree){bitThreeOnOff = 1}else{bitThreeOnOff = 0}	

	// Job bits are set to the correct value.
	enterWriter.appendLine(`setGeneralDigitalOutput(1,${bitOneOnOff});`)	
	enterWriter.appendLine(`setGeneralDigitalOutput(2,${bitTwoOnOff});`)	
	enterWriter.appendLine(`setGeneralDigitalOutput(3,${bitThreeOnOff});`)
	
	// If a zigzag or sinusoidal pattern is selected, the weaving option is turned on with the correct variables.
	switch(commandType){
		case '1':
			enterWriter.appendLine(`WEAVING_ON("SINUSOIDAL",${leftAmplitude},${rightAmplitude},${frequency},${leftStopSettlingTime},${rightStopSettlingTime});`);
			break;
		case '2':
			enterWriter.appendLine(`WEAVING_ON("ZIGZAG",${leftAmplitude},${rightAmplitude},${frequency},${leftStopSettlingTime},${rightStopSettlingTime});`);
			break;
		default:
	}

	// Torch is turned on
	var torchOutput = this.dataModel.get('torchOutput');
	if(torchOn){enterWriter.appendLine(`setGeneralDigitalOutput(${JSON.stringify(torchOutput)},1);`);}

	// Wait
	enterWriter.appendLine(`wait(${waitMove}*1000);`);

	// Here the movement commands that are added as child nodes will appear in the code.

	// When all the movements are finished the torch is turned off.
	exitWriter.appendLine(`setGeneralDigitalOutput(${JSON.stringify(torchOutput)},0);`);
	exitWriter.appendLine(`wait(${waitAfterMove}*1000);`);
	
	// Weaving is turned off
	switch(commandType){
		case '1':
		case '2':
			exitWriter.appendLine(`WEAVING_OFF();`);
			break;
		default:
	}

	
    }

    // When the program is first called the the variables are set to default values.
    setDefaultsToDataModel() {
	if (this.dataModel.has('check') === false) {
	    this.dataModel.set('check',0);
	}
        if (this.dataModel.has('commandType') === false) {
            this.dataModel.set('commandType', 0);
        } 
        if (this.dataModel.has('leftAmplitude') === false) {
            this.dataModel.set('leftAmplitude', 0);
        }
        if (this.dataModel.has('rightAmplitude') === false) {
            this.dataModel.set('rightAmplitude', 0);
        }
        if (this.dataModel.has('frequency') === false) {
            this.dataModel.set('frequency', 0);
        }
        if (this.dataModel.has('velocity') === false) {
            this.dataModel.set('velocity', 5);
        }
        if (this.dataModel.has('leftStopSettlingTime') === false) {
            this.dataModel.set('leftStopSettlingTime', 0);
        }
        if (this.dataModel.has('rightStopSettlingTime') === false) {
            this.dataModel.set('rightStopSettlingTime', 0);
        }
	if (this.dataModel.has('waitMove') === false) {
	    this.dataModel.set('waitMove', 0);
	}
	if (this.dataModel.has('waitAfterMove') === false) {
	    this.dataModel.set('waitAfterMove', 0);
	}
	if (this.dataModel.has('bitOne') === false) {
	    this.dataModel.set('bitOne', false);
	}
	if (this.dataModel.has('bitTwo') === false) {
	    this.dataModel.set('bitTwo', false);
	}
	if (this.dataModel.has('bitThree') === false) {
	    this.dataModel.set('bitThree', false);
	}
    }
	
    // function getData will collect the variable values from the data model and return them in an object.
    getData() {
        const commandType = this.dataModel.get('commandType');
        const leftAmplitude = this.dataModel.get('leftAmplitude');
        const rightAmplitude = this.dataModel.get('rightAmplitude');
        const frequency = this.dataModel.get('frequency');
	const velocity = this.dataModel.get('velocity');
        const leftStopSettlingTime = this.dataModel.get('leftStopSettlingTime');
        const rightStopSettlingTime = this.dataModel.get('rightStopSettlingTime');
	const torchOn = this.extension.getWeldingOn();
	const waitMove = this.dataModel.get('waitMove');
	const waitAfterMove = this.dataModel.get('waitAfterMove');
	const bitOne = this.dataModel.get('bitOne');
	const bitTwo = this.dataModel.get('bitTwo');
	const bitThree = this.dataModel.get('bitThree');

        return {
	    commandType,
            leftAmplitude,
            rightAmplitude,
	    leftStopSettlingTime,
	    rightStopSettlingTime,
            frequency,
	    velocity,
	    torchOn,
	    waitMove,
	    waitAfterMove,
	    bitOne,
	    bitTwo,
	    bitThree,
        };
    }

    // Functions below change the values of variables in the data model when they are changed in Rodi.
    weavingTypeSelect(type, data){
        if (type !== 'select') return;
        this.dataModel.set('commandType', data.selected);
    }
    weavingLeftAmpSelect(type, data){
        if (type !== 'change') return;
        const value = Number(data.value);
        this.dataModel.set('leftAmplitude', value);
    }
    weavingRightAmpSelect(type, data){
        if (type !== 'change') return;
        const value = Number(data.value);
        this.dataModel.set('rightAmplitude', value);
    }
    weavingFreqSelect(type, data){
        if (type !== 'change') return;
        const value = Number(data.value);
        this.dataModel.set('frequency', value);
    }
    velocitySelect(type, data){
        if (type !== 'change') return;
        const value = Number(data.value);
        this.dataModel.set('velocity', value);
    }
    weavingWaitSelect(type, data){
        if (type !== 'change') return;
        const value = Number(data.value);
        this.dataModel.set('waitMove', value);
    }
    weavingWaitStopSelect(type, data){
        if (type !== 'change') return;
        const value = Number(data.value);
        this.dataModel.set('waitAfterMove', value);
    }
    weavingBitOneSelect(type, data){
	this.dataModel.set('bitOne', data.checked);
    }  
    weavingBitTwoSelect(type, data){
	this.dataModel.set('bitTwo', data.checked);
    }  
    weavingBitThreeSelect(type, data){
	this.dataModel.set('bitThree', data.checked);
    }  
    isDefined(){
        return true;
    }
}

module.exports = Dymato_weldingProgramNodeContribution;