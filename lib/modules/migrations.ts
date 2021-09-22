// File handles creating/deleting/updating files and folders

function migrate() {
    console.log("Checking for migrations");
    checkForScreenShots();
}

async function checkForScreenShots() {
    try {
        await fs.access(`${appData[1]}/screenshots`);
    } catch(e) {
        console.log("No screenshots found");
        fs.mkdir(`${appData[1]}/screenshots`);
    }
}


export {migrate}