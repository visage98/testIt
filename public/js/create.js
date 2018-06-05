$(function () {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();
    if(mm<10){
        mm="0"+mm;
    }
    if(dd<10){
        dd="0"+dd;
    }
    min = yyyy+'-'+mm+'-'+dd;
    $("#end_date").attr("min", min);
});

function calMarks() {
    marks = document.getElementsByClassName('marks');
    total = 0;
    for(var i=0;i<marks.length;i++){
        if(marks[i].value)
            total+=parseInt(marks[i].value);
        else
            marks[i].value = 0;
    }
    $("#max_marks").html(total);
    $("#max_marks_input").val(total);
    $("#passing_marks").prop("max", total);
}

function addOption(event) {
    try{
        e = $(event.target)[0].parentNode.children[8].lastElementChild.id;
    }
    catch (err){
        e=0;
    }
    e = parseInt(e)+1;
    q = $(event.target)[0].parentNode.children[1].id;
    li = document.createElement("li");
    li.setAttribute('id' , e);
    li.innerHTML = `<textarea required type="text" name="${q}_o${e}" rows="1" cols="50" style="width: 80%"></textarea> &nbsp;<input type="checkbox" name="${q}_c${e}"><span class="remove" style="float:right" onclick="removeOption(event)">Remove</span>`;
    $(event.target)[0].parentNode.children[8].appendChild(li);
    $("#alert_"+q).prop("hidden", true);
    $("#"+q+"_length").val(parseInt($("#"+q+"_length").val())+1);
    $("#submit_btn").prop("disabled", false);
}

function removeOption(event) {
    index = parseInt($(event.target)[0].parentNode.id)-1;
    ol = document.getElementById($(event.target)[0].parentNode.parentNode.id);
    q = ol.parentElement.children[1].id;
    for(var i=0;i<ol.childElementCount;i++){
        if(i>index){
            ol.children[i].id = parseInt(ol.children[i].id)-1;
            ol.children[i].children[0].setAttribute('name', q+"_o"+(ol.children[i].id));
            ol.children[i].children[1].setAttribute('name', q+"_c"+(ol.children[i].id));
        }
    }
    ol.removeChild(ol.children[index]);
    $("#"+q+"_length").val(parseInt($("#"+q+"_length").val())-1);
    if(ol.childElementCount==0){
        $("#alert_"+q).prop("hidden", false);
        $("#submit_btn").prop("disabled", true);
    }
}

function addQuestion(event) {
    try{
        prevId = event.target.parentElement.parentElement.previousElementSibling.lastElementChild.firstElementChild.id
        prevId = prevId.substring(prevId.length-1);
        prevId = parseInt(prevId);
    }
    catch (err){
        prevId=0;
    }
    newId = prevId+1;
    ol = event.target.parentElement.parentElement.previousElementSibling;
    li = document.createElement('li');
    li.innerHTML = `
        <div class="row entry" id="question${newId}">
                <div class="col-md-10">
                    <label for="q${newId}">Q${newId} : </label>
                    <textarea required class="question" id="q${newId}" type="text" name="q${newId}" style="width: 100%" rows="4"></textarea>
                    <br>
                    <br>
                    <span class="remove" style="float:right;font-weight: bold" onclick="removeQuestion(event)">Remove Question</span>
                    <br>
                    <button type="button" onclick="addOption(event)">Add Options</button>
                    <hr>
                    <ol class="options" id="options${newId}">
                        <li id="1"><textarea required type="text" name="q${newId}_o1" rows="1" style="width: 80%;"></textarea> &nbsp;<input type="checkbox" name="q${newId}_c1"><span class="remove" style="float:right;" onclick="removeOption(event)">Remove</span></li>
                    </ol>
                    <h5 style="color: red;font-weight: 900" id="alert_q${newId}" hidden>Please Add Options!</h5>
                    <input type="hidden" id="q${newId}_length" name="q${newId}_length" value="1">
                </div>
                <div class="col-md-2">
                    <label for="m${newId}">Marks : </label>
                    <input required id="m${newId}" type="number" name="m${newId}" style="width: 100%" value="0" min="0" class="marks" onchange="calMarks()">
                </div>
            </div>
            <hr>
    `;
    ol.appendChild(li);
    $("#submit_btn").prop('disabled', false);
    $("#length").val(parseInt($("#length").val())+1);
}

function removeQuestion() {
    prevId = event.target.parentNode.parentNode.id;
    prevId = prevId.substring(prevId.length-1);
    prevId = parseInt(prevId);
    index=prevId-1;
    ol = event.target.parentNode.parentNode.parentNode.parentNode;
    for(var i=0;i<ol.childElementCount;i++){
        if(i>index){
            console.log(i,index);
            // change id
            ol.children[i].children[0].id = "question"+i;
            ques = ol.children[i].children[0].children[0].children;
            ques[0].innerText = "Q"+i+" : ";
            ques[0].setAttribute('for',"q"+1);
            ques[1].id = "q"+i;
            ques[1].setAttribute('name', "q"+i);
            ques[8].id = "options"+i;
            marks = ol.children[i].children[0].children[1].children;
            marks[0].setAttribute('for',"m"+i);
            marks[1].id = "m"+i;
            marks[1].setAttribute('name', "m"+i);

        }
    }
    ol.removeChild(ol.children[index]);
    if(index == 0){
        $("#submit_btn").prop('disabled', true);
    }
    $("#length").val(parseInt($("#length").val())-1);
}