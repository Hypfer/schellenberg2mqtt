class SchellenbergRemoteMessage {
    /**
     * @param {object} options
     * @param {string} options.deviceId 
     * @param {number} options.target 
     * @param {number} options.command
     * @param {number} options.counter
     * @param {number} options.repeatCounter
     * @param {number} options.signalStrength
     */
    constructor(options) {
        this.deviceId = options.deviceId;
        this.target = options.target;
        this.command = SchellenbergRemoteMessage.COMMANDS[options.command];
        this.messageId = options.messageId; // Message counter incremented by the device for each new command
        this.repeatCounter = options.repeatCounter; // Repeat counter since the message gets sent 10 times
        this.signalStrength = options.signalStrength;
    }
}

SchellenbergRemoteMessage.COMMANDS = {
    0x00: "STOP",
    0x01: "UP",
    0x02: "DOWN",
};

module.exports = SchellenbergRemoteMessage;