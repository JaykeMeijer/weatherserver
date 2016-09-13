function init() {
    $.ajax({
        type: 'POST',
        url : 'http://jayke.nl:8888/web/',
        data: JSON.stringify({'type': 'get_report', 'data':{'device': 'test', 'last': 360000}}),
        success: handleReports,
        error: handleError
   });
}

function handleReports(data, textStatus, jqXHR) {
    console.log(data);
}

function handleError(jqXHR, textStatus, error) {
    console.log(error);
}
