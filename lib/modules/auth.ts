//This file handles connecting the users dev app to glimesh.tv
const CLIENT_ID = "468920e4-d88f-46ee-bbf6-94bed88d8872";
const REDIRECT_URL = "http://localhost:3000";
const SCOPES = "chat public";
let accessToken:accessToken = "";
let hasAuthed = false;

/**
 * Requests a refresh token
 */
async function requestToken(alertUser = false): Promise<accessToken | false> {
    return new Promise(async resolve => {
        let refreshToken = await getRefreshToken();
        console.log("Refresh token: " + refreshToken);
        if (!refreshToken) {
            errorMessage("Auth Error", "Please authorize the bot first.");
        }

        let tokenBody = {
            token: refreshToken,
            client: CLIENT_ID,
        };
        let res = await fetch(`https://calm-citadel-14699.herokuapp.com/token`, {
            method: "POST",
            body: new URLSearchParams(tokenBody),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        let data = await res.json();
        console.log(data);
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



async function generateVerifierAndChallenge() {
    let array = new Uint32Array(56 / 2);
    window.crypto.getRandomValues(array);
    let verifier =  Array.from(array, dec2hex).join('');

    let hashed = await sha256(verifier);
    let challenge = base64urlencode(hashed);
    return {verifier: verifier, challenge: challenge};

    function dec2hex(dec) {
        return ('0' + dec.toString(16)).substr(-2)
    }


    function sha256(plain) { // returns promise ArrayBuffer
        const encoder = new TextEncoder();
        const data = encoder.encode(plain);
        return window.crypto.subtle.digest('SHA-256', data);
    }

    function base64urlencode(a) {
        let str = "";
        let bytes = new Uint8Array(a);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            str += String.fromCharCode(bytes[i]);
        }
        return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }
}


/**
 * Returns the access token.
 */
function getToken(): accessToken {
    return accessToken
}

async function getRefreshToken() {
    try {
        let data = await fs.readFile(`${appData[1]}/data/refresh.txt`, {encoding: "utf8"});
        return data;
    } catch (e) {
        return "";
    }
}

function setRefreshToken(token:string) {
    fs.writeFile(`${appData[1]}/data/refresh.txt`, token, {encoding: "utf8", flag: "w"});
}


export {getRefreshToken, getToken, requestToken, requestUserAuthorization };