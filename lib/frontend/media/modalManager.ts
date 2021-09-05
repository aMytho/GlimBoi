
async function loadAddModal() {
    let data = await fs.readFile(dirName + `/html/media/addMedia.html`);
    document.getElementById(`mediaContent`)!.innerHTML = data.toString();

}




export {loadAddModal}