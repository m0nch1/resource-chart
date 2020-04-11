{
//Date variables
const date = new Date(); 
const year = 2019;
const month = date.getMonth()+1;
const day = date.getDate();

//server selecter
const selectedServer = document.getElementById('servers');
let targetServer = selectedServer.value;

//Month selecter
const selectedMonth = document.getElementById('month-selecter');
let setMonth = selectedMonth.value;

//Day selecter
const selectedDay = document.getElementById('day-selecter');
let setDay = selectedDay.value;

//Graph dateset
const graphDayset = document.querySelectorAll('.graph-dayset');

function dayseter() {
    for (i=0; i<graphDayset.length; i++) {
        let printM,printD;
        printM = setMonth;
        printD = setDay;
        
        if(setMonth.substr(0,1) == '0') printM = setMonth.slice(1);
        if(setDay.substr(0,1) == '0') printD = setDay.slice(1);
        graphDayset[i].innerHTML = year + '年' + printM + '月' + printD + '日';
    }
}

selectedMonth.addEventListener('change', function(){
    
    setMonth = selectedMonth.value;

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status == 200) {
                selectedDay.innerHTML = xhr.response;
            } else {
                console.log("通信失敗");
                xhr.abort();
            }
        }
    }
    xhr.onload = function(){
        dayseter();
        createCpuPieGraph();
        createCpuGraph();
        createProcessGraph();
        createMemoryGraph();
        createSessionGraph();
    }
    xhr.open("POST", "ajax.php", true);
    xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    xhr.send("month=" + setMonth );

});

selectedDay.addEventListener('change', function(){
    setDay = selectedDay.value;
    dayseter();
    createCpuPieGraph();
    createCpuGraph();
    createProcessGraph();
    createMemoryGraph();
    createSessionGraph();
});

//display time
const sTime = document.getElementById('display-time-start');
const eTime = document.getElementById('display-time-end');

selectedServer.addEventListener('change', function(){
    targetServer = selectedServer.value;
    createCpuPieGraph();
    createCpuGraph();
    createProcessGraph();
    createMemoryGraph();
    createSessionGraph();
});

//Time Slider
const timeMater = document.getElementById('time-range');
const materSet = document.getElementById('set-time');
const chart1TimeSet = document.getElementById('chart1-set-time');
const processTimeSet = document.getElementById('process-set-time');
const rangeValue = function (timeMater, materSet) {
    return function(evt){
        let hours = Math.floor(timeMater.value / 60);
        let minutes = timeMater.value - (hours * 60);

        if(hours.toString().length == 1) hours = '0' + hours;
        if(minutes.toString().length == 1) minutes = '0' + minutes;

        materSet.innerHTML = hours + ':' + minutes;
        chart1TimeSet.innerHTML = hours + ':' + minutes;
        processTimeSet.innerHTML = hours + ':' + minutes;
    }
}

function setTime() {
    let hour = date.getHours();
    let dhour = date.getHours()-1;
    let minute = date.getMinutes();

    if(hour.toString().length == 1) hour = '0' + hour;
    if(dhour.toString().length == 1) dhour = '0' + dhour;
    if(minute.toString().length == 1) minute = '0' + minute;
    
    eTime.value = hour + ':' + minute;
    sTime.value = dhour + ':' + minute;
}

timeMater.addEventListener('input', rangeValue(timeMater, materSet));

timeMater.addEventListener('change', function(){
    drawCpuPieChart(cpudata);
    drawProcessTable(processdata);
});

sTime.addEventListener('change', function() {
    drawCpuChart(cpudata);
    drawSessionChart(sessiondata);
    drawMemoryChart(memorydata);
    drawProcessChart(processdata);
});

eTime.addEventListener('change', function() {
    drawCpuChart(cpudata);
    drawSessionChart(sessiondata);
    drawMemoryChart(memorydata);
    drawProcessChart(processdata);
});

//csv
function csv2Array(str) {
    let csvData = [];
    let lines = str.split("\n");
    for (let i = 0; i < lines.length; ++i) {
        let cells = lines[i].split(",");
        csvData.push(cells);
    }
    return csvData;
}

//charts variables
let chart1, chart2, chart3, chart5, chart6, chart7;

