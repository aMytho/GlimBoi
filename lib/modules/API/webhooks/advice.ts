/**
 * Returns random advice
 */
async function getAdvice(): Promise<string> {
    try {
        let response = await fetch("https://api.adviceslip.com/advice", { method: "GET" });
        let advice = await response.json();
        console.log("Completed advice request " + advice.slip.advice + advice.slip.id);
        return advice.slip.advice
    } catch (e) {
        return "Advice Failed"
    }
}

export {getAdvice}