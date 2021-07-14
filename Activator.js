const path = require('path');
const PluginActivator = require('rodix_api').PluginActivator;
const Dymato_weldingExtensionService = require(path.join(__dirname, 'Dymato_weldingExtensionNodeService'));
const Dymato_weldingProgramNodeService = require(path.join(__dirname, 'Dymato_weldingProgramNodeService'));
const Dymato_weldingWidgetService = require(path.join(__dirname, 'Dymato_weldingWidgetNodeService'));

class Activator extends PluginActivator {
  constructor() {
    super();
  }

  start(context) {
    context.registerService('Dymato_weldingExtension', new Dymato_weldingExtensionService());
    context.registerService('Dymato_weldingProgramNodeService', new Dymato_weldingProgramNodeService());
    context.registerService('Dymato_weldingWidget', new Dymato_weldingWidgetService());
  }

  stop() {
  }
}

module.exports = Activator;
