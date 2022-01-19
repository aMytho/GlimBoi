/**
 * Triggers a Streamlabs alert
 */
async function triggerAlert(message: string, token: string) {
    try {
        let querystring = {
            access_token: token,
            type: "follow",
            message: message,
            user_message: ""
        }
        let response = await fetch("https://www.streamlabs.com/api/v1.0/alerts", {
            method: 'POST',
            body: JSON.stringify(querystring),
            headers: { 'Content-Type': 'application/json' }
        });
        let data = await response.json();
        console.log(data);
    } catch (e) {
        console.log(e);
    }
}

export {triggerAlert}