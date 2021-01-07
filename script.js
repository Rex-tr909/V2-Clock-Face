Chart.defaults.global.defaultFontFamily = 'Roboto';
Chart.defaults.global.defaultFontSize = 14;
Chart.defaults.global.animation = false;
Chart.defaults.global.legend.display = false;
Chart.defaults.global.elements.point.radius = 5;
Chart.defaults.global.elements.point.hoverRadius = 5;
Chart.defaults.global.elements.line.borderDash = [6, 6];


const routes = [{ name: "F1", journeyLength: 45 }, { name: "F2", journeyLength: 30 }, { name: "F4", journeyLength: 55 }, { name: "F5", journeyLength: 30 },
{ name: "F6", journeyLength: 45 }, { name: "F7", journeyLength: 65 }, { name: "F8", journeyLength: 45 }, { name: "F9", journeyLength: 65 }];
routes.forEach((r) => r.journeys = []);
const wharves = ["Wharf 1A", "Wharf 1B", "Wharf 2A", "Wharf 2B", "Wharf 3A", "Wharf 3B", "Wharf 4A", "Wharf 4B", "Wharf 5A", "Wharf 5B", "Wharf 6A", "Wharf 6B"]
const colourChoices = [{ C: 'rgba(252, 82, 3, 0.8)' }, { C: 'rgba(252, 252, 3, 0.8)' }, { C: 'rgba(94, 252, 3, 0.8)' }, { C: 'rgba(3, 252, 177, 0.8)' },
{ C: 'rgba(3, 252, 248, 0.8)' }, { C: 'rgba(3, 148, 252, 0.8)' }, { C: 'rgba(103, 3, 252, 0.8)' },
{ C: 'rgba(248, 3, 252, 0.8)' }, { C: 'rgba(252, 3, 136, 0.8)' }, { C: 'rgba(252, 3, 15, 0.8)' }];
var mins60 = [];
var mins60Labels = [];
for (let m = 0; m < 61; m++) {
    mins60.push(m);
    if (m < 10) {
        mins60Labels.push(":0" + m);
    }
    else {
        mins60Labels.push(":" + m);
    }
}
let chartData = [];
let currentRoute;

var config = {
    type: 'line',
    data: {
        labels: mins60,
        datasets: [],
    },
    options: {
        tooltips: {
            callbacks: {
                label: function (tooltipItems, data) {
                    return data.datasets[tooltipItems.datasetIndex].label;
                },
                title: () => {}
            }
        },
        legend: {
            labels: {
                fontSize: 20
            }
        },
        scales: {
            xAxes: [{
                ticks: {
                    max: 60,
                    min: 0,
                    stepSize: 1,
                    callback: function (label) {
                        return mins60Labels[label];
                    }
                }
            }],
            yAxes: [{
                ticks: {
                    max: 11,
                    min: 0,
                    stepSize: 1,
                    callback: function (label) {
                        return wharves[label];
                    }
                },
            }],
        },
    }
};

function chartPush(pushRoute) {
    chartData = chartData.filter(d => d.label != routes[pushRoute].name);
    routes[pushRoute].journeys.forEach(x => {
        chartData.push({
            label: routes[pushRoute].name,
            borderColor: colourChoices[pushRoute].C,
            backgroundColor: colourFill(colourChoices[pushRoute].C),
            fill: false,
            lineTension: 0,
            data: x.route[0]
        })
        chartData.push({
            label: routes[pushRoute].name,
            borderColor: colourChoices[pushRoute].C,
            backgroundColor: colourFill(colourChoices[pushRoute].C),
            fill: false,
            lineTension: 0,
            data: x.route[1]
        }
        )
    })
    config.data.datasets = chartData;
    window.myLine.update(config);
}

