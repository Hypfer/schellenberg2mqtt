const Logger = require("./Logger");
const SchellenbergStick = require("./SchellenbergStick");
const MqttClient = require("./MqttClient");

if (process.env.LOGLEVEL) {
    Logger.setLogLevel(process.env.LOGLEVEL);
}

const stick = new SchellenbergStick();
const mqttClient = new MqttClient(stick);

stick.initialize();
mqttClient.initialize();

