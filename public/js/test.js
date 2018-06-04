$(function () {
    var time = $('#clock').text();
    time = parseFloat(time)*60;
    console.log(time);
    var x = setInterval(function () {
        time--;
        var min = Math.floor(time/60);
        var sec = time - min*60;
        $('#clock').text(min+" min "+sec+" sec");
        if(min==0 && sec<=10){
            $('#clock').css('color', "red");
        }
        if(time == 0) {
            clearInterval(x);
            $('#submit_btn').click();
        }
    }, 1000);
});