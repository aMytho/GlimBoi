/**
 * Returns a random animal fact.
 */
export async function randomAnimalFact(animal: "dog" | "cat") {
    try {
        let animalFactData = await fetch(`https://some-random-api.ml/animal/${animal}`, { method: "GET" })
        let animalFact = await animalFactData.json();
        return animalFact.fact
    } catch(e) {
        return null
    }
}