function checkConflicts(line) {
    let conflict = null;
    let datasets = config.data.datasets;
    for (let x = 0; x < line.length; x++) {
        for (let i = 0; i < datasets.length; i++) {
            if (line[x].y == datasets[i].data[0].y) {
                if (line[x].x > datasets[i].data[0].x && line[x].x < datasets[i].data[1].x) {
                    let thisRoute = datasets[i].label;
                    let thisWharf = datasets[i].data[0].y;
                    conflict = `<b>Route ${thisRoute}</b> on <b>${wharves[thisWharf]}</b>`;
                }
                else if (line[x].x == datasets[i].data[0].x && line[x + 1].x == datasets[i].data[1].x) {
                    let thisRoute = datasets[i].label;
                    let thisWharf = datasets[i].data[0].y;
                    conflict = `<b>Route ${thisRoute}</b> on <b>${wharves[thisWharf]}</b>`;
                }
                else if (datasets[i].data[3] != null) {
                    if (line[x].x >= datasets[i].data[3].x && line[x].x <= datasets[i].data[4].x) {
                        let thisRoute = datasets[i].label;
                        let thisWharf = datasets[i].data[0].y;
                        conflict = `<b>Route ${thisRoute}</b> on <b>${wharves[thisWharf]}</b>`;
                    }
                }
            }
        }
    }
    return conflict;
}

window.onload = function () {
    help.style.display = "none";
    currentRoute = 0;
    var ctx = document.getElementById('ferryChart').getContext('2d');
    for (let i = 0; i < routes.length; i++) {
        let buttonNumber = i;
        let routeBox = document.createElement('div');
        routeBox.id = routes[i].name;
        routeBox.textContent = routes[i].name;
        routeBox.className = 'routeBox';
        routeBox.style.backgroundColor = colourFill(colourChoices[i].C);
        routeBox.addEventListener("mouseenter", () => routeBox.style.backgroundColor = colourChoices[i].C);
        routeBox.addEventListener("mouseleave", () => routeBox.style.backgroundColor = colourFill(colourChoices[i].C));
        routeBox.addEventListener("click", () => {
            currentRoute = buttonNumber;
            updateEditForm();
        })
        document.getElementById("routes").appendChild(routeBox);
    }
    updateEditForm();
    window.myLine = new Chart(ctx, config);
}

var depart = document.getElementById("depart");
var time = document.getElementById("time");
var arrive = document.getElementById("arrive");
var helpButton = document.getElementById("helpButton");
var help = document.getElementById("help");

helpButton.addEventListener("click", () => {
    if (help.style.display === "none") {
        help.style.display = "block";
        document.getElementById("bodyDiv").style.filter = "blur(5px)";
    }
    else {
        help.style.display = "none";
        document.getElementById("bodyDiv").style.filter = "";
    }
});

help.addEventListener("click", () => {
    if (help.style.display === "none") {
        help.style.display = "block";
        document.getElementById("bodyDiv").style.filter = "blur(5px)";
    }
    else {
        help.style.display = "none";
        document.getElementById("bodyDiv").style.filter = "";
    }
});

depart.addEventListener("input",
    () => document.getElementById("departOutput").textContent = wharves[parseInt(depart.value)]);

time.addEventListener("input",
    () => document.getElementById("timeOutput").textContent = `${mins60Labels[parseInt(time.value)]}`);
    // derived arrival time
    // ${(mins60Labels[(parseInt(time.value) + routes[currentRoute].journeyLength) % 60])}

arrive.addEventListener("input",
    () => document.getElementById("arriveOutput").textContent = wharves[parseInt(arrive.value)]);

function colourFill(colourChoice) {
    let fill = colourChoice.replace(0.8, 0.3);
    return fill;
}

function updateEditForm() {
    let plus = document.getElementById("plusButton");
    plus.style.backgroundColor = colourFill(colourChoices[currentRoute].C);
    plus.addEventListener("mouseenter", () => plus.style.backgroundColor = colourChoices[currentRoute].C);
    plus.addEventListener("mouseleave", () => plus.style.backgroundColor = colourFill(colourChoices[currentRoute].C));
    document.getElementById("routeName").textContent = `Edit (${routes[currentRoute].name}):`;
    docRoute = document.getElementById("currentRoute");
    docRoute.innerHTML = "";
    document.getElementById("currentRoute").innerHTML = "";
    let r = routes[currentRoute].journeys;

    if (r.length == 0) {
        let journeyBox = document.createElement("div");
        journeyBox.textContent = `No journeys have been entered for route ${routes[currentRoute].name}.`;
        document.getElementById("currentRoute").appendChild(journeyBox);
    }

    for (let i = 0; i < r.length; i++) {
        let journeyBox = document.createElement("div");
        let journeyButton = document.createElement("button");
        journeyBox.id = "journeyBox" + i;
        journeyBox.innerHTML = `Depart from <b>${wharves[r[i].depart]}</b> at <b>${r[i].time} Minutes </b>past the hour. 
        <br>Arrive at <b>${wharves[r[i].arrive]}</b> at <b>${r[i].arriveTime} Minutes </b>past the hour.`;
        journeyButton.className = "removeJourney";
        journeyButton.textContent = "Remove Journey";
        journeyButton.addEventListener("click", () => {
            routes[currentRoute].journeys.splice(journeyBox.id[journeyBox.id.length - 1], 1);
            chartPush(currentRoute);
            updateEditForm();
        });
        document.getElementById("currentRoute").appendChild(journeyBox).append(journeyButton);
    }
}

