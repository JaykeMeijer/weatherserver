import json
import datetime
import devices
from database import database


def store_report(device_id, report_type, value):
    database.store_report(device_id, report_type, value)


def get_reports(device_id, report_type=None, last=None, start=None, end=None):
    if last is not None:
        reports = database.get_reports_since(device_id, report_type, last, admin=True)
    else:
        reports = database.get_reports_between(device_id, report_type, start, end, admin=True)

    reports_result = []
    for r in reports:
        reports_result.append({
            'id': int(r['id']),
            'time': str(r['time']),
            'report_type': str(r['report_type']),
            'value': str(r['value'])
        })
    return reports_result


def get_report_type_id(name_or_id):
    try:
        rt_id = int(name_or_id)
        if database.report_type_id_exists(rt_id):
            return rt_id
    except ValueError:
        pass

    return database.get_report_type_id(name_or_id)


def handle_get_reports(data):
    if 'device' not in data:
        return 400, 'Missing device'

    device_id = devices.get_id(data['device'])
    if device_id is None:
        return 400, 'Unknown device'

    if 'report_type' in data:
        rt_id = get_report_type_id(data['report_type'])
        if rt_id is None:
            return 400, 'Unknown report type'
    else:
        rt_id = None

    if 'last' in data:
        reports = get_reports(device_id,
                              last=data['last'],
                              report_type=rt_id)
    elif 'start' in data and 'end' in data:
        reports = get_reports(device_id,
                              start=data['start'],
                              end=data['end'],
                              record_type=rt_id)
    else:
        reports = get_reports(device_id, last=3600)
    return 200, json.dumps(reports)


def handle_store_reports(device, data):
    device_id = devices.get_id(device)
    if device_id is None:
        return 400, 'Unknown device'

    for report_type, value in data.iteritems():
        rt_id = get_report_type_id(report_type)
        if rt_id is not None:
            store_report(device_id, rt_id, value)

    return 200, 'Succeeded'
