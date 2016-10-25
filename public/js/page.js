reports = [];
temperature = [];
humidity = [];
voltage = [];
charts = {};
refresh = 10000;

function init() { 
    show_loading();
    $.ajax({
        type: 'POST',
        url : 'http://jayke.nl:8888/web/',
        data: JSON.stringify({'type': 'get_device_list', 'data':{}}),
        success: handleDeviceList,
        error: handleError
    });
}

function show_loading(callback) {
    $('#loading').slideDown(complete=callback); 
}

function hide_loading(callback) {
    $('#loading').slideUp(complete=callback);
}

function handleDeviceList(data, textStatus, jqXHR) {
    devices = JSON.parse(data);
    for (var i = 0; i < devices.length; i++) {
        device = devices[i];
        $('#devicebar').append('<div class=devicebar-device id=devicebar-device-' + device.id + '>' +
                               device.name + '</div>');
    }
    get_info_for_device(1);
}

function get_info_for_device(device_id) {
    show_loading();
    $('.devicebar-device').removeClass('devicebar-device-active');
    $('#devicebar-device-' + device_id).addClass('devicebar-device-active');
    $.ajax({
        type: 'POST',
        url : 'http://jayke.nl:8888/web/',
        data: JSON.stringify({'type': 'get_device', 'data':{'device': device_id}}),
        success: handleDevice,
        error: handleError
    });

    $.ajax({
        type: 'POST',
        url : 'http://jayke.nl:8888/web/',
        data: JSON.stringify({'type': 'get_report', 'data':{'device': device_id, 'last': 864000}}),
        success: handleReports,
        error: handleError
   });
   setTimeout(function() {
       update(device_id);
   }, refresh);
}

function update(device_id) {
    // get latest report
    latest = reports[0];
    $.ajax({
        type: 'POST',
        url : 'http://jayke.nl:8888/web/',
        data: JSON.stringify({
            'type': 'get_report',
            'data': {
                'device': device_id,
                'start': moment(latest.time).add(1, 'ms').format('YYYY-MM-DD HH:mm:ss.SSSSSS')
            }
        }),
        success: handleUpdates,
        error: handleError
   });
   setTimeout(function() {
       update(device_id);
   }, refresh);
}

function handleUpdates(data, textStatus, jqXHR) {
    appendReports(JSON.parse(data)); 
    updateCurrent();
}

function handleDevice(data, textStatus, jqXHR) {
    device = JSON.parse(data);
    $('#sensor-name').text(device.name);
    $('#sensor-location-value').text(device.location);
    $('#sensor-timezone-value').text(
        device.timezone + ' (UTC ' + moment().tz(device.timezone).format('Z') + ')');
}

function handleReports(data, textStatus, jqXHR) {
    $('#temp').find('.card-content').append('<div class=graph-loading>Your graph is being created...</div>');
    $('#humi').find('.card-content').append('<div class=graph-loading>Your graph is being created...</div>');
    new_reports = JSON.parse(data);
    appendReports(new_reports);
    updateCurrent();

    hide_loading(function() {
        createGraph(temperature, '#tempChart', 'Temperature', '\u00B0C');
        createGraph(humidity, '#humiChart', 'Humidity', '%');
        createGraph(voltage, '#voltChart', 'Voltage', 'V');
    });
}

function appendReports(new_reports, update=false) {
    //new_reports.reverse();
    for (i = 0; i < new_reports.length; i++) {
        report = new_reports[i];
        reports.unshift(report)
        switch(report.report_type) {
            case 'temperature':
                chart = '#tempChart';
                temperature.unshift({'x': report.time, 'y': parseFloat(report.value)});
                break;
            case 'humidity':
                chart = '#humiChart';
                humidity.unshift({'x': report.time, 'y': parseFloat(report.value)});
                break;
            case 'voltage':
                chart = '#voltChart';
                voltage.unshift({'x': report.time, 'y': parseFloat(report.value)});
                break;
        }
        if (update) {
            charts[chart].addData({'x': report.time, 'y': parseFloat(report.value)});
        }
    }
}

function updateCurrent() {
    $('#current-temperature-value').html(temperature[0].y + '&deg;C');
    $('#current-humidity-value').html(humidity[0].y + '%');
    measured = moment(reports[0].time);
    timestring = measured.format('D MMMM YYYY [at] HH:mm:ss') + ' (' + measured.fromNow() + ')'; 
    $('#current-time-value').text(timestring);
}

function createGraph(data, canvas, label, unit) {
    var graph_data = {
        datasets: [
            {
                label: label, 
                data: data,
                fill: false,
                lineTension: 0.1,
                backgroundColor: "red",
                borderColor: "red",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "black",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 1,
                pointRadius: 0,
                pointHitRadius: 10,
            }
        ]
    }

    var ctx = $(canvas);
    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: graph_data,
        options: {
            scales: {
                xAxes: [{
                    type: 'time',
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: unit
                    }
                }]
            },
            legend: {
                display: false
            }
        }
    });
    charts[canvas] = myLineChart;
    $(canvas).parent().find('.graph-loading').remove();
}

function handleError(jqXHR, textStatus, error) {
    console.log(error);
    hide_loading();
}
