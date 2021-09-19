// file handles websocket connections

const OBSWebSocket: typeof import("../API/websockets/OBS") = require(`${appData[0]}/modules/API/websockets/OBS.js`);

export {OBSWebSocket}