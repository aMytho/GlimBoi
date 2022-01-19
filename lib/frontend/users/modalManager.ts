// helps with user modals

async function loadUserModal(user: UserType) {
    let container = document.createElement("div");
    container.classList.add("modal-dialog");
    let file = await fs.readFile(dirName + `/html/users/user.html`)
    container.innerHTML = file.toString();
    let select = document.createElement("select")
    select.id = "userEditRankChoice"
    let options = await RankHandle.getAll();
    for (let i = 0; i < options.length; i++) {
        let opt = options[i].rank;
        if (user.role == opt) {
            select.innerHTML += "<option value=\"" + opt + "\" selected>" + opt + " (current)" + "</option>";
        } else {
            select.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
        }
    }
    container.firstElementChild.children[1].firstElementChild.children[1].firstElementChild.children[1].firstElementChild.children[1].appendChild(select);
    container.firstElementChild.children[1].firstElementChild.children[1].firstElementChild.children[1].children[1].children[1].innerHTML = String(user.points);
    container.firstElementChild.children[1].firstElementChild.children[1].firstElementChild.children[1].children[2].children[1].innerHTML = String(user.watchTime);
    document.getElementById("modalUserEditing").appendChild(container);
    document.getElementById("saveUserSettings").onclick = function () {
        validateUserInfo(user.userName);
    };
}

function validateUserInfo(user: string) {
    let userPoints = Number(strip(document.getElementById("editUserPoints")!.innerHTML));
    let userWatchTime = Number(strip(document.getElementById("editUserWatchTime")!.innerHTML));
    if (userPoints < 0 || userWatchTime < 0) {
        errorMessage("Invalid Points or Watch Time", "You cannot have a negative number of points or watch time.");
        return
    } else if (isNaN(userPoints) || isNaN(userWatchTime)) {
        errorMessage("Invalid Points or Watch Time", "You must enter a number for points and watch time.");
        return
    } else {
        UserHandle.editUser(user, userPoints, (document.getElementById("userEditRankChoice") as HTMLInputElement).value, userWatchTime);
        $("#modalUserEditing").modal("hide");
    }
}

export {loadUserModal}