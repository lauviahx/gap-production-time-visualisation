
var myChartA; // create global variable for chart
var myChartB; // create global variable for chart
var myChartC; // create global variable for chart
var myChartD; // create global variable for chart

//Chart deafults 
Chart.defaults.global.defaultFontColor = 'black'; // default font colour
Chart.defaults.global.legend.display = false; // hide legend
Chart.defaults.global.title.display = true; // display chart title
Chart.defaults.global.title.fontSize = '17'; // default font size for title
Chart.defaults.global.title.fontFamily = 'Times New Roman, Times, serif'; // default font family for title
Chart.defaults.global.responsive = true; // allow responsivnes

chartItA(); // call chart function - displays chart without filter
chartItB(); // call chart function - displays chart without filter
chartItC(); // call chart function - displays chart without filter
chartItD(); // call chart function - displays chart without filter



async function chartItA(filterFrom,filterTo) { // chart function for line A
    const response = await fetch('/api'); // get data from database
    const data = await response.json(); 
   
    // Line A

    let xVals = []; // x axis values array
    let yAvailableAM = []; // array of full available time for AM
    let breaksAM = []; // array of breaks AM
    let plannedAM = []; // array of planned time deductions AM
    let productionAM = []; // array of unplanned time deductions AM
    let unplannedAM = []; // array of production time deductions AM
    let gapAM = []; // array of gap AM

    let yAvailablePM = []; // array of full available time for PM
    let breaksPM = []; // array of breaks PM
    let plannedPM = []; // array of planned time deductions PM
    let productionPM = []; // array of unplanned time deductions PM
    let unplannedPM = []; // array of production time deductions PM
    let gapPM = []; // array of gap PM

    let totalTimeAM = []; // array to store total productive time for AM
    let totalTimePM = []; // array to store total productive time for PM
    let efficiency = []; // array to store efficiency calculations

    let n = 0; // assign new variable to 0, which will be used within below for loop, needed to 'grab' correct record and store them

    
    for (let i = 0; i < data.length; i++) { // putting data from database; loop through until reached end of the database
        var condition = data[i].line == 'A'; // set up condition, find and use only data for line A
        if(typeof filterFrom != 'undefined' && typeof filterTo != 'undefined'){ // if function; if filter date entered use dates within the range (below)
            condition = data[i].line == 'A' && data[i].date >= filterFrom && data[i].date <= filterTo;
        } 
        if (condition) {

            // I had issue with gaps in my charts so instead of just assigning data to arrays I needed to use .push(), so records that we are not interested in
            // will be skipped. 

            xVals.push(new Date(data[i].date).toDateString());  // add new items to the end of an array, and returns the new length (dates in string format)

            // AM data

            let timeTempStart = data[i].amStartTime; // get times from data and assign to variable to be able to then convert times into min as below
            let timeTempStop = data[i].amEndTime;
            let a = timeTempStart.split(':'); // convert times into minutes https://stackoverflow.com/questions/32885682/convert-hhmmss-into-minute-using-javascript
            let b = timeTempStop.split(':');
            let minutesA = (+a[0]) * 60 + (+a[1]);
            let minutesB = (+b[0]) * 60 + (+b[1]);
            yAvailableAM.push(minutesB - minutesA); // calculate full available time for the shift and push it to the array

            let ax = yAvailableAM[n]; // assign to the variable for later calculations, using 'n'

            breaksAM.push(data[i].amBreaks); // assign breaks time to array
            plannedAM.push(data[i].amPlanned); // assign planned stops time to array
            productionAM.push(data[i].amProduction); // assign production time to array
            unplannedAM.push(data[i].amUnplanned); // assign unplanned stops time to array

            gapAM.push((ax - breaksAM[n] - plannedAM[n] - productionAM[n] - unplannedAM[n])); // calculate unused time and store

            totalTimeAM.push((ax - gapAM[n] - unplannedAM[n])); // calculate productive time (time spent on production, breaks or planned stops)
            let totalAM = totalTimeAM[n]; // assign to variable for later calculations

            // PM data - same principles as AM

            let timeTempStart2 = data[i].pmStartTime;
            let timeTempStop2 = data[i].pmEndTime;
            let c = timeTempStart2.split(':');
            let d = timeTempStop2.split(':');
            if(d[0] != 0){ // pm shift can finish after midnight (but always before 1am), so i needed to add some statements to allow correct calculations
                let minutesC = (+c[0]) * 60 + (+c[1]);
                let minutesD = (+d[0]) * 60 + (+d[1]);
                yAvailablePM.push(minutesD - minutesC);
            }else if(d[1] != 0){ // if finish after midnight
                let minutesC = (+c[0]) * 60 + (+c[1]);
                let minutesD = (+24) * 60 + (+d[1]); // basicaly change hours 00 into 24 format 
                yAvailablePM.push(minutesD - minutesC);
            }else{
                yAvailablePM.push(0); // if no input
            }
            let av = yAvailablePM[n];

            breaksPM.push(data[i].pmBreaks);
            plannedPM.push(data[i].pmPlanned);
            productionPM.push(data[i].pmProduction);
            unplannedPM.push(data[i].pmUnplanned);

            gapPM.push((av - breaksPM[n] - plannedPM[n] - productionPM[n] - unplannedPM[n]));

            totalTimePM.push((av - gapPM[n] - unplannedPM[n]));
            let totalPM = totalTimePM[n];

            //Calculate overall efficiency
            let f = totalPM + totalAM; // add both productive times together and store in variable
            let g = ax + av; // add both full available times

            efficiency[n] = ((f / g) * 100).toFixed(2); // calculate efficiency % and display 2 decimal places, asign to the array

            n++; // increment
        }
    }
  
    
  if(!myChartA){ // if chart havent been executed yet - create it > else update
  
    //Chart line A
    const ctx = document.getElementById('chartA').getContext('2d'); //connect dom element 
    
    myChartA = new Chart(ctx, { //new chart object
        type: 'bar', // bar chart
        data: {
            labels: xVals,  // use xVals (dates) as labels on x axies
            datasets: [
                {
                    label: 'Overall efficiency', // data label
                    data: efficiency, // use data stored in efficiency[]
                    fill: false, // no fill
                    type: 'line', // line chart (using 2 types of charts within the project)
                    yAxisID: 'B', // relate to y axis that is specyfied as 'B' (below in options)
                    borderColor: '#022F99', // border colour
                    backgroundColor: '#469BEB' // background colour
                },
                {
                    label: 'AM Breaks', // data label
                    data: breaksAM, // use data stored in breaksAM[]
                    stack: '0', // assign to first stack (basically I have two production shifts and I wanted to have data grouped on the chart accordingly to it)
                    yAxisID: 'A', // relate to y axis that is specyfied as 'A' (below in options)
                    backgroundColor: '#FFF5BA' // background colour
                },
                {
                    label: 'AM Planned downtime', // same principles as above
                    data: plannedAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FFE291'
                },
                {
                    label: 'AM Production time', // same principles as above
                    data: productionAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FBCC6E'
                },
                {
                    label: 'AM Unplanned downtime', // same principles as above
                    data: unplannedAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FFA7AB'
                },
                {
                    label: 'AM Gap', // same principles as above
                    data: gapAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FA725C'
                },
                {
                    label: 'PM Breaks', // same principles as above but different stack number
                    data: breaksPM,
                    stack: '1', // assign to second stack as relates to another shift
                    yAxisID: 'A',
                    backgroundColor: '#D0FFBA'
                },
                {
                    label: 'PM Planned downtime', // same principles as above
                    data: plannedPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#A6FF99'
                },
                {
                    label: 'PM Production time',// same principles as above
                    data: productionPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#5EEBA7'
                },
                {
                    label: 'PM Unplanned downtime', // same principles as above
                    data: unplannedPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#B08FFF'
                },
                {
                    label: 'PM Gap', // same principles as above
                    data: gapPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#9149EB'
                },
            ],
        },
        options: { // chart options
            title: {
                text: 'Line A - Gap production time alalysis' // chart title
            },
            tooltips: { // tooltips options
                callbacks: {
                    label: function (tooltipItems, data) {
                        let p = data.datasets[tooltipItems.datasetIndex].label;
                        if (p == 'Overall efficiency') {  // if data is efficiency 
                            return p + ': ' + tooltipItems.yLabel + ' %'; // add : and % after the values
                        } // else
                        return p + ': ' + tooltipItems.yLabel + ' min.'; // add : and 'min.' after the values
                    }
                }

            },
            scales: {
                xAxes: [{ // x asis
                    stacked: true, // option to have stacked bars
                    scaleLabel: {
                        display: true, // display label
                        labelString: 'Date', // name it 'Date'
                        fontStyle: 'italic' // italic font
                    },
                }],
                yAxes: [{ // y axis
                    id: 'A',  // give these option ID to then use for seperate chart sections
                    position: 'left', // position to left - will be used for all minutes related values
                    stacked: true, // stacked bars
                    scaleLabel: {
                        display: true,
                        labelString: 'Production time',
                        fontStyle: 'italic'
                    }
                },
                {
                    id: 'B', // give these option ID to then use for seperate chart sections
                    position: 'right', // position to right - will be used for efficiency related values
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Efficiency %',
                        fontStyle: 'italic'
                    },
                    ticks: { // no matter on used values display y axis as 0 - 120 (in theory % shouldnt go over 100% but it does due to incorrect data recorded)
                        max: 120,
                        min: 0
                    },
                },]

            }
        }
    })
    
  }else{  // update values and the chart
    
    myChartA.data.labels = xVals;
    myChartA.data.datasets[0].data=efficiency;
    myChartA.data.datasets[1].data=breaksAM;
    myChartA.data.datasets[2].data=plannedAM;
    myChartA.data.datasets[3].data=productionAM;
    myChartA.data.datasets[4].data=unplannedAM;
    myChartA.data.datasets[5].data=gapAM;
    
    myChartA.data.datasets[6].data=breaksPM;
    myChartA.data.datasets[7].data=plannedPM;
    myChartA.data.datasets[8].data=productionPM;
    myChartA.data.datasets[9].data=unplannedPM;
    myChartA.data.datasets[10].data=gapPM;
    
    myChartA.update();
    
  }
  
    
}

