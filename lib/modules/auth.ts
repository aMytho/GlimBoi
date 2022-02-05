//This file handles connecting the users dev app to glimesh.tv
const CLIENT_ID = "468920e4-d88f-46ee-bbf6-94bed88d8872";
const REDIRECT_URL = "http://localhost:3000";
const SCOPES = "chat public follow";
let accessToken:accessToken = "";
let hasAuthed = false;

/**
 * Requests a refresh token
 */
async function requestToken(alertUser = false): Promise<accessToken | false> {
    return new Promise(async resolve => {
        let refreshToken = await getRefreshToken();
        if (!refreshToken) {
            errorMessage("Auth Error", "Please authorize the bot first.");
            resolve(false);
        }

        let tokenBody = {
            grant_type: "refresh_token",
            client_id: CLIENT_ID,
            refresh_token: refreshToken,
            redirect_url: REDIRECT_URL,
        };
        let res = await fetch(`https://glimesh.tv/api/oauth/token`, {
            method: "POST",
            body: new URLSearchParams(tokenBody),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        let data = await res.json();
        try {
            if (data.access_token == undefined) {
                errorMessage("Auth Error", "Please ensure the correct information is entered for authentication.");
                return;
            }
            console.log("Access token recieved and added to the database. Ready to join chat!");
            hasAuthed = true;
            accessToken = data.access_token;
            setRefreshToken(data.refresh_token);
            if (alertUser) {
                successMessage("Authorized", "Token Recieved. You can now join chat!");
            }
            resolve(data.access_token);
        } catch (e) {
            console.log(e);
            errorMessage(e, "Auth Error");
            resolve(false);
        }
    });
}


/**
 * Starts the authorization process.
 */
async function requestUserAuthorization() {
    console.log("Starting authorization client server");
    const {generateVerifierAndChallenge}:typeof import("./auth/oauth") = require(appData[0] + "/modules/auth/oauth.js")
    let { verifier, challenge } = await generateVerifierAndChallenge();
    loadLink(`glimesh.tv/oauth/authorize?response_type=code&code_challenge=${challenge}&code_challenge_method=S256&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL}&scope=${SCOPES}`);

    const http:typeof import("http") = require('http');

    let server = http.createServer(async function (req, res) {
        const url = require('url');
        const queryObject: { code?: string } = url.parse(req.url, true).query;

        console.log(queryObject);
        if (queryObject.code) {
            res.end("<h1>You can now close this window</h1>");
            let tokenRequestBody = {
                code_verifier: verifier,
                client_id: CLIENT_ID,
                code: queryObject.code,
                grant_type: "authorization_code",
                redirect_uri: REDIRECT_URL,
                scope: SCOPES
            };

            let tokenResponse = await fetch(`https://glimesh.tv/api/oauth/token`,{
                method: "POST",
                body: new URLSearchParams(tokenRequestBody),
                });
            let data = await tokenResponse.json();

            if (data.access_token && data.refresh_token) {
                console.log("Access token recieved and added to the database. Ready to join chat!");
                accessToken = data.access_token;
                setRefreshToken(data.refresh_token);
                unlockBot();
                server.close();
                hasAuthorized = true;
                successMessage("Authorized", "Token Recieved. You can now join chat! You can authorize as another acount at any time.");
                return data.access_token
            } else {
                errorMessage("Auth Error", "Please ensure the correct information is entered for authentication.");
                return;
            }
        }
        res.end("<h1>Auth Error</h1");
        res.writeHead(200, { 'Content-Type': 'text/html'});
    })
    server.listen(3000);
}


/**
 * Returns the access token.
 */
function getToken(): accessToken {
    return accessToken;
}

/**
 * Returns the refresh token if it exists. If not returns ""
 * @returns
 */
async function getRefreshToken() {
    try {
        let data = await fs.readFile(`${appData[1]}/data/refresh.txt`, {encoding: "utf8"});
        return data;
    } catch (e) {
        return "";
    }
}

/**
 * Sets a new refresh token
 * @param token The token to set
 */
function setRefreshToken(token:string) {
    fs.writeFile(`${appData[1]}/data/refresh.txt`, token, {encoding: "utf8", flag: "w"});
}

/**
 * Returns the client ID
 * @returns {string} The client ID
 */
function getClientID(): string {
    return CLIENT_ID;
}

export {getClientID, getRefreshToken, getToken, requestToken, requestUserAuthorization };