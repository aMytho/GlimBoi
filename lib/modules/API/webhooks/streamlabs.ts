/**
 * Triggers a Streamlabs alert
 */
async function triggerAlert(message: string, token: string) {
    try {
        let response = await fetch("https://streamlabs.com/api/v1.0/alerts", {
            method: 'POST',
            body: new URLSearchParams({
                "access token": token,
                type: "follow",
                message: message,
            }),
        });
        console.log(response.status, response.statusText);
        response.json();
        return;
    } catch (e) {
        console.log(e);
    }
}

async function requestToken(code:string) {
    let clientId = CacheStore.get("streamlabsClientId", "");
    let clientSecret = CacheStore.get("streamlabsClientSecret", "");
    if (clientId == "" || clientSecret == "") {
        errorMessage("Streamlabs Error",
        "Please set your Streamlabs Client ID and Client Secret in Integrations to use Streamlabs Alerts");
        return "";
    }
    let result = await fetch(`https://streamlabs.com/api/v1.0/token`, {
        method: 'POST',
        body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
            redirect_uri: "http://localhost:3000/"
        })
    });
    let data = await result.json();
    if (data.access_token) {
        CacheStore.set("streamlabsToken", data.access_token);
        showToast("Streamlabs Token Updated. Integration Complete!");
        return data.access_token;
    } else {
        showToast("Error updating Streamlabs token. Ensure the information was saved and entered correctly.");
        return "";
    }
}

async function requestCode(): Promise<boolean> {
    let clientId = CacheStore.get("streamlabsClientId", "");
    let clientSecret = CacheStore.get("streamlabsClientSecret", "");
    if (!clientId || !clientSecret) {
        errorMessage("Streamlabs Error",
        "Please set your Streamlabs Client ID and Client Secret in Integrations to use Streamlabs Alerts");
        return false;
    }
    const AuthInfo = `client_id=${clientId}&redirect_uri=http://localhost:3000/&response_type=code&scope=alerts.create+alerts.write`;
    loadLink(`streamlabs.com/api/v1.0/authorize?${AuthInfo}`);

    const http:typeof import("http") = require('http');
    return new Promise(resolve => {
        let server = http.createServer(async function (req, res) {
            const url = require('url');
            const queryObject: { code?: string } = url.parse(req.url, true).query;

            console.log(queryObject);
            if (queryObject.code) {
                res.end("<h1>You can now close this window</h1>");
                server.close();
                await requestToken(queryObject.code);
                resolve(true);
                return;
            }
            res.end("<h1>Auth Error</h1");
            res.writeHead(200, { 'Content-Type': 'text/html'});
            resolve(false);
        })
        server.listen(3000);
    })
}

export {requestCode, requestToken, triggerAlert}