/**
* Sends a tweet to twitter. Default message is used if none is provided.
*/
function sendTweet(message?: string): void {
    let accessToken = CacheStore.get("twitterToken", true, false);
    if (accessToken) {
        if (!message) {
            message = CacheStore.get("twitterMessage", "Test tweet from Glimboi. If you see this then twitter integration is almost complete! Happy New Year!");
        }
        // Replace streamer var
        // some regex, add later

        let twitterRequest = fetch("https://api.twitter.com/2/tweets", {
            method: "POST",
            headers: [
                ["Authorization", `OAuth`]
            ],
            body: JSON.stringify({
                text: message 
            })
        })

        twitterRequest.then(response => {
            console.log("Twitter request sent successfully");
        });

    } else {
        errorMessage("Twitter Error", "No twitter token was found. Add it on the integrations page!")
    }
}

export {sendTweet}