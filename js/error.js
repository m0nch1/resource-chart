{

//Date variables
let date = new Date(); 
let year = date.getFullYear();
let month = date.getMonth()+1;
let day = date.getDate();

if(month.toString().length == 1) month = '0' + month;
if(day.toString().length == 1) day = '0' + day;

let timer = 0;
let header = document.querySelector('.sticky-top');
let box = document.getElementById('log-box');

window.onload = function () {
    let wh =  window.innerHeight;
    box.style.height = (wh - header.offsetHeight - 30) + 'px';
}

window.onresize = function () {
  if (timer > 0) {
    clearTimeout(timer);
  }
 
  timer = setTimeout(function () {
    let wh =  window.innerHeight;
    box.style.height = (wh - header.offsetHeight - 30) + 'px';
  }, 200);
};

//Month selecter
let selectedMonth = document.getElementById('month-selecter');
let setMonth = selectedMonth.value;

selectedMonth.addEventListener('change', function(){
    setMonth = selectedMonth.value;

    $.ajax({
        url:'./ajax.php',
        type:'POST',
        cache : false,
        data:{
            'error_month':setMonth
        }
    }).done(function(response, textStatus, xhr) {
        $("#day-selecter").html(response);
        console.log(response);
        //$("#test").text(response);
    }).fail(function(xhr, textStatus, errorThrown) {
        console.log(errorThrown);
    });

    getErrorlog();
});

//Day selecter
let selectedDay = document.getElementById('day-selecter');
let setDay = selectedDay.value;

selectedDay.addEventListener('change', function(){
    setDay = selectedDay.value;
    getErrorlog();
});

let filePath;

function getErrorlog() {
    const req = new XMLHttpRequest();
    if ( month + day === setMonth + setDay ) {
        filePath = './log/error_log';
    } else {
        filePath = './log/error_log_' + year + setMonth + setDay;
    }
    req.open("GET", filePath, true);
    req.onload = function() {
        let logData = req.responseText;
        showErrorlog(logData);
    }
    req.send(null);
}

function showErrorlog(logData) {
    box.innerHTML = logData;
}

getErrorlog();

}