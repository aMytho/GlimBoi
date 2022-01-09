// File handles all twitter interactions

const ClientID = "blZ6STNHZlhqQUdGcF9aZ3dQNmc6MTpjaQ";
const RedirectURL = "http://localhost:5000/success";
const Scopes = "tweet.write tweet.read users.read offline.access";
let serverActive = false;

/**
* Sends a tweet to twitter. Default message is used if none is provided.
*/
async function sendTweet(message?: string) {
    let accessToken = CacheStore.get("twitterAccessToken", true);
    if (accessToken) {
        // Token exists. Check if it needs to be refreshed
        let lastRefresh = CacheStore.get("twitterLastRefresh", 0);
        let currentTime = new Date();
        console.log(currentTime.getTime() - lastRefresh);
        // Check if the difference is greater than 2 hours
        if (currentTime.getTime() - lastRefresh >= 7200000) {
            // Refresh the token
            console.log("Refreshing Twitter token");
            accessToken = await requestRefreshToken();
            if (!accessToken) return false
        }

        // Token is valid. Send the tweet
        if (!message) {
            message = CacheStore.get("twitterMessage", "");
        }
        // Replace $streamer with the streamer name using regex
        message = message.replace(/\$streamer/g, ApiHandle.getStreamerName());

        let twitterRequest = await fetch("https://api.twitter.com/2/tweets", {
            method: "POST",
            headers: [
                ["Authorization", `Bearer ${accessToken}`],
                ["Content-Type", `application/json`]
            ],
            body: JSON.stringify({
                text: message,
            })
        })

        console.log(twitterRequest);
        if (twitterRequest.status == 200) {
            console.log("Twitter request sent successfully");
        } else {
            console.log("Twitter request failed", twitterRequest);
            errorMessage("Twitter Error", "Twitter request failed. Ensure you have entered a valid token.");
        }
    } else {
        errorMessage("Twitter Error", "No twitter token was found. Add it on the integrations page!");
    }
}

/**
 * Gets an access token from twitter.
 */
async function requestUserAuthorization(): Promise<boolean> {
    const OauthLib: typeof import("../../auth/oauth") = require(appData[0] + "/modules/auth/oauth.js");
    const { challenge, verifier } = await OauthLib.generateVerifierAndChallenge();
    const URL = `twitter.com/i/oauth2/authorize?response_type=code&client_id=${ClientID}&redirect_uri=${RedirectURL}&scope=${Scopes}&state=${OauthLib.generateRandomString(5)}&code_challenge=${challenge}&code_challenge_method=s256`;

    return new Promise((resolve, reject) => {
        // Check that a server is not already running
        if (serverActive) {
            errorMessage("Twitter Error", "The Twitter Oauth sever is already running.");
            resolve(false);
            return;
        }
        // Creates a server for twitter to callback to
        const http:typeof import("http") = require('http');
        let server = http.createServer(async (req, res) => {
            console.log("Received callback from twitter");
            // When we get a response we parse the url and search for the code
            let regex = /code=([^&]*)/;
            let code = regex.exec(req.url);
            console.log(code, req.url);
            // If it exists we request a token
            if (code && code[0]) {
                code[0] = code[0].replace("code=", ""); // Removes the code= from the url

                // Respond to the user
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end("Twitter OAuth successful! You can close this tab now.");
                server.close();
                clearTimeout(timeout);

                // Request the token, parse the response
                let response = await fetch(`https://api.twitter.com/2/oauth2/token`, {
                    body: new URLSearchParams({
                        code: code[0],
                        grant_type: "authorization_code",
                        client_id: ClientID,
                        redirect_uri: RedirectURL,
                        code_verifier: verifier
                    }),
                    headers: [
                        ["Content-Type", "application/x-www-form-urlencoded"],
                    ],
                    method: "POST",
                });
                let json = await response.json();
                console.log(json);

                // Save the tokens
                CacheStore.setMultiple([
                    {twitterAccessToken: json.access_token},
                    {twitterRefreshToken: json.refresh_token},
                    {twitterLastRefresh: new Date().getTime()}
                ]);
                successMessage("Twitter Integration Complete", "You can now use Twitter features.");
                resolve(true);
            } else if (req.url.includes("denied")) {
                console.log("Twitter OAuth failed");
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end("Twitter OAuth denied. You have to approve the permissions to use twitter integration.");
                server.close();
                serverActive = false;
                clearTimeout(timeout);
                resolve(false);
            }
        });
        server.listen(5000);
        serverActive = true;
        // Direct the user to twitter to authenticate
        loadLink(URL);
        let timeout = setTimeout(() => {
            server.close();
            serverActive = false;
            errorMessage("Twitter Error", "The Twitter OAuth process timed out. Please try again.");
            resolve(false);
        }, 420000);
    });
}

/**
 * Refreshes the access token if it exists.
 */
async function requestRefreshToken(): Promise<boolean | null> {
    let refreshToken = CacheStore.get("twitterRefreshToken", "");
    if (refreshToken) {
        let refreshRequest = await fetch("https://api.twitter.com/2/oauth/token", {
            method: "POST",
            headers: [
                ["Content-Type", `application/x-www-form-urlencoded`]
            ],
            body: new URLSearchParams({
                refresh_token: refreshToken,
                grant_type: "refresh_token",
                client_id: ClientID,
            })
        });

        let json = await refreshRequest.json();
        console.log(json);

        CacheStore.setMultiple([
            {twitterAccessToken: json.access_token},
            {twitterRefreshToken: json.refresh_token},
            {twitterLastRefresh: new Date().getTime()}
        ]);
        console.log("Refreshed Twitter token");
        return json.access_token;
    }
    return null;
}

export { requestRefreshToken, requestUserAuthorization, sendTweet }