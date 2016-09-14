function init() {
    $.ajax({
        type: 'POST',
        url : 'http://jayke.nl:8888/web/',
        data: JSON.stringify({'type': 'get_report', 'data':{'device': 'test', 'last': 360000}}),
        //data: JSON.stringify({'type': 'get_report', 'data':{'device': 'test', 'start': '2016-09-13 08:00:01',
        //                      'end': '2016-09-13 08:20:00'}}),
        success: handleReports,
        error: handleError
   });
}

function handleReports(data, textStatus, jqXHR) {
    reports = JSON.parse(data);
    for (i = 0; i < reports.length; i++) {
        report = reports[i];
        switch(report.report_type) {
            case 'temperature':
                $('#temp').append(report.time + ': ' + report.value + '&deg;C<br />');
                break;
            case 'humidity':
                $('#humi').append(report.time + ': ' + report.value + '%<br />');
                break;
            case 'voltage':
                $('#volt').append(report.time + ': ' + report.value + 'V<br />');
        } 
    }
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
        error: handleError()});
}
