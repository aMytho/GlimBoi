const fs = require("fs");

fs.copyFile("./lib/frontend/bootstrap/bootstrap.min.js",
    "./build/frontend/bootstrap/bootstrap.min.js", (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Frontend Dependencies copied.");
        }
    })