export default async function run() {
    const streamlabs:typeof import("../../modules/API/webhooks/streamlabs") = require(appData[0] + "/modules/API/webhooks/streamlabs.js");
    streamlabs.requestCode();
}