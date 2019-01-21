
const LynxariDevice = require(process.lynxari.device);
const device = require('@agilatech/veml6070');

module.exports = class veml6070 extends LynxariDevice {
    constructor(config) {
        const hardware = new device(config);
        super(hardware, config);
    }
}