function drawCpuPieChart(cpudata) {
    let setLabels = [], setData1 = [], setData2 = [], setData3 = [], setData4 = [], setData5 = [], setData6 = [], setData7 = [];
    
    for (let row in cpudata) {
        setLabels.push(cpudata[row][0]);
        setData1.push(cpudata[row][1]);
        setData2.push(cpudata[row][2]);
        setData3.push(cpudata[row][3]);
        setData4.push(cpudata[row][4]);
        setData5.push(cpudata[row][5]);
        setData6.push(cpudata[row][6]);
        setData7.push(cpudata[row][7]);
    };
    
    let dateLabels = setLabels.map(function(n) {
        return n.substr(-4, 2) + ':' + n.substr(-2);
    });

    let cpuPieChartData = cpudata.filter(function(x) {
        let setTime = document.getElementById('set-time').innerHTML; 
        return x[0].substr(-4) === setTime.replace(':', '');
    });

    let ctx1 = document.getElementById("chart1").getContext("2d");
    ctx1.canvas.height = 360;

    if (cpuPieChartData.length === 0) {
        ctx1.font = 'bold 20px sans-serif';
        ctx1.textAlign = 'center';
        ctx1.fillText('No Data', 170, 200);
    } else {
        if (chart1) { chart1.destroy(); }
        chart1 = new Chart(ctx1, {
            type: 'doughnut',
            data: {
                labels: ["cs","sy","id","wa","st"],
                datasets: [{
                    backgroundColor: [
                        "#FF6384",
                        "#FF9F40",
                        "#FFCD56",
                        "#4BC0C0",
                        "#36A2EB"
                    ],
                    data: [
                        cpuPieChartData[0][3], 
                        cpuPieChartData[0][4], 
                        cpuPieChartData[0][5], 
                        cpuPieChartData[0][6], 
                        cpuPieChartData[0][7]
                    ]
                }]
            },
            options: {
                events: [],
                responsive: true,
                maintainAspectRatio: false,
                title: {
                    display: true,
                    fontSize: 18, 
                    text: 'CPU使用率（サーバ単位）'
                },
                layout: {
                    padding: {
                        bottom: 50,
                    }
                }
            }
        });
    }
}

function drawCpuChart(cpudata) {

    let cpuChartData = cpudata.filter(function(x) {
        return (x[0].substr(-4) >= sTime.value.replace(':', '') && x[0].substr(-4) <= eTime.value.replace(':', ''));
    });
    
    let setLabels = [], setData1 = [], setData2 = [], setData3 = [], setData4 = [], setData5 = [], setData6 = [], setData7 = [];
    
    for (let row in cpuChartData) {
        setLabels.push(cpuChartData[row][0]);
        setData1.push(cpuChartData[row][1]);
        setData2.push(cpuChartData[row][2]);
        setData3.push(cpuChartData[row][3]);
        setData4.push(cpuChartData[row][4]);
        setData5.push(cpuChartData[row][5]);
        setData6.push(cpuChartData[row][6]);
        setData7.push(cpuChartData[row][7]);
    };
    
    let dateLabels = setLabels.map(function(n) {
        return n.substr(-4, 2) + ':' + n.substr(-2);
    });

    let ctx2 = document.getElementById("chart2").getContext("2d");
    ctx2.canvas.height = 400;

    if (chart2) { chart2.destroy(); }
    chart2 = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: dateLabels,
            datasets: [
                {
                    label: 'cs',
                    data:setData3,
                    borderColor: "rgba(255, 99, 132, 1)",
                    backgroundColor: "rgba(255, 99, 132, 0.3)",
                    fill: false,
                },
                {
                    label: 'sy',
                    data:setData4,
                    borderColor: "rgba(255, 159, 64, 1)",
                    backgroundColor: "rgba(255, 159, 64, 0.3)",
                    fill: false,
                },
                {
                    label: 'id',
                    data:setData5,
                    borderColor: "rgba(255, 205, 86, 1)",
                    backgroundColor: "rgba(255, 205, 86, 0.3)",
                    fill: false,
                },
                {
                    label: 'wa',
                    data:setData6,
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.3)",
                    fill: false,
                },
                {
                    label: 'st',
                    data:setData7,
                    borderColor: "rgba(54, 162, 235, 1)",
                    backgroundColor: "rgba(54, 162, 235, 0.3)",
                    fill: false,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                fontSize: 18, 
                text: 'CPU使用率（サーバ単位）-line chart-'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        min: 0,
                        max: 100
                    }
                }],
            },
        },
        
    });

    let ctx5 = document.getElementById("chart5").getContext("2d");
    ctx5.canvas.height = 400;

    if (chart5) { chart5.destroy(); }
    chart5 = new Chart(ctx5, {
        type: 'line',
        data: {
            labels: dateLabels,
            datasets: [
                {
                    label: 'si',
                    data:setData1,
                    borderColor: "rgba(255, 99, 132, 1)",
                    backgroundColor: "rgba(255, 99, 132, 0.3)",
                    fill: false,
                },
                {
                    label: 'so',
                    data:setData2,
                    borderColor: "rgba(255, 159, 64, 1)",
                    backgroundColor: "rgba(255, 159, 64, 0.3)",
                    fill: false,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                fontSize: 18, 
                text: 'スワップ'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        min: 0,
                    }
                }],
            },
        },
    });
}

