function savePatch(){
    let patchName = document.querySelector("#patch-name").value;
    if(!patchName) alert("Insert patch name before saving.");
    let inputs = Array.from(document.querySelectorAll("#synth input"));
    let values = inputs.map(i=>i.value);
    let patches = JSON.parse(localStorage.getItem('patches'));
    if(!patches) patches = [];
    patches.push({"name": patchName, "values": values});
    localStorage.setItem('patches', JSON.stringify(patches));
    updatePatchesList();
}

function loadPatch(){
    let select = document.querySelector("#patch-memory select");
    let values = JSON.parse(select.value);
    let inputs = Array.from(document.querySelectorAll("#synth input"));
    inputs.forEach((input,i)=>{
        input.value = values[i];
        input.dispatchEvent(new Event('change'));
    });
}

function updatePatchesList(){
    let select = document.querySelector("#patch-memory select");
    select.innerHTML = "";
    let patches = JSON.parse(localStorage.getItem('patches'));
    patches.forEach(patch => {
        let option = document.createElement("option");
        option.innerText = patch['name'];
        option.value = JSON.stringify(patch['values']);
        select.appendChild(option);
    });
}

