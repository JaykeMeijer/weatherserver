var reports = [];
var temperature = [];
var humidity = [];
var voltage = [];
var charts = {};
var alldevices = {};
var refresh = 10000;
var timeout = null;
var interval = null;
var active_device = 1;
var cookie = new Cookiemonster();

function init() { 
    interval = cookie.get('interval');
    if (interval == null) {
        interval = 604800;
    } else {
        interval = parseInt(interval);
    }
    show_loading();
    $.ajax({
        type: 'POST',
        url : 'http://jayke.nl:8888/web/',
        data: JSON.stringify({'type': 'get_device_list', 'data':{}}),
        success: handleDeviceList,
        error: handleError
    });
}

function Cookiemonster() {
    this.data = {};
    self = this; 
    self.expiry = new Date();
    self.expiry.setTime(self.expiry.getTime() + (10000*24*60*60*1000));

    this.get = function(key) {
        if (key in self.data) {
            return self.data[key];
        } else {
            return null;
        }
    }

    this.set = function(key, value) {
        self.data[key] = value;
        self.write();
    }

    this.write = function() {
        for (var key in self.data) {
            if (self.data.hasOwnProperty(key) && key != 'expires'
                    && key != undefined) {
                document.cookie = 
                    key + '=' + self.data[key] + '; expires=' +
                    self.expiry.toUTCString();
            }
        }
    }

    content = document.cookie;
    if (content != '') {
        content_s = content.split('; ');
        for (var i = 0; i < content_s.length; i++) {
            pair = content_s[i].split('=');
            this.data[pair[0]] = pair[1];
        }
    }
}

function toggleMenu() {
    if ($('#menu').is(':visible')) {
        $('#menu').slideUp();
    } else {
        $('#menu').slideDown();
    }
}

function toggleDevMenu() {
    if ($('#devices-mobile-list').is(':visible')) {
        $('#devices-mobile-list').slideUp();
        $('#devices-mobile-icon').html('<i class="fa fa-caret-down fa-2x"></i>');
    } else {
        $('#devices-mobile-list').slideDown();
        $('#devices-mobile-icon').html('<i class="fa fa-caret-up fa-2x"></i>');
    }
}

function timeframe(seconds) {
    $('#menu').slideUp();

    interval = seconds;
    loadDevice(active_device);
    cookie.set('interval', seconds);
}

function loadDevice(device) {
    show_loading();

    if (timeout != null) {
        clearTimeout(timeout);
        timeout = null;
    }
 

    chartids = ['#tempChart', '#humiChart', '#voltChart'];
    for (var i = 0; i < chartids.length; i++) {
        cid = chartids[i];
        cv = $(cid)[0];
        cv.getContext('2d').clearRect(0, 0, cv.width, cv.height);
        if (cid in charts) {
            charts[cid].destroy();
        }
    }
    reports = [];
    temperature = [];
    humidity = [];
    voltage = [];
    charts = {};
    $('#temp').find('.card-content').append('<div class=graph-loading>Your graph is being created...</div>');
    $('#humi').find('.card-content').append('<div class=graph-loading>Your graph is being created...</div>');
    $('#volt').find('.card-content').append('<div class=graph-loading>Your graph is being created...</div>');
    get_info_for_device(device);
    cookie.set('device', device);
    active_device = device;
}

function show_loading(callback) {
    $('#loading').slideDown(complete=callback); 
}

function hide_loading(callback) {
    $('#loading').slideUp(complete=callback);
}

function handleDeviceList(data, textStatus, jqXHR) {
    function compare(a,b) {
        a = a.name.toLowerCase();
        b = b.name.toLowerCase();
        if (a < b)
          return -1;
        if (a > b)
            return 1;
          return 0;
    }

    devices = JSON.parse(data).sort(compare);
    for (var i = 0; i < devices.length; i++) {
        device = devices[i];
        alldevices[device.id] = device;       
        $('#devicebar #devices').append(
            '<div class=devicebar-device id=devicebar-device-' + device.id +
            ' onclick="loadDevice(' + device.id + ');">' +
            device.name + '</div>');
        $('#devices-mobile-list').append(
            '<div class=devicebar-device-mobile id=devicebar-device-mobile-' + device.id +
            ' onclick="loadDevice(' + device.id + ');toggleDevMenu();">' +
            device.name + '</div>');
    }

    cDevice = cookie.get('device');
    if (cDevice != null) {
        cDevice = parseInt(cDevice);
        if (cDevice in alldevices) {
            loadDevice(cDevice);
            return
        }
    }
    loadDevice(devices[0].id);
}

