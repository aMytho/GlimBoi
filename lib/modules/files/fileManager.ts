
async function writeDataToFile(file: string, data: string) {
    console.log(file, data)
    try {
        await fs.writeFile(file, data);
    } catch (error) {
        console.log(error);
    }
    console.log("done");
}

/**
 * Reads a file.
 * @returns
 */
async function readDataFromFile(file: string) {
    let data: string;
    try {
        data = await fs.readFile(file, "utf8");
    } catch (error) {
        console.log(error);
        data = "Error"
    }
    return data;
}

export { readDataFromFile, writeDataToFile }