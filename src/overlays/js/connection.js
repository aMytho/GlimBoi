let url = `ws://localhost:3000`
function connect() {
    let connection = new WebSocket(url);

    connection.onopen = function (event) {
        console.log("connected to glimboi server");
    }


    connection.onmessage = function (event) {
        let mediaContainer = document.getElementById("mediaContainer");
        try {
            let message = JSON.parse(event.data);
            console.log(message);
            if (message.action !== undefined) {
                if (message.action == "soundEffect") {
                    console.log("Playing sound effect");

                    let sfx = new Audio(message.data.path);

                    sfx.volume = message.data.volume / 10;
                    sfx.playbackRate = message.data.speed;

                    if (message.data.duration !== undefined) {
                        console.log("Setting duration");
                        setTimeout(() => {
                            sfx.pause();
                            sfx.currentTime = 0;
                            sfx.dispatchEvent(new Event("ended"));
                        }, message.data.duration * 1000)
                    }
                    sfx.addEventListener("ended", (event) => {
                        sfx.remove()
                        connection.send(JSON.stringify({ status: "ok", actionCompleted: "soundEffect", file: message.data.path }))
                    })

                    mediaContainer.appendChild(sfx);
                    sfx.play();
                } else if (message.action == "imageGif") {
                    console.log("Displaying Image");

                    let newImage = document.createElement("img");
                    newImage.src = message.data.path;

                    if (message.data.height !== 0) {
                        newImage.style.height = `${message.data.height}px`
                    }

                    if (message.data.width !== 0) {
                        newImage.style.width = `${message.data.width}px`
                    }

                    if (message.data.center) {
                        newImage.style.position = "absolute"
                        newImage.style.left = `50%`;
                        newImage.style.top = `50%`;
                        newImage.style.transform = `translate(-50%, -50%)`;
                    } else {
                        newImage.style.position = "absolute";
                        newImage.style.left = `${message.data.coordinates[0]}px`;
                        newImage.style.top = `${message.data.coordinates[1]}px`;
                    }

                    if (message.data.duration !== undefined) {
                        setTimeout(() => {
                            newImage.remove();
                            connection.send(JSON.stringify({ status: "ok", actionCompleted: "imageGif", file: message.data.path }))
                        }, message.data.duration * 1000)
                    } else {
                        setTimeout(() => {
                            newImage.remove();
                            connection.send(JSON.stringify({ status: "ok", actionCompleted: "imageGif", file: message.data.path }))
                        }, 7000);
                    }

                    mediaContainer.appendChild(newImage);
                } else if (message.action == "video") {
                    console.log("Displaying Video");

                    let newVid = document.createElement("video");
                    newVid.src = message.data.path;

                    if (message.data.height !== 0) {
                        newVid.style.height = `${message.data.height}px`
                    }

                    if (message.data.width !== 0) {
                        newVid.style.width = `${message.data.width}px`
                    }

                    if (message.data.center) {
                        newImage.style.position = "absolute"
                        newImage.style.left = `50%`;
                        newImage.style.top = `50%`;
                        newImage.style.transform = `translate(-50%, -50%)`;
                    } else {
                        newImage.style.position = "absolute";
                        newImage.style.left = `${message.data.coordinates[0]}px`;
                        newImage.style.top = `${message.data.coordinates[1]}px`;
                    }

                    newVid.playbackRate = message.data.speed;

                    if (message.data.duration !== undefined && message.data.duration !== 0) {
                        setTimeout(() => {
                            newVid.pause();
                            newVid.currentTime = 0;
                            newVid.dispatchEvent(new Event("ended"));
                        }, message.data.duration * 1000);
                    }

                    newVid.addEventListener("ended", (event) => {
                        newVid.remove();
                        connection.send(JSON.stringify({ status: "ok", actionCompleted: "video", file: message.data.path }))
                    })
                    mediaContainer.appendChild(newVid);
                    newVid.play();
                }
            }
        } catch (e) {
            console.log(e)
            try {
                connection.send(JSON.stringify({ status: "error", actionCompleted: "none", errorType: String(error) }))
            } catch (f) {
                console.log(f)
            }
        }
    }

    connection.onclose = function (event) {
        console.log("disconnected from glimboi");
        setTimeout(() => {
            console.log("Attempting to reconnect")
            connect()
        }, 5000);
    }

    connection.onerror = function (event) {
        console.log("error", event);
    }
}


connect()