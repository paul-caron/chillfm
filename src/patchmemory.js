function deletePatch(){
    let select = document.querySelector("#patch-memory select");
    let name = select.options[select.selectedIndex].text
    if(!name) return;



    let patches = JSON.parse(localStorage.getItem('patches'));
    if(!patches)
        patches = [];
    patches = patches.filter(p=>p.name!==name);
    localStorage.setItem('patches', JSON.stringify(patches));
    updatePatchesList();
}

function savePatch(){
    let patchName = document.querySelector("#patch-name").value;
    if(!patchName){
        alert("Insert patch name before saving.");
        return;
    }
    let rangeInputs = Array.from(document.querySelectorAll("#settings input[type=range]"));
    let rangeValues = rangeInputs.map(i=>i.value);
    let selectInputs = Array.from(document.querySelectorAll("#settings select"));
    let selectValues = selectInputs.map(i=>i.value);
    let checkboxInputs = Array.from(document.querySelectorAll("#settings input[type=checkbox]"));
    let checkboxValues = checkboxInputs.map(i=>i.checked);

    let patches = JSON.parse(localStorage.getItem('patches'));
    if(!patches)
        patches = [];
    patches.push({"name": patchName, "settings": {"range":rangeValues, "select": selectValues, "checkbox": checkboxValues},});
    localStorage.setItem('patches', JSON.stringify(patches));
    updatePatchesList();
}

function loadPatch(){
    let patch = document.querySelector("#patch-memory select");
    let settings = JSON.parse(patch.value);
    let {range, select, checkbox} = settings;

    let rangeInputs = Array.from(document.querySelectorAll("#settings input[type=range]"));
    rangeInputs.forEach((r,i)=>{
        r.value = range[i];
        r.dispatchEvent(new Event('change'));
    });

    let selectInputs = Array.from(document.querySelectorAll("#settings select"));
    selectInputs.forEach((s,i)=>{
        s.value = select[i];
        s.dispatchEvent(new Event('change'));
    });

    let checkboxInputs = Array.from(document.querySelectorAll("#settings input[type=checkbox]"));
    checkboxInputs.forEach((c,i)=>{
        c.checked = checkbox[i];
        c.dispatchEvent(new Event('change'));
    });

}

function updatePatchesList(){
    let select = document.querySelector("#patch-memory select");
    select.innerHTML = "";
    let patches = JSON.parse(localStorage.getItem('patches'));
    if(patches){
        patches.forEach(patch => {
            let option = document.createElement("option");
            option.innerText = patch['name'];
            option.value = JSON.stringify(patch['settings']);
            select.appendChild(option);
        });
    }
}

