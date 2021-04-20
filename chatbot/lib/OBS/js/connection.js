// Connects to the glimboi server. we send http requests back and forth to know when to play videos/sounds

function connect() {
    let connection = new WebSocket("ws://localhost:8080");

    connection.onopen = function (event) {
        console.log("connected to glimboi server");
    }


    connection.onmessage = function (event) {
        try {
            console.log(event.data);
            let message = JSON.parse(event.data)
            if (message.action !== undefined) {
                if (message.action == "soundEffect") {
                    console.log("Playing sound effect");
                    let sfx = new Audio(message.data.path);
                    sfx.play();
                    sfx.addEventListener("ended", (event) => {
                        sfx.remove()
                        connection.send(JSON.stringify({ status: "ok", actionCompleted: "soundEffect", file: message.data.path }))
                    })
                } else if (message.action == "imageGif") {
                    console.log("Displaying Image");
                    let newImage = document.createElement("img");
                    newImage.src = message.data.path;
                    document.getElementById(message.data.position).appendChild(newImage);
                    setTimeout(() => {
                        newImage.remove();
                        connection.send(JSON.stringify({ status: "ok", actionCompleted: "imageGif", file: message.data.path }))
                    }, 7777);
                } else if (message.action == "video") {
                    console.log("Displaying Video");
                    let newVid = document.createElement("video");
                    newVid.src = message.data.path;
                    document.getElementById(message.data.position).appendChild(newVid);
                    newVid.play()
                    newVid.addEventListener("ended", (event) => {
                        newVid.remove();
                        connection.send(JSON.stringify({ status: "ok", actionCompleted: "video", file: message.data.path }))
                    })
                }
            }
        } catch (e) {
            try {
                connection.send(JSON.stringify({ status: "error", actionCompleted: "none", errorType: String(error) }))
            } catch (f) {
                console.log(f)
            }
        }
    }

    connection.onclose = function (event) {
        console.log("disconnected from the server");
        setTimeout(() => {
            console.log("Attempting to reconnect")
            connect()
        }, 5000);
    }
}


connect()