let presetPatches = [{"name":"brassySound","settings":{"range":["0","0.44","0.29","0","0.29","0","0.1","0.1","0.1","0.1","0.4","0.4","0.4","0.4","0.7","0.7","0.7","0.7","2","2","2","2","341","0","0","0","0","324","0","0.01","0"],"select":["0","sine","sine","sine","sine"],"checkbox":[false,false,false,false,false],"number":["1","1","1","1","0","0","0","0"]}},{"name":"meow-animal","settings":{"range":["0","1","0.38","0","0","0","0.1","0.1","0.1","0.1","0.4","0.4","0.4","0.4","0.7","0.7","0.7","0.7","0.85","1.8","2","0.67","0","0","0","446","0","0","621.42","0.01","0"],"select":["2","sine","sine","sine","sine"],"checkbox":[false,false,false,false,false],"number":["1","1","1","1","0","0","0","0"]}},{"name":"organSound","settings":{"range":["0","0.19","0.7","0.53","0.32","0.17","0.01","0.08","0.01","0.03","0.1","0.15","0.4","0.4","0.93","0.88","0.74","0.7","0.46","0.69","0.57","0.73","0","0","0","0","0","0","0","0.01","0"],"select":["0","sine","sine","sine","sine"],"checkbox":[false,false,false,false,false],"number":["1","2","3","5","4","-3","3","-1"]}},{"name":"organSound2","settings":{"range":["0","0.19","0.7","0.53","0.32","0.05","0.07","0.08","0.01","0.03","0.1","0.15","0.4","0.4","1","0.93","0.85","0.7","0.46","0.69","0.57","0.73","0","0","0","0","0","0","0","7.39","179.03"],"select":["0","sine","sine","sine","sine"],"checkbox":[false,false,false,false,true],"number":["1","2","3","5","4","-3","3","-1"]}},{"name":"boopy","settings":{"range":["0","0.19","0.7","0.53","0.32","0","0.01","0.08","0.01","0.03","0.1","0.15","0.4","0.4","0.59","0.48","0.42","0.08","0.46","0.69","0.57","0.73","0","0","0","269","423","446","168.18","0.01","0"],"select":["0","sine","sine","sine","sine"],"checkbox":[false,false,false,false,false],"number":["1","2","5","0.25","3","-3","3","-3"]}},{"name":"springy","settings":{"range":["0","0.19","0.7","0.53","0.32","0","0.01","0.08","0.01","0.03","0.1","0.15","0.4","0.4","0.59","0.48","0.42","0.08","0.46","0.69","0.57","0.73","0","0","0","269","423","446","168.18","5.31","197.16"],"select":["1","sine","sine","sine","square"],"checkbox":[false,true,false,false,false],"number":["1","2","5","0.25","3","-3","3","-3"]}},{"name":"bell","settings":{"range":["0","0.72","0.33","0","0.31","0","0.1","0.1","0.01","0.1","0.4","0.4","0.11","0.26","0.41","0.33","0.01","0.01","1.21","0.87","0.21","0.38","292","0","0","0","0","106","50.33","0.01","0"],"select":["1","sine","sine","sine","square"],"checkbox":[false,false,false,false,false],"number":["0","2","2","8","2","-2","3","-3"]}},{"name":"brassySound2","settings":{"range":["0","0.44","0.29","0","0.29","0","0.1","0.1","0.1","0.1","0.4","0.4","0.4","0.4","0.7","0.7","0.7","0.7","2","2","2","2","341","0","0","0","0","324","23.14","0.01","0"],"select":["0","sine","sine","sine","sine"],"checkbox":[false,false,false,false,false],"number":["1","1","1","1","3","-4","5","-5"]}},{"name":"sync","settings":{"range":["0","1","0.23","0","0","0","0.1","0.1","0.1","0.1","0.4","0.4","0.4","0.4","0.7","0.7","0.7","0.7","2","2","2","2","0","0","0","858","0","0","0","0.01","0"],"select":["0","square","sine","sine","square"],"checkbox":[false,false,false,false,false],"number":["1","1","1","1","0","0","0","0"]}},{"name":"sync2","settings":{"range":["0","1","0.23","0","0","0","0.1","0.1","0.1","0.1","0.4","0.4","0.4","0.4","0.7","0.7","0.7","0.7","2","2","2","2","0","0","0","858","0","0","0","0.01","0"],"select":["0","square","sine","sine","square"],"checkbox":[false,false,false,false,false],"number":["1","1","1","0.25","0","0","0","0"]}}];

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
    let numberInputs = Array.from(document.querySelectorAll("#settings input[type=number]"));
    let numberValues = numberInputs.map(i=>i.value);

    let patches = JSON.parse(localStorage.getItem('patches'));
    if(!patches)
        patches = [];
    patches.push({"name": patchName, "settings": {"range":rangeValues, "select": selectValues, "checkbox": checkboxValues, "number": numberValues,},});
    localStorage.setItem('patches', JSON.stringify(patches));
    updatePatchesList();
}

function loadPatch(){
    let patch = document.querySelector("#patch-memory select");
    let settings = JSON.parse(patch.value);
    let {range, select, checkbox, number} = settings;

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

    let numberInputs = Array.from(document.querySelectorAll("#settings input[type=number]"));
    numberInputs.forEach((c,i)=>{
        c.value = number[i];
        c.dispatchEvent(new Event('change'));
    });

}

function updatePatchesList(){
    let select = document.querySelector("#patch-memory select");
    select.innerHTML = "";
    let patches = [...presetPatches, ...JSON.parse(localStorage.getItem('patches'))];
    // uncomment for getting all patches in a JSON format
    // alert(JSON.stringify(patches));
    if(patches){
        patches.forEach(patch => {
            let option = document.createElement("option");
            option.innerText = patch['name'];
            option.value = JSON.stringify(patch['settings']);
            select.appendChild(option);
        });
    }
}

