/**
 * Returns a random joke 
 */
async function getDadJoke():Promise<string> {
    try {
        let response = await fetch("https://icanhazdadjoke.com/", { method: "GET", headers: { 'User-Agent': `https://github.com/aMytho/GlimBoi Look at the readme file for contact info`, Accept: "application/json" } });
        let dadJoke = await response.json();
        console.log("Completed joke request" + dadJoke);
        return dadJoke.joke
    } catch (e) {
        return "Joke Failed :glimsad:"
    }
}

export {getDadJoke}