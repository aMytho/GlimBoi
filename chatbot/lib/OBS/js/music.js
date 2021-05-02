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
                if (message.action == "newSong") {
                    console.log("Showing new song");
                    document.getElementById("songOverlay").style.opacity = 1.0
                    document.getElementById("songTitle").innerText = message.data.name;
                    if (message.data.artists) {
                        document.getElementById("songAuthor").innerText = message.data.artists
                    } else {
                        document.getElementById("songAuthor").innerText = ""
                    }
                    setTimeout(() => {
                        document.getElementById("songOverlay").style.opacity = 0
                        connection.send(JSON.stringify({ status: "ok", actionCompleted: "newSong", songName: message.data.name }))
                    }, 7777);
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