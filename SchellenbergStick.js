const { SerialPort } = require('serialport');
const EventEmitter = require("events").EventEmitter;
const SchellenbergParser = require("./SchellenbergParser");

const Logger = require("./Logger");
const FIFOCache = require("./FIFOCache");


class SchellenbergStick {
    constructor() {
        this.eventEmitter = new EventEmitter();
        
        this.lastSeenCommands = new FIFOCache(8192);
    }
    
    initialize() {
        if (!process.env.SERIALPORT) {
            Logger.error("SERIALPORT is not set.");

            process.exit(1);
        }

        this.port = new SerialPort({
                path: process.env.SERIALPORT,
                baudRate: 9600,
            },
            (err) => {
                if (err) {
                    Logger.error(`Error while opening '${process.env.SERIALPORT}': `, err.message);

                    process.exit(1);
                }
            }
        );

        // The stick wants something written to it to enter listening mode
        // We can write that on every startup it doesn't care
        this.port.write("lmao\r\n");

        this.port.on('data',  (data) => {
            const parsedData = SchellenbergParser.PARSE(data);

            if (parsedData) {
                const key = `${parsedData.deviceId}_${parsedData.target}_${parsedData.messageId}`
                
                if (!this.lastSeenCommands.has(key)) { // Since these messages are repeated many times, ensure that we only publish them once
                    this.lastSeenCommands.put(key, true);
                    
                    Logger.info(`Received Message from ${parsedData.deviceId} targeting ${parsedData.target} with command ${parsedData.command}`);
                    this.emitKeypress(parsedData);
                }
            }
        })
    }

    emitKeypress(data) {
        this.eventEmitter.emit(SchellenbergStick.EVENTS.KEYPRESS, data);
    }
    
    onKeypress(listener) {
        this.eventEmitter.on(SchellenbergStick.EVENTS.KEYPRESS, listener);
    }
}

SchellenbergStick.EVENTS = {
    KEYPRESS: "KEYPRESS"
}

module.exports = SchellenbergStick;