const path = require('path');
const ProgramNodeService = require('rodix_api').ProgramNodeService;
const Dymato_weldingProgramNodeContribution = require(path.join(__dirname, 'Dymato_weldingProgramNodeContribution'));

class Dymato_weldingProgramNodeService extends ProgramNodeService{
    constructor(){
        super();
    }

    getIcon() {
        return path.join(__dirname, "htmlStore/resource/ico-dymato-3.png");
    }

    getTitle(){
        return 'Dymato_welding';
    }

    getHTML(){
        return path.join(__dirname, "htmlStore/Dymato_weldingProgramNode.html");
    }

    isDeprecated(){
        return false;
    }

    isChildrenAllowed(){
        return true;
    }
    isThreadAllowed(){
        return false;
    }

    createContribution(rodiAPI, dataModel){
        return new Dymato_weldingProgramNodeContribution(rodiAPI, dataModel);
    }

}

module.exports = Dymato_weldingProgramNodeService;