function drawProcessChart(processdata) {

    let processChartData = processdata.filter(function(x) {
        return (x[0].substr(-4) >= sTime.value.replace(':', '') && x[0].substr(-4) <= eTime.value.replace(':', ''));
    });
    
    let setLabels = [], setData1 = [], setData2 = [], setData3 = [];
    
    for (let row in processChartData) {
        setLabels.push(processChartData[row][0]);
        setData1.push(processChartData[row][1]);
        setData2.push(processChartData[row][2]);
        setData3.push(processChartData[row][3]);
    };
    
    let dateLabels = setLabels.map(function(n) {
        return n.substr(-4, 2) + ':' + n.substr(-2);
    });

    let ctx3 = document.getElementById("chart3").getContext("2d");
    ctx3.canvas.height = 400;

    if (chart3) { chart3.destroy(); }
    chart3 = new Chart(ctx3, {
        type: 'line',
        data: {
            labels: dateLabels,
            datasets: [
                {
                    label: 'past 1 minute',
                    data:setData1,
                    borderColor: "rgba(255, 99, 132, 1)",
                    backgroundColor: "rgba(255, 99, 132, 0.3)",
                    fill: false,
                },
                {
                    label: 'past 5 minute',
                    data:setData2,
                    borderColor: "rgba(255, 159, 64, 1)",
                    backgroundColor: "rgba(255, 159, 64, 0.3)",
                    fill: false,
                },
                {
                    label: 'past 15 minute',
                    data:setData3,
                    borderColor: "rgba(255, 205, 86, 1)",
                    backgroundColor: "rgba(255, 205, 86, 0.3)",
                    fill: false,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                fontSize: 18, 
                text: 'ロードアベレージ'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        min: 0,
                    }
                }],
            },
        },
    });
}

function drawProcessTable(processdata) {

    let processTableData = processdata.filter(function(x) {
        let setTime = document.getElementById('set-time').innerHTML; 
        return x[0].substr(-4) === setTime.replace(':', '');
    });

    let pr1 = document.getElementById('pr1').children;
    let pr2 = document.getElementById('pr2').children;
    let pr3 = document.getElementById('pr3').children;
    let pr4 = document.getElementById('pr4').children;
    let pr5 = document.getElementById('pr5').children;
    let pr6 = document.getElementById('pr6').children;
    let pr7 = document.getElementById('pr7').children;
    let pr8 = document.getElementById('pr8').children;
    let pr9 = document.getElementById('pr9').children;
    let pr10 = document.getElementById('pr10').children;

    if (processTableData.length === 0) {
        for (let i=0; i<12; i++) {
            pr1[i].innerHTML = 'No Data';
            pr2[i].innerHTML = '';
            pr3[i].innerHTML = '';
            pr4[i].innerHTML = '';
            pr5[i].innerHTML = '';
            pr6[i].innerHTML = '';
            pr7[i].innerHTML = '';
            pr8[i].innerHTML = '';
            pr9[i].innerHTML = '';
            pr10[i].innerHTML = '';
        }
    } else {
        for (let i=0; i<12; i++) {
            pr1[i].innerHTML = processTableData[0][4+i];
            pr2[i].innerHTML = processTableData[0][16+i];
            pr3[i].innerHTML = processTableData[0][28+i];
            pr4[i].innerHTML = processTableData[0][40+i];
            pr5[i].innerHTML = processTableData[0][52+i];
            pr6[i].innerHTML = processTableData[0][64+i];
            pr7[i].innerHTML = processTableData[0][76+i];
            pr8[i].innerHTML = processTableData[0][88+i];
            pr9[i].innerHTML = processTableData[0][100+i];
            pr10[i].innerHTML = processTableData[0][112+i];
        }
    }
}

