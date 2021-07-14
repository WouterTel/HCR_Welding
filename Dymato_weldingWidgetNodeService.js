const path = require('path');
const WidgetNodeService = require('rodix_api').WidgetNodeService;
const Dymato_weldingWidgetNodeContribution = require(path.join(__dirname, 'Dymato_weldingWidgetNodeContribution'));

class Dymato_weldingWidgetNodeService extends WidgetNodeService{
    constructor(){
        super();
    }

    getTitle(){
        return 'Dymato_welding';
    }
    getIcon(){
        return path.join(__dirname, "htmlStore/resource/ico-dymato-3.png");
    }
    getHTML(){
        return path.join(__dirname, "htmlStore/Dymato_weldingWidgetNode.html");
    }
    createContribution(rodiAPI, dataModel){
        return new Dymato_weldingWidgetNodeContribution(rodiAPI, dataModel);
    }
}

module.exports = Dymato_weldingWidgetNodeService;
