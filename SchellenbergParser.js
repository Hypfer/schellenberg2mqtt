const SchellenbergRemoteMessage = require('./SchellenbergRemoteMessage');

class SchellenbergParser {
    /**
     * 
     * @param {Buffer} buf
     * @return {SchellenbergRemoteMessage|null}
     * @constructor
     */
    static PARSE(buf) {
        if (!(buf[0] === 0x73 && buf[1] === 0x73 && buf.length === 22)) {
            return null; // The messages we're looking for always start with "ss" and are 22 byte long
        }
        const bufStr = buf.toString("utf-8");
        
        return new SchellenbergRemoteMessage({
            target: parseInt(bufStr.substring(2,4), 16),
            deviceId: bufStr.substring(4,10),
            command: parseInt(bufStr.substring(10,12), 16),
            messageId: parseInt(bufStr.substring(12, 16), 16),
            repeatCounter: parseInt(bufStr.substring(16,18), 16),
            signalStrength: parseInt(bufStr.substring(18,20), 16),
        })
    }
}

module.exports = SchellenbergParser;