function clockfaceTime(time) {
    return (parseInt(time) + 60) % 60;
}

function addJourney() {
    let tv = parseInt(time.value)
    let dv = parseInt(depart.value)
    let av = parseInt(arrive.value)
    let ay = dv;
    let ax = clockfaceTime(tv - 10);
    let by = dv;
    let bx = clockfaceTime(tv);
    let cy = av;
    let cx = clockfaceTime(tv + routes[currentRoute].journeyLength);
    let dy = av;
    let dx = clockfaceTime(tv + routes[currentRoute].journeyLength + 10);
    let departLine = [{ x: ax, y: ay }, { x: bx, y: by }];
    let arriveLine = [{ x: cx, y: cy }, { x: dx, y: dy }];
    addZeroPoints(departLine);
    addZeroPoints(arriveLine);
    departLine.sort((a, b) => a.x - b.x);
    arriveLine.sort((a, b) => a.x - b.x);
    addSkips(departLine);
    addSkips(arriveLine);
    let conflictDepart = checkConflicts(departLine);
    let conflictArrive = checkConflicts(arriveLine);
    let conflictSelf;
    if ((currentRoute == 0 || currentRoute == 2 || currentRoute == 4 || currentRoute == 6) && departLine[0].y == arriveLine[0].y) {
        conflictSelf = `<b>Conflict:</b> Separate departure and arrival wharves are necessary for this route.`
    }
    if (conflictDepart == null && conflictArrive == null && conflictSelf == null) {
        routes[currentRoute].journeys.push({ time: tv, depart: dv, arrive: av, arriveTime: cx, route: [departLine, arriveLine] });
        chartPush(currentRoute);
    }
    else {
        let alert;
        if (conflictSelf != null) {
            alert = conflictSelf;
        }
        else if (conflictDepart != null) {
            alert = `<b>Conflict:</b> the departure time conflicts with ${conflictDepart}. Select a different time or departure wharf.`
        }
        else if (conflictArrive != null) {
            alert = `<b>Conflict:</b> the arrival time conflicts with ${conflictArrive}. Select a different time or arrival wharf.`
        }
        let conflictPop = document.createElement('div');
        conflictPop.className = 'popup';
        conflictPop.innerHTML = `<h2>Error</h2><p>${alert}</p>`;
        conflictPop.id = "conflictPopup"
        document.body.appendChild(conflictPop);
        document.getElementById("bodyDiv").style.filter = "blur(5px)";
        conflictPop.addEventListener("click", () => {
            conflictPop.remove();
            document.getElementById("bodyDiv").style.filter = "";
        });
    };
    updateEditForm();
}

function addZeroPoints(lineArray) {
    if (lineArray[0].x > lineArray[1].x && lineArray[0].x != 60 && lineArray[0].x != 0 && lineArray[1].x != 60 && lineArray[1].x != 0) {
        lineArray.splice(1, 0, { x: 60, y: lineArray[0].y });
        lineArray.splice(3, 0, { x: 0, y: lineArray[0].y });
    }
    else if (lineArray[0].x > lineArray[1].x && lineArray[1].x == 0) {
        lineArray[1].x = 60;
    }
}

function addSkips(sortedArray) {
    if (sortedArray.length > 2) {
        sortedArray.splice(2, 0, { x: NaN, y: NaN });
    }
}