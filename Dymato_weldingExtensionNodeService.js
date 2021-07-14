const path = require('path');
const ExtensionNodeService = require('rodix_api').ExtensionNodeService;
const Dymato_weldingExtensionNodeContribution = require(path.join(__dirname, 'Dymato_weldingExtensionNodeContribution'));

class Dymato_weldingExtensionNodeService extends ExtensionNodeService{
    constructor(){
        super();
    }

    getTitle(){
        return 'Dymato_welding';
    }
    getHTML(){
        return path.join(__dirname, "htmlStore/Dymato_weldingExtensionNode.html");
    }
    createContribution(rodiAPI, dataModel){
        return new Dymato_weldingExtensionNodeContribution(rodiAPI, dataModel);
    }
}

module.exports = Dymato_weldingExtensionNodeService;
