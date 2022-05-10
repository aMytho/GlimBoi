// File holds API requests for the chat action

/**
 * Requests data from an API
 * @param {string} url The API URL
 * @param {array} headers An array of headers to send with the request
 * @param {string} mode "GET" or "POST"
 * @param {string} request POST data if any
 * @param {array} path The path to follow down the JSON tree if any
 * @returns {string} The response from the API
 */
async function ApiRequest({ url, headers, mode, request, path, pathType, body }) {
    // Enssure headers are valid if none were provided
    if (!headers || headers == []) {
        headers = {}
    }

    try {
        let response:Response;
        if (mode == "GET") {
            response = await fetch(url, { method: "GET", headers: headers });
        } else {
            if (!body) {
                response = await fetch(url, { method: mode, headers: headers });
            } else {
                response = await fetch(url, { method: mode, headers: headers, body: body.replace(/\s+/g, '').trim() });
            }
            console.log(response.status, response.statusText, response.type);
            console.log(response.body, headers, mode, );
        }

        // Handle text response
        if (pathType == "text") {
            const result = await response.text();
            CommandHandle.ChatAction.ActionResources.addVariable({ name: path[0].variable, data: result });
            return
        }

        // Handle JSON response
        const result = await response.json();
        console.log(result);
        for (let i = 0; i < path.length; i++) {
            function findVal(object, key) {
                var value;
                Object.keys(object).some(function (k) {
                    if (k === key) {
                        value = object[k];
                        return true;
                    }
                    if (object[k] && typeof object[k] === 'object') {
                        value = findVal(object[k], key);
                        return value !== undefined;
                    }
                });
                return value;
            }
            CommandHandle.ChatAction.ActionResources.addVariable({ name: path[i].variable, data: findVal(result, path[i].data) });
        }
    } catch (e) {
        console.log(e);
        console.log(url, headers, mode, request, path, pathType, body);
    }
}

export default ApiRequest;
export { ApiRequest };