function drawMemoryChart(memorydata) {

    let memoryChartData = memorydata.filter(function(x) {
        return (x[0].substr(-4) >= sTime.value.replace(':', '') && x[0].substr(-4) <= eTime.value.replace(':', ''));
    });

    let setLabels = [], setData1 = [], setData2 = [], setData3 = [], setData4 = [], setData5 = [];
    for (let row in memoryChartData) {
        setLabels.push(memoryChartData[row][0]);
        setData1.push(memoryChartData[row][1]);
        setData2.push(memoryChartData[row][2]);
        setData3.push(memoryChartData[row][3]);
        setData4.push(memoryChartData[row][4]);
        setData5.push(memoryChartData[row][5]);
    };

    let dateLabels = setLabels.map(function(n) {
        return n.substr(-4, 2) + ':' + n.substr(-2);
    });

    let realMemory = memoryChartData.map(function(n) {
        return Math.round((n[2]/n[1])*100);
    });
    
    let actualMemory = memoryChartData.map(function(n) {
        return Math.round((n[3]/n[1])*100);
    });

    let swapMemory = memoryChartData.map(function(n) {
        return Math.round((n[5]/n[4])*100);
    });

    let ctx6 = document.getElementById("chart6").getContext("2d");
    ctx6.canvas.height = 400;

    if (chart6) { chart6.destroy(); }
    chart6 = new Chart(ctx6, {
        type: 'line',
        data: {
            labels: dateLabels,
            datasets: [
                {
                    label: '実メモリ',
                    data: realMemory,
                    borderColor: "rgba(255, 99, 132, 1)",
                    backgroundColor: "rgba(255, 99, 132, 0.3)",
                },
                {
                    label: 'バッファキャッシュ',
                    data: actualMemory,
                    borderColor: "rgba(255, 159, 64, 1)",
                    backgroundColor: "rgba(255, 159, 64, 0.3)",
                },
                {
                    label: 'スワップメモリ',
                    data: swapMemory,
                    borderColor: "rgba(255, 205, 86, 1)",
                    backgroundColor: "rgba(255, 205, 86, 0.3)",
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                fontSize: 18, 
                text: 'メモリ使用率'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        min: 0,
                        max: 100
                    }
                }],
            },
        },
    });
}

function drawSessionChart(sessiondata) {

    let sessionChartData = sessiondata.filter(function(x) {
        return (x[0].substr(-4) >= sTime.value.replace(':', '') && x[0].substr(-4) <= eTime.value.replace(':', ''));
    });

    let setLabels = [], setData1 = [], setData2 = [], setData3 = [];
    
    for (let row in sessionChartData) {
        setLabels.push(sessionChartData[row][0]);
        setData1.push(sessionChartData[row][1]);
        setData2.push(sessionChartData[row][2]);
        setData3.push(sessionChartData[row][3]);
    };
    
    let dateLabels = setLabels.map(function(n) {
        return n.substr(-4, 2) + ':' + n.substr(-2);
    });

    let ctx7 = document.getElementById("chart7").getContext("2d");
    ctx7.canvas.height = 400;

    if (chart7) { chart7.destroy(); }
    chart7 = new Chart(ctx7, {
        type: 'line',
        data: {
            labels: dateLabels,
            datasets: [
                {
                    label: 'ESTABLISHED',
                    data:setData1,
                    borderColor: "rgba(255, 99, 132, 1)",
                    backgroundColor: "rgba(255, 99, 132, 0.3)",
                    fill: false,
                },
                {
                    label: 'LISTEN',
                    data:setData2,
                    borderColor: "rgba(255, 159, 64, 1)",
                    backgroundColor: "rgba(255, 159, 64, 0.3)",
                    fill: false,
                },
                {
                    label: 'TIME_WAIT',
                    data:setData3,
                    borderColor: "rgba(255, 205, 86, 1)",
                    backgroundColor: "rgba(255, 205, 86, 0.3)",
                    fill: false,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                fontSize: 18, 
                text: 'セッション数'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        min: 0,
                    }
                }],
            },
        },
    });
}

