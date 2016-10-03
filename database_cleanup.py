import database
import datetime
import pprint


def cleanup_lt_2(device_id, report_type):
    print("\t\t2 hour cleanup")
    now_2 = datetime.datetime.now() - datetime.timedelta(hours=2)
    now_4 = datetime.datetime.now() - datetime.timedelta(hours=4)
    items = database.database.get_reports_between(
        device_id,
        report_type,
        now_4.strftime('%Y-%m-%d %H:%M:%S'),
        now_2.strftime('%Y-%m-%d %H:%M:%S'),
        admin=True)
    if len(items) == 0:
        return

    intervals = build_intervals(items, datetime.datetime.now(), 10)

    remove = []
    for i in intervals:
        if len(i) > 0:
            remove += i[1:]
    delete_items(remove)


def cleanup_lt_24(device_id, report_type):
    print("\t\t1 day cleanup")
    now_4 = datetime.datetime.now() - datetime.timedelta(hours=4)
    now_24 = datetime.datetime.now() - datetime.timedelta(hours=24)

    items = database.database.get_reports_between(
        device_id,
        report_type,
        now_24.strftime('%Y-%m-%d %H:%M:%S'),
        now_4.strftime('%Y-%m-%d %H:%M:%S'),
        admin=True)
    if len(items) == 0:
        return

    intervals = build_intervals(items, now_4, 10)

    remove = []
    for i in intervals:
        if len(i) > 0:
            remove += i[1:]
    delete_items(remove)


def cleanup_lt_168(device_id, report_type):
    print("\t\t1 week cleanup")
    now_24 = datetime.datetime.now() - datetime.timedelta(hours=24)
    now_168 = datetime.datetime.now() - datetime.timedelta(hours=168)
    items = database.database.get_reports_between(
        device_id,
        report_type,
        now_168.strftime('%Y-%m-%d %H:%M:%S'),
        now_24.strftime('%Y-%m-%d %H:%M:%S'),
        admin=True)
    if len(items) == 0:
        return

    intervals = build_intervals(items, now_24, 60)

    remove = []
    for i in intervals:
        if len(i) > 0:
            remove += i[1:]
    delete_items(remove)


#TODO: Add larger than a week: Once every 360m/6h

def cleanup_loop():
    for d in database.database.get_all_device_ids():
        di = d['id']
        print('Cleanup device id %d' % di)
        for r in database.database.get_all_report_type_ids():
            ri = r['id']
            print('\tCleanup report id %d' % ri)
            cleanup_lt_2(di, ri)
            cleanup_lt_24(di, ri)
            cleanup_lt_168(di, ri)


def delete_items(items):
    if len(items) > 0:
        database.database.delete_reports([x['id'] for x in items])


def build_intervals(items, start, interval):
    results = []
    td = datetime.timedelta(minutes=interval)
    current_limit = start - td
    group = []
    number_items = len(items)
    handled = 0
    itemsr = items[::-1]

    while number_items > handled:
        for i in itemsr[handled:]:
            if i['time'] < current_limit:
                break
            else:
                group.append(i)
                handled += 1

        current_limit -= td
        results.append(group)
        group = []

    return results