function get_info_for_device(device_id) {
    show_loading();
    $('.devicebar-device').removeClass('devicebar-device-active');
    $('#devicebar-device-' + device_id).addClass('devicebar-device-active');

    $('.devicebar-device-mobile').removeClass('devicebar-device-active');
    $('#devicebar-device-mobile-' + device_id).addClass('devicebar-device-active');

    $.ajax({
        type: 'POST',
        url: 'http://jayke.nl:8888/web/',
        data: JSON.stringify({'type': 'get_device', 'data':{'device': device_id}}),
        success: handleDevice,
        error: handleError
    });

    $.ajax({
        type: 'POST',
        url : 'http://jayke.nl:8888/web/',
        data: JSON.stringify({'type': 'get_report', 'data':{'device': device_id, 'last': interval}}),
        success: handleReports,
        error: handleError
   });
   timeout = setTimeout(function() {
       update(device_id);
   }, refresh);
}

function update(device_id) {
    // get latest report
    if (reports.length > 0) {
        latest = reports[0];
    } else {
        latest = {'time': '1970-01-01 00:00:00'};
    }
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
    timeout = setTimeout(function() {
       update(device_id);
   }, refresh);
}

function handleUpdates(data, textStatus, jqXHR) {
    appendReports(JSON.parse(data)); 
    updateCurrent();
}

function handleDevice(data, textStatus, jqXHR) {
    device = JSON.parse(data);
    $('#devices-mobile-active').text(device.prettyname);
    $('#sensor-name').text(device.prettyname);
    $('#sensor-location-value').text(device.location);
    $('#sensor-timezone-value').text(
        device.timezone + ' (UTC ' + moment().tz(device.timezone).format('Z') + ')');
}

function handleReports(data, textStatus, jqXHR) {
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
    t = (temperature.length > 0 ? temperature[0].y + '&deg;C' : '?');
    $('#current-temperature-value').html(t);
    h = (humidity.length > 0 ? humidity[0].y + '%' : '?');
    $('#current-humidity-value').html(h);
    if (reports.length > 0) {
        measured = moment(reports[0].time);
        timestring = measured.format('D MMMM YYYY [at] HH:mm:ss') + ' (' + measured.fromNow() + ')'; 
        $('#current-time-value').text(timestring);
    } else {
        $('#current-time-value').text('No reports received');
    }
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

    // get min and max values
    var min = 1000;
    var max = -1000;
    for (var i = 0; i < data.length; i++) {
        if (data[i].y < min) {
            min = data[i].y;
        }
        if (data[i].y > max) {
            max = data[i].y;
        }           
    }
    // Determine delta between min and max and use 1% of that as
    // buffer around the values
    var delta = max - min;
    max = max + delta * 0.01;
    min = min - delta * 0.01;

    var ctx = $(canvas);
    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: graph_data,
        options: {
            scales: {
                xAxes: [{
                    type: 'time',
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: unit
                    },
                    ticks: {
                        suggestedMin: min,
                        suggestedMax: max
                    }
                }]
            },
            legend: {
                display: false
            },
            pan: {
                enabled: true,
                mode: 'x'
            },
            zoom: {
                enabled: true,
                mode: 'x'
            }
        }
    });
    charts[canvas] = myLineChart;
    myLineChart.resetZoom();
    $(canvas).parent().find('.graph-loading').remove();
}

function handleError(jqXHR, textStatus, error) {
    console.log(error);
    hide_loading();
}

function getReports(type) {
    switch(type) {
        case 'temperature': return temperature;
        case 'humidity': return humidity;
        case 'voltage': return voltage;
        default: return [];
    }
}

function showList(type) {
    if ($('#listview').is(':visible')) {
        hideList();
    }
    liststring = '<table>';
    report_list = jQuery.extend([], getReports(type));
    report_list.reverse();
    for (var i = 0; i < report_list.length; i++) {
        var r = report_list[i];
        liststring +=
            '<tr>' +
                '<td>' + r.x + '</td>' +
                '<td>' + r.y + '</td>' +
            '</tr>';
    }
    liststring += '</table>';
    $('#listview_title').text(type);
    $('#listview_content').html(liststring);
    $('#listview').slideDown();
}

function hideList() {
    $('#listview').slideUp();
}
