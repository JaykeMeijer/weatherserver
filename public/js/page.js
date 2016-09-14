function init() {
    $.ajax({
        type: 'POST',
        url : 'http://jayke.nl:8888/web/',
        data: JSON.stringify({'type': 'get_report', 'data':{'device': 'test', 'last': 3600}}),
        //data: JSON.stringify({'type': 'get_report', 'data':{'device': 'test', 'start': '2016-09-13 08:00:00',
        //                      'end': '2016-09-13 08:20:00'}}),
        success: handleReports,
        error: handleError
   });
}

function getMonth(num) {
    switch(num) {
        case 1: return 'January';
        case 2: return 'February';
        case 3: return 'March';
        case 4: return 'April';
        case 5: return 'May';
        case 6: return 'June';
        case 7: return 'July';
        case 8: return 'August';
        case 9: return 'September';
        case 10: return 'October';
        case 11: return 'November';
        case 12: return 'December';
    }
}

function cleanTime(timestamp) {
    time = new Date(timestamp);
    return time.getDate() + ' ' +
           getMonth(time.getMonth()) + ' ' +
           time.getFullYear() + ' ' +
           ('0' + time.getHours()).slice(-2) + ':' +
           ('0' + time.getMinutes()).slice(-2) + ':' +
           ('0' + time.getSeconds()).slice(-2);
}

function handleReports(data, textStatus, jqXHR) {
    reports = JSON.parse(data);
    temperature = [];
    for (i = 0; i < reports.length; i++) {
        report = reports[i];
        switch(report.report_type) {
            case 'temperature':
                $('#temp').append(report.time + ': ' + report.value + '&deg;C<br />');
                //temperature.labels.push(cleanTime(report.time));
                temperature.push({'x': report.time, 'y': parseFloat(report.value)});
                break;
            case 'humidity':
                $('#humi').append(report.time + ': ' + report.value + '%<br />');
                break;
            case 'voltage':
                $('#volt').append(report.time + ': ' + report.value + 'V<br />');
        } 
    }
    createGraph(temperature);
}

function createGraph(data) {
    console.log(data);
    var graph_data = {
        datasets: [
            {
                label: 'Temperature',
                data: data,
                fill: false,
                lineTension: 0.1,
                backgroundColor: "rgba(75,192,192,0.4)",
                borderColor: "rgba(75,192,192,1)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
            }
        ]
    }

    var ctx = $('#tempChart');
    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: graph_data,
        options: {
            scales: {
                xAxes: [{
                    type: 'time',
                    /*time: {
                        unit: 'hour'
                    }*/
                }]
            }
        }
    });
}

function handleError(jqXHR, textStatus, error) {
    console.log(error);
}

function sendReport() {
    var data = {temperature: $('#temp_send').val(),
                humidity: $('#humi_send').val(),
                voltage: $('#volt_send').val()};
    var packet = {device: 1,
                  type: 'store_reports',
                  data: data};
    $.ajax({
        type: 'POST',
        url: 'http://jayke.nl:8888/report/',
        data: JSON.stringify(packet),
        success: function() {location.reload()},
        error: handleError
    });
}
