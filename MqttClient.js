const Logger = require("./Logger");
const mqtt = require("mqtt");
const SchellenbergRemoteMessage = require("./SchellenbergRemoteMessage");


class MqttClient {
    /**
     *
     * @param {import("./SchellenbergStick")} stick
     */
    constructor(stick) {
        this.stick = stick;

        this.autoconfTimestamps = {};

        this.stick.onKeypress((data) => {
            this.handleKeypress(data);
        });
    }

    initialize() {
        const options = {
            clientId: `schellenberg2mqtt_${Math.random().toString(16).slice(2, 9)}`,  // 23 characters allowed
        };

        if (process.env.MQTT_USERNAME) {
            options.username = process.env.MQTT_USERNAME;

            if (process.env.MQTT_PASSWORD) {
                options.password = process.env.MQTT_PASSWORD;
            }
        } else if (process.env.MQTT_PASSWORD) {
            // MQTT_PASSWORD is set but MQTT_USERNAME is not
            Logger.error("MQTT_PASSWORD is set but MQTT_USERNAME is not. MQTT_USERNAME must be set if MQTT_PASSWORD is set.");
            process.exit(1);
        }

        this.client = mqtt.connect(process.env.MQTT_BROKER_URL, options);

        this.client.on("connect", () => {
            Logger.info("Connected to MQTT broker");
        });

        this.client.on("error", (e) => {
            if (e && e.message === "Not supported") {
                Logger.info("Connected to non-standard-compliant MQTT Broker.");
            } else {
                Logger.error("MQTT error:", e.toString());
            }
        });

        this.client.on("reconnect", () => {
            Logger.info("Attempting to reconnect to MQTT broker");
        });
    }

    /**
     * 
     * @param {SchellenbergRemoteMessage} data
     */
    handleKeypress(data) {
        this.ensureAutoconf(data.deviceId);

        const baseTopic = `${MqttClient.TOPIC_PREFIX}/${data.deviceId}`;
        
        this.client.publish(`${baseTopic}/event`, JSON.stringify({
            event_type: data.command,
            target: data.target,
            messageId: data.messageId,
            signalStrength: data.signalStrength,
        }));
    }

    ensureAutoconf(deviceId) {
        // (Re-)publish every 4 hours
        if (Date.now() - (this.autoconfTimestamps[deviceId] ?? 0) <= 4 * 60 * 60 * 1000) {
            return;
        }
        Logger.info(`Publishing autoconf data for ${deviceId}`)
        
        const device = {
            "manufacturer":"Schellenberg",
            "model":"Remote Control",
            "name":`Schellenberg Remote ${deviceId}`,
            "identifiers":[
                `schellenberg2mqtt_${deviceId}`
            ]
        };

        this.client.publish(
            `homeassistant/event/schellenberg2mqtt/${deviceId}/config`,
            JSON.stringify({
                "state_topic": `${MqttClient.TOPIC_PREFIX}/${deviceId}/event`,
                "device": device,
                "device_class": "button",
                "event_types": Object.values(SchellenbergRemoteMessage.COMMANDS),
                "icon": "mdi:remote",
                "name": `Button Events`,
                "object_id": `schellenberg2mqtt_${deviceId}_buttons`,
                "unique_id": `schellenberg2mqtt_${deviceId}_buttons`,
            }),
            {retain: true}
        );

        this.autoconfTimestamps[deviceId] = Date.now();
    }
}

MqttClient.TOPIC_PREFIX = "schellenberg2mqtt";

module.exports = MqttClient;