// other graphs for line B, C and D works exacly the same

async function chartItB(filterFrom,filterTo) { // chart function for line B
    const response = await fetch('/api'); // get data from database
    const data = await response.json();
   

    // Line B

    let xVals = []; // x axis values array
    let yAvailableAM = []; // array of full available time for AM
    let breaksAM = []; // array of breaks AM
    let plannedAM = []; // array of planned time deductions AM
    let productionAM = []; // array of unplanned time deductions AM
    let unplannedAM = []; // array of production time deductions AM
    let gapAM = []; // array of gap AM

    let yAvailablePM = []; // array of full available time for PM
    let breaksPM = []; // array of breaks PM
    let plannedPM = []; // array of planned time deductions PM
    let productionPM = []; // array of unplanned time deductions PM
    let unplannedPM = []; // array of production time deductions PM
    let gapPM = []; // array of gap PM

    let totalTimeAM = []; // array to store total productive time for AM
    let totalTimePM = []; // array to store total productive time for PM
    let efficiency = []; // array to store efficiency calculations

    let n = 0; // assign new variable to 0, which will be used within below for loop, needed to 'grab' correct record and store them

    
    for (let i = 0; i < data.length; i++) { // loop through until reached end of the database
        var condition = data[i].line == 'B'; // set up condition, find and use only data for line B
        if(typeof filterFrom != 'undefined' && typeof filterTo != 'undefined'){ // if function; if filter date entered use dates within the range (below)
            condition = data[i].line == 'B' && data[i].date >= filterFrom && data[i].date <= filterTo;
        } // else get data within date filter; use all data for line B
        if (condition) {

            // I had issue with gaps in my charts so instead of just assigning data to arrays I needed to use .push(), so records that we are not interested in
            // will be skipped. 

            xVals.push(new Date(data[i].date).toDateString());  // add new items to the end of an array, and returns the new length (dates in string format)

            // AM data

            let timeTempStart = data[i].amStartTime; // get times from data and assign to variable to be able to then convert times into min as below
            let timeTempStop = data[i].amEndTime;
            let a = timeTempStart.split(':'); // convert times into minutes https://stackoverflow.com/questions/32885682/convert-hhmmss-into-minute-using-javascript
            let b = timeTempStop.split(':');
            let minutesA = (+a[0]) * 60 + (+a[1]);
            let minutesB = (+b[0]) * 60 + (+b[1]);
            yAvailableAM.push(minutesB - minutesA); // calculate full available time for the shift and push it to the array

            let ax = yAvailableAM[n]; // assign to the variable for later calculations, using 'n'

            breaksAM.push(data[i].amBreaks); // assign breaks time to array
            plannedAM.push(data[i].amPlanned); // assign planned stops time to array
            productionAM.push(data[i].amProduction); // assign production time to array
            unplannedAM.push(data[i].amUnplanned); // assign unplanned stops time to array

            gapAM.push((ax - breaksAM[n] - plannedAM[n] - productionAM[n] - unplannedAM[n])); // calculate unused time and store

            totalTimeAM.push((ax - gapAM[n] - unplannedAM[n])); // calculate productive time (time spent on production, breaks or planned stops)
            let totalAM = totalTimeAM[n]; // assign to variable for later calculations

            // PM data - same principles as AM

            let timeTempStart2 = data[i].pmStartTime;
            let timeTempStop2 = data[i].pmEndTime;
            let c = timeTempStart2.split(':');
            let d = timeTempStop2.split(':');
            if(d[0] != 0){
                let minutesC = (+c[0]) * 60 + (+c[1]);
                let minutesD = (+d[0]) * 60 + (+d[1]);
                yAvailablePM.push(minutesD - minutesC);
            }else if(d[1] != 0){
                let minutesC = (+c[0]) * 60 + (+c[1]);
                let minutesD = (+24) * 60 + (+d[1]);
                yAvailablePM.push(minutesD - minutesC);
            }else{
                yAvailablePM.push(0);
            }
            let av = yAvailablePM[n];

            breaksPM.push(data[i].pmBreaks);
            plannedPM.push(data[i].pmPlanned);
            productionPM.push(data[i].pmProduction);
            unplannedPM.push(data[i].pmUnplanned);

            gapPM.push((av - breaksPM[n] - plannedPM[n] - productionPM[n] - unplannedPM[n]));

            totalTimePM.push((av - gapPM[n] - unplannedPM[n]));
            let totalPM = totalTimePM[n];

            //Calculate overall efficiency
            let f = totalPM + totalAM; // add both productive times together and store in variable
            let g = ax + av; // add both full available times

            efficiency[n] = ((f / g) * 100).toFixed(2); // calculate efficiency % and display 2 decimal places, asign to the array

            n++; // increment
        }
    }
  
    
  if(!myChartB){ // if chart havent been executed yet - create it > else update
  
    //Chart line B
    const cty = document.getElementById('chartB').getContext('2d'); //connect dom element 
    
    myChartB = new Chart(cty, { //new chart object
        type: 'bar', // bar chart
        data: {
            labels: xVals,  // use xVals (dates) as labels on x axies
            datasets: [
                {
                    label: 'Overall efficiency', // data label
                    data: efficiency, // use data stored in efficiency[]
                    fill: false, // no fill
                    type: 'line', // line chart (using 2 types of charts within the project)
                    yAxisID: 'B', // relate to y axis that is specyfied as 'B' (below in options)
                    borderColor: '#022F99', // border colour
                    backgroundColor: '#469BEB' // background colour
                },
                {
                    label: 'AM Breaks', // data label
                    data: breaksAM, // use data stored in breaksAM[]
                    stack: '0', // assign to first stack (basically I have two production shifts and I wanted to have data grouped on the chart accordingly to it)
                    yAxisID: 'A', // relate to y axis that is specyfied as 'A' (below in options)
                    backgroundColor: '#FFF5BA' // background colour
                },
                {
                    label: 'AM Planned downtime', // same principles as above
                    data: plannedAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FFE291'
                },
                {
                    label: 'AM Production time', // same principles as above
                    data: productionAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FBCC6E'
                },
                {
                    label: 'AM Unplanned downtime', // same principles as above
                    data: unplannedAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FFA7AB'
                },
                {
                    label: 'AM Gap', // same principles as above
                    data: gapAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FA725C'
                },
                {
                    label: 'PM Breaks', // same principles as above but different stack number
                    data: breaksPM,
                    stack: '1', // assign to second stack as relates to another shift
                    yAxisID: 'A',
                    backgroundColor: '#D0FFBA'
                },
                {
                    label: 'PM Planned downtime', // same principles as above
                    data: plannedPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#A6FF99'
                },
                {
                    label: 'PM Production time',// same principles as above
                    data: productionPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#5EEBA7'
                },
                {
                    label: 'PM Unplanned downtime', // same principles as above
                    data: unplannedPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#B08FFF'
                },
                {
                    label: 'PM Gap', // same principles as above
                    data: gapPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#9149EB'
                },
            ],
        },
        options: { // chart options
            title: {
                text: 'Line B - Gap production time alalysis' // chart title
            },
            tooltips: { // tooltips options
                callbacks: {
                    label: function (tooltipItems, data) {
                        let p = data.datasets[tooltipItems.datasetIndex].label;
                        if (p == 'Overall efficiency') {  // if data is efficiency 
                            return p + ': ' + tooltipItems.yLabel + ' %'; // add : and % after the values
                        } // else
                        return p + ': ' + tooltipItems.yLabel + ' min.'; // add : and 'min.' after the values
                    }
                }

            },
            scales: {
                xAxes: [{ // x asis
                    stacked: true, // option to have stacked bars
                    scaleLabel: {
                        display: true, // display label
                        labelString: 'Date', // name it 'Date'
                        fontStyle: 'italic' // italic font
                    },
                }],
                yAxes: [{ // y axis
                    id: 'A',  // give these option ID to then use for seperate chart sections
                    position: 'left', // position to left - will be used for all minutes related values
                    stacked: true, // stacked bars
                    scaleLabel: {
                        display: true,
                        labelString: 'Production time',
                        fontStyle: 'italic'
                    }
                },
                {
                    id: 'B', // give these option ID to then use for seperate chart sections
                    position: 'right', // position to right - will be used for efficiency related values
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Efficiency %',
                        fontStyle: 'italic'
                    },
                    ticks: { // no matter on used values display y axis as 0 - 120 (in theory % shouldnt go over 100% but it does due to incorrect data recorded)
                        max: 120,
                        min: 0
                    },
                },]

            }
        }
    })
    
  }else{  // update values and the chart
    
    myChartB.data.labels = xVals;
    myChartB.data.datasets[0].data=efficiency;
    myChartB.data.datasets[1].data=breaksAM;
    myChartB.data.datasets[2].data=plannedAM;
    myChartB.data.datasets[3].data=productionAM;
    myChartB.data.datasets[4].data=unplannedAM;
    myChartB.data.datasets[5].data=gapAM;
    myChartB.data.datasets[6].data=breaksPM;
    myChartB.data.datasets[7].data=plannedPM;
    myChartB.data.datasets[8].data=productionPM;
    myChartB.data.datasets[9].data=unplannedPM;
    myChartB.data.datasets[10].data=gapPM;
    
    myChartB.update();
    
  }
  
    
}
async function chartItC(filterFrom,filterTo) { // chart function for line C
    const response = await fetch('/api'); // get data from api/database
    const data = await response.json(); // store data
   

    // Line C

    let xVals = []; // x axis values array
    let yAvailableAM = []; // array of full available time for AM
    let breaksAM = []; // array of breaks AM
    let plannedAM = []; // array of planned time deductions AM
    let productionAM = []; // array of unplanned time deductions AM
    let unplannedAM = []; // array of production time deductions AM
    let gapAM = []; // array of gap AM

    let yAvailablePM = []; // array of full available time for PM
    let breaksPM = []; // array of breaks PM
    let plannedPM = []; // array of planned time deductions PM
    let productionPM = []; // array of unplanned time deductions PM
    let unplannedPM = []; // array of production time deductions PM
    let gapPM = []; // array of gap PM

    let totalTimeAM = []; // array to store total productive time for AM
    let totalTimePM = []; // array to store total productive time for PM
    let efficiency = []; // array to store efficiency calculations

    let n = 0; // assign new variable to 0, which will be used within below for loop, needed to 'grab' correct record and store them

    
    for (let i = 0; i < data.length; i++) { // loop through until reached end of the database
        var condition = data[i].line == 'C'; // set up condition, find and use only data for line C
        if(typeof filterFrom != 'undefined' && typeof filterTo != 'undefined'){ // if function; if filter date entered use dates within the range (below)
            condition = data[i].line == 'C' && data[i].date >= filterFrom && data[i].date <= filterTo;
        } // else get data within date filter; use all data for line C
        if (condition) {

            // I had issue with gaps in my charts so instead of just assigning data to arrays I needed to use .push(), so records that we are not interested in
            // will be skipped. 

            xVals.push(new Date(data[i].date).toDateString());  // add new items to the end of an array, and returns the new length (dates in string format)

            // AM data

            let timeTempStart = data[i].amStartTime; // get times from data and assign to variable to be able to then convert times into min as below
            let timeTempStop = data[i].amEndTime;
            let a = timeTempStart.split(':'); // convert times into minutes https://stackoverflow.com/questions/32885682/convert-hhmmss-into-minute-using-javascript
            let b = timeTempStop.split(':');
            let minutesA = (+a[0]) * 60 + (+a[1]);
            let minutesB = (+b[0]) * 60 + (+b[1]);
            yAvailableAM.push(minutesB - minutesA); // calculate full available time for the shift and push it to the array

            let ax = yAvailableAM[n]; // assign to the variable for later calculations, using 'n'

            breaksAM.push(data[i].amBreaks); // assign breaks time to array
            plannedAM.push(data[i].amPlanned); // assign planned stops time to array
            productionAM.push(data[i].amProduction); // assign production time to array
            unplannedAM.push(data[i].amUnplanned); // assign unplanned stops time to array

            gapAM.push((ax - breaksAM[n] - plannedAM[n] - productionAM[n] - unplannedAM[n])); // calculate unused time and store

            totalTimeAM.push((ax - gapAM[n] - unplannedAM[n])); // calculate productive time (time spent on production, breaks or planned stops)
            let totalAM = totalTimeAM[n]; // assign to variable for later calculations

            // PM data - same principles as AM

            let timeTempStart2 = data[i].pmStartTime;
            let timeTempStop2 = data[i].pmEndTime;
            let c = timeTempStart2.split(':');
            let d = timeTempStop2.split(':');
            if(d[0] != 0){
                let minutesC = (+c[0]) * 60 + (+c[1]);
                let minutesD = (+d[0]) * 60 + (+d[1]);
                yAvailablePM.push(minutesD - minutesC);
            }else if(d[1] != 0){
                let minutesC = (+c[0]) * 60 + (+c[1]);
                let minutesD = (+24) * 60 + (+d[1]);
                yAvailablePM.push(minutesD - minutesC);
            }else{
                yAvailablePM.push(0);
            }
            let av = yAvailablePM[n];

            breaksPM.push(data[i].pmBreaks);
            plannedPM.push(data[i].pmPlanned);
            productionPM.push(data[i].pmProduction);
            unplannedPM.push(data[i].pmUnplanned);

            gapPM.push((av - breaksPM[n] - plannedPM[n] - productionPM[n] - unplannedPM[n]));

            totalTimePM.push((av - gapPM[n] - unplannedPM[n]));
            let totalPM = totalTimePM[n];

            //Calculate overall efficiency
            let f = totalPM + totalAM; // add both productive times together and store in variable
            let g = ax + av; // add both full available times

            efficiency[n] = ((f / g) * 100).toFixed(2); // calculate efficiency % and display 2 decimal places, asign to the array

            n++; // increment
        }
    }
  
    
  if(!myChartC){ // if chart havent been executed yet - create it > else update
  
    //Chart line C
    const ctw = document.getElementById('chartC').getContext('2d'); //connect dom element 
    
    myChartC = new Chart(ctw, { //new chart object
        type: 'bar', // bar chart
        data: {
            labels: xVals,  // use xVals (dates) as labels on x axies
            datasets: [
                {
                    label: 'Overall efficiency', // data label
                    data: efficiency, // use data stored in efficiency[]
                    fill: false, // no fill
                    type: 'line', // line chart (using 2 types of charts within the project)
                    yAxisID: 'B', // relate to y axis that is specyfied as 'B' (below in options)
                    borderColor: '#022F99', // border colour
                    backgroundColor: '#469BEB' // background colour
                },
                {
                    label: 'AM Breaks', // data label
                    data: breaksAM, // use data stored in breaksAM[]
                    stack: '0', // assign to first stack (basically I have two production shifts and I wanted to have data grouped on the chart accordingly to it)
                    yAxisID: 'A', // relate to y axis that is specyfied as 'A' (below in options)
                    backgroundColor: '#FFF5BA' // background colour
                },
                {
                    label: 'AM Planned downtime', // same principles as above
                    data: plannedAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FFE291'
                },
                {
                    label: 'AM Production time', // same principles as above
                    data: productionAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FBCC6E'
                },
                {
                    label: 'AM Unplanned downtime', // same principles as above
                    data: unplannedAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FFA7AB'
                },
                {
                    label: 'AM Gap', // same principles as above
                    data: gapAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FA725C'
                },
                {
                    label: 'PM Breaks', // same principles as above but different stack number
                    data: breaksPM,
                    stack: '1', // assign to second stack as relates to another shift
                    yAxisID: 'A',
                    backgroundColor: '#D0FFBA'
                },
                {
                    label: 'PM Planned downtime', // same principles as above
                    data: plannedPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#A6FF99'
                },
                {
                    label: 'PM Production time',// same principles as above
                    data: productionPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#5EEBA7'
                },
                {
                    label: 'PM Unplanned downtime', // same principles as above
                    data: unplannedPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#B08FFF'
                },
                {
                    label: 'PM Gap', // same principles as above
                    data: gapPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#9149EB'
                },
            ],
        },
        options: { // chart options
            title: {
                text: 'Line C - Gap production time alalysis' // chart title
            },
            tooltips: { // tooltips options
                callbacks: {
                    label: function (tooltipItems, data) {
                        let p = data.datasets[tooltipItems.datasetIndex].label;
                        if (p == 'Overall efficiency') {  // if data is efficiency 
                            return p + ': ' + tooltipItems.yLabel + ' %'; // add : and % after the values
                        } // else
                        return p + ': ' + tooltipItems.yLabel + ' min.'; // add : and 'min.' after the values
                    }
                }

            },
            scales: {
                xAxes: [{ // x asis
                    stacked: true, // option to have stacked bars
                    scaleLabel: {
                        display: true, // display label
                        labelString: 'Date', // name it 'Date'
                        fontStyle: 'italic' // italic font
                    },
                }],
                yAxes: [{ // y axis
                    id: 'A',  // give these option ID to then use for seperate chart sections
                    position: 'left', // position to left - will be used for all minutes related values
                    stacked: true, // stacked bars
                    scaleLabel: {
                        display: true,
                        labelString: 'Production time',
                        fontStyle: 'italic'
                    }
                },
                {
                    id: 'B', // give these option ID to then use for seperate chart sections
                    position: 'right', // position to right - will be used for efficiency related values
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Efficiency %',
                        fontStyle: 'italic'
                    },
                    ticks: { // no matter on used values display y axis as 0 - 120 (in theory % shouldnt go over 100% but it does due to incorrect data recorded)
                        max: 120,
                        min: 0
                    },
                },]

            }
        }
    })
    
  }else{  // update values and the chart
    
    myChartC.data.labels = xVals;
    myChartC.data.datasets[0].data=efficiency;
    myChartC.data.datasets[1].data=breaksAM;
    myChartC.data.datasets[2].data=plannedAM;
    myChartC.data.datasets[3].data=productionAM;
    myChartC.data.datasets[4].data=unplannedAM;
    myChartC.data.datasets[5].data=gapAM;
    myChartC.data.datasets[6].data=breaksPM;
    myChartC.data.datasets[7].data=plannedPM;
    myChartC.data.datasets[8].data=productionPM;
    myChartC.data.datasets[9].data=unplannedPM;
    myChartC.data.datasets[10].data=gapPM;
    
    myChartC.update();
    
  }
  
    
}
async function chartItD(filterFrom,filterTo) { // chart function for line D
    const response = await fetch('/api'); // get data from api/database
    const data = await response.json(); // store data
   

    // Line D

    let xVals = []; // x axis values array
    let yAvailableAM = []; // array of full available time for AM
    let breaksAM = []; // array of breaks AM
    let plannedAM = []; // array of planned time deductions AM
    let productionAM = []; // array of unplanned time deductions AM
    let unplannedAM = []; // array of production time deductions AM
    let gapAM = []; // array of gap AM

    let yAvailablePM = []; // array of full available time for PM
    let breaksPM = []; // array of breaks PM
    let plannedPM = []; // array of planned time deductions PM
    let productionPM = []; // array of unplanned time deductions PM
    let unplannedPM = []; // array of production time deductions PM
    let gapPM = []; // array of gap PM

    let totalTimeAM = []; // array to store total productive time for AM
    let totalTimePM = []; // array to store total productive time for PM
    let efficiency = []; // array to store efficiency calculations

    let n = 0; // assign new variable to 0, which will be used within below for loop, needed to 'grab' correct record and store them

    
    for (let i = 0; i < data.length; i++) { // loop through until reached end of the database
        var condition = data[i].line == 'D'; // set up condition, find and use only data for line D
        if(typeof filterFrom != 'undefined' && typeof filterTo != 'undefined'){ // if function; if filter date entered use dates within the range (below)
            condition = data[i].line == 'D' && data[i].date >= filterFrom && data[i].date <= filterTo;
        } // else get data within date filter; use all data for line D
        if (condition) {

            // I had issue with gaps in my charts so instead of just assigning data to arrays I needed to use .push(), so records that we are not interested in
            // will be skipped. 

            xVals.push(new Date(data[i].date).toDateString());  // add new items to the end of an array, and returns the new length (dates in string format)

            // AM data

            let timeTempStart = data[i].amStartTime; // get times from data and assign to variable to be able to then convert times into min as below
            let timeTempStop = data[i].amEndTime;
            let a = timeTempStart.split(':'); // convert times into minutes https://stackoverflow.com/questions/32885682/convert-hhmmss-into-minute-using-javascript
            let b = timeTempStop.split(':');
            let minutesA = (+a[0]) * 60 + (+a[1]);
            let minutesB = (+b[0]) * 60 + (+b[1]);
            yAvailableAM.push(minutesB - minutesA); // calculate full available time for the shift and push it to the array

            let ax = yAvailableAM[n]; // assign to the variable for later calculations, using 'n'

            breaksAM.push(data[i].amBreaks); // assign breaks time to array
            plannedAM.push(data[i].amPlanned); // assign planned stops time to array
            productionAM.push(data[i].amProduction); // assign production time to array
            unplannedAM.push(data[i].amUnplanned); // assign unplanned stops time to array

            gapAM.push((ax - breaksAM[n] - plannedAM[n] - productionAM[n] - unplannedAM[n])); // calculate unused time and store

            totalTimeAM.push((ax - gapAM[n] - unplannedAM[n])); // calculate productive time (time spent on production, breaks or planned stops)
            let totalAM = totalTimeAM[n]; // assign to variable for later calculations

            // PM data - same principles as AM
            let timeTempStart2 = data[i].pmStartTime;
            let timeTempStop2 = data[i].pmEndTime;
            let c = timeTempStart2.split(':');
            let d = timeTempStop2.split(':');
            if(d[0] != 0){
                let minutesC = (+c[0]) * 60 + (+c[1]);
                let minutesD = (+d[0]) * 60 + (+d[1]);
                yAvailablePM.push(minutesD - minutesC);
            }else if(d[1] != 0){
                let minutesC = (+c[0]) * 60 + (+c[1]);
                let minutesD = (+24) * 60 + (+d[1]);
                yAvailablePM.push(minutesD - minutesC);
            }else{
                yAvailablePM.push(0);
            }
            let av = yAvailablePM[n];

            breaksPM.push(data[i].pmBreaks);
            plannedPM.push(data[i].pmPlanned);
            productionPM.push(data[i].pmProduction);
            unplannedPM.push(data[i].pmUnplanned);

            gapPM.push((av - breaksPM[n] - plannedPM[n] - productionPM[n] - unplannedPM[n]));

            totalTimePM.push((av - gapPM[n] - unplannedPM[n]));
            let totalPM = totalTimePM[n];

            //Calculate overall efficiency
            let f = totalPM + totalAM; // add both productive times together and store in variable
            let g = ax + av; // add both full available times

            efficiency[n] = ((f / g) * 100).toFixed(2); // calculate efficiency % and display 2 decimal places, asign to the array

            n++; // increment
        }
    }
  
    
  if(!myChartD){ // if chart havent been executed yet - create it > else update
  
    //Chart line D
    const ctr = document.getElementById('chartD').getContext('2d'); //connect dom element 
    
    myChartD = new Chart(ctr, { //new chart object
        type: 'bar', // bar chart
        data: {
            labels: xVals,  // use xVals (dates) as labels on x axies
            datasets: [
                {
                    label: 'Overall efficiency', // data label
                    data: efficiency, // use data stored in efficiency[]
                    fill: false, // no fill
                    type: 'line', // line chart (using 2 types of charts within the project)
                    yAxisID: 'B', // relate to y axis that is specyfied as 'B' (below in options)
                    borderColor: '#022F99', // border colour
                    backgroundColor: '#469BEB' // background colour
                },
                {
                    label: 'AM Breaks', // data label
                    data: breaksAM, // use data stored in breaksAM[]
                    stack: '0', // assign to first stack (basically I have two production shifts and I wanted to have data grouped on the chart accordingly to it)
                    yAxisID: 'A', // relate to y axis that is specyfied as 'A' (below in options)
                    backgroundColor: '#FFF5BA' // background colour
                },
                {
                    label: 'AM Planned downtime', // same principles as above
                    data: plannedAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FFE291'
                },
                {
                    label: 'AM Production time', // same principles as above
                    data: productionAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FBCC6E'
                },
                {
                    label: 'AM Unplanned downtime', // same principles as above
                    data: unplannedAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FFA7AB'
                },
                {
                    label: 'AM Gap', // same principles as above
                    data: gapAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FA725C'
                },
                {
                    label: 'PM Breaks', // same principles as above but different stack number
                    data: breaksPM,
                    stack: '1', // assign to second stack as relates to another shift
                    yAxisID: 'A',
                    backgroundColor: '#D0FFBA'
                },
                {
                    label: 'PM Planned downtime', // same principles as above
                    data: plannedPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#A6FF99'
                },
                {
                    label: 'PM Production time',// same principles as above
                    data: productionPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#5EEBA7'
                },
                {
                    label: 'PM Unplanned downtime', // same principles as above
                    data: unplannedPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#B08FFF'
                },
                {
                    label: 'PM Gap', // same principles as above
                    data: gapPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#9149EB'
                },
            ],
        },
        options: { // chart options
            title: {
                text: 'Line D - Gap production time alalysis' // chart title
            },
            tooltips: { // tooltips options
                callbacks: {
                    label: function (tooltipItems, data) {
                        let p = data.datasets[tooltipItems.datasetIndex].label;
                        if (p == 'Overall efficiency') {  // if data is efficiency 
                            return p + ': ' + tooltipItems.yLabel + ' %'; // add : and % after the values
                        } // else
                        return p + ': ' + tooltipItems.yLabel + ' min.'; // add : and 'min.' after the values
                    }
                }

            },
            scales: {
                xAxes: [{ // x asis
                    stacked: true, // option to have stacked bars
                    scaleLabel: {
                        display: true, // display label
                        labelString: 'Date', // name it 'Date'
                        fontStyle: 'italic' // italic font
                    },
                }],
                yAxes: [{ // y axis
                    id: 'A',  // give these option ID to then use for seperate chart sections
                    position: 'left', // position to left - will be used for all minutes related values
                    stacked: true, // stacked bars
                    scaleLabel: {
                        display: true,
                        labelString: 'Production time',
                        fontStyle: 'italic'
                    }
                },
                {
                    id: 'B', // give these option ID to then use for seperate chart sections
                    position: 'right', // position to right - will be used for efficiency related values
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Efficiency %',
                        fontStyle: 'italic'
                    },
                    ticks: { // no matter on used values display y axis as 0 - 120 (in theory % shouldnt go over 100% but it does due to incorrect data recorded)
                        max: 120,
                        min: 0
                    },
                },]

            }
        }
    })
    
  }else{  // update values and the chart
    
    myChartD.data.labels = xVals;
    myChartD.data.datasets[0].data=efficiency;
    myChartD.data.datasets[1].data=breaksAM;
    myChartD.data.datasets[2].data=plannedAM;
    myChartD.data.datasets[3].data=productionAM;
    myChartD.data.datasets[4].data=unplannedAM;
    myChartD.data.datasets[5].data=gapAM;
    myChartD.data.datasets[6].data=breaksPM;
    myChartD.data.datasets[7].data=plannedPM;
    myChartD.data.datasets[8].data=productionPM;
    myChartD.data.datasets[9].data=unplannedPM;
    myChartD.data.datasets[10].data=gapPM;
    
    myChartD.update();
    
  }
  
    
}
