// File contains functions for OAuth authentication

/**
 * Generates a code verifier and challenge for auth.
 */
export default async function generateVerifierAndChallenge(): Promise<PKCEInfo> {
    let array = new Uint32Array(56 / 2);
    window.crypto.getRandomValues(array);
    let verifier = Array.from(array, dec2hex).join('');

    let hashed = await sha256(verifier);
    let challenge = base64urlencode(hashed);
    return { verifier: verifier, challenge: challenge };

    function dec2hex(dec) {
        return ('0' + dec.toString(16)).substr(-2)
    }

    function sha256(plain: string) { // returns promise ArrayBuffer
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
 * Generates a random string with a specified length.
 * @param length Length of the string to generate
 */
function generateRandomString(length: number): string {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export { generateRandomString, generateVerifierAndChallenge };