function createCpuPieGraph() {
    const req = new XMLHttpRequest();
    const cpuGraphPieFilePath = './csv/'+ year + '/' + year + '_' + setMonth + '/' + setMonth + setDay + '/' + targetServer + '/cpu.csv';
    console.log(cpuGraphPieFilePath);
    req.open("GET", cpuGraphPieFilePath, true);
    req.onload = function() {
        cpudata = csv2Array(req.responseText);
        drawCpuPieChart(cpudata);
    }
    req.send(null);
}

function createCpuGraph() {
    const req = new XMLHttpRequest();
    const cpuGraphFilePath = './csv/'+ year + '/' + year + '_' + setMonth + '/' + setMonth + setDay + '/' + targetServer + '/cpu.csv';
    req.open("GET", cpuGraphFilePath, true);
    req.onload = function() {
        cpudata = csv2Array(req.responseText);
        drawCpuChart(cpudata);
    }
    req.send(null);
}

function createProcessGraph() {
    const req = new XMLHttpRequest();
    const processGraphFilePath = './csv/'+ year + '/' + year + '_' + setMonth + '/' + setMonth + setDay + '/' + targetServer + '/process.csv' ;
    req.open("GET", processGraphFilePath, true);
    req.onload = function() {
        processdata = csv2Array(req.responseText);
        drawProcessChart(processdata);
        drawProcessTable(processdata);
    }
    req.send(null);
}

function createMemoryGraph() {
    const req = new XMLHttpRequest();
    const memoryGraphFilePath = './csv/'+ year + '/' + year + '_' + setMonth + '/' + setMonth + setDay + '/' + targetServer + '/memory.csv' ;
    req.open("GET", memoryGraphFilePath, true);
    req.onload = function() {
        memorydata = csv2Array(req.responseText);
        drawMemoryChart(memorydata);
    }
    req.send(null);
}

function createSessionGraph() {
    const req = new XMLHttpRequest();
    const sessionGraphFilePath = './csv/'+ year + '/' + year + '_' + setMonth + '/' + setMonth + setDay + '/' + targetServer + '/session.csv' ;
    req.open("GET", sessionGraphFilePath, true);
    req.onload = function() {
        sessiondata = csv2Array(req.responseText);
        drawSessionChart(sessiondata);
    }
    req.send(null);
}

// Real time button

const rtbtn = document.getElementById('rtbtn');
const statusTxt = document.querySelector('.rtstatus_btn');

function realTimeJob() {
    let date = new Date(); 
    let hour = date.getHours();
    let minute = date.getMinutes();

    if(hour.toString().length == 1) hour = '0' + hour;
    if(minute.toString().length == 1) minute = '0' + minute;
    
    eTime.value = hour + ':' + minute;

    createCpuPieGraph();
    createCpuGraph();
    createProcessGraph();
    createMemoryGraph();
    createSessionGraph();

    timeMater.value = (hour*60) + minute-1;
    materSet.innerHTML = hour + ':' + minute;
    chart1TimeSet.innerHTML = hour + ':' + minute;
    processTimeSet.innerHTML = hour + ':' + minute;
}

let timer;

function timerStart() {
    timer = setInterval(realTimeJob, 60000);
}

function timerEnd() {
    clearInterval(timer);
}

rtbtn.addEventListener('click', function(){

    rtbtn.classList.toggle('on');

    if (rtbtn.classList.contains('on')) {
        statusTxt.textContent = 'ON';
        timerStart();
    } else {
        statusTxt.textContent = 'OFF';
        timerEnd();
    }
});

dayseter();
createCpuPieGraph();
createCpuGraph();
createProcessGraph();
createMemoryGraph();
createSessionGraph();
setTime();
}
