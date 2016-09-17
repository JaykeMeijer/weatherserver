from database import database
import json


def get_devices():
    devices_db = database.get_devices()
    devices = []
    for d in devices_db:
        devices.append({'id': d['id'],
                        'name': d['name']})
    return devices


def get_device(device_id):
    device = database.get_device(device_id)
    if device is None:
        return None

    return {'name': device['name'],
            'location': device['location'],
            'timezone': device['timezone']}
def get_id(name_or_id):
    try:
        device_id = int(name_or_id)
        if database.device_id_exists(device_id):
            return device_id
    except ValueError:
        pass 

    return database.get_device_id(name_or_id)

def handle_get_device(data):
    if 'device' not in data:
        return 400, 'Missing device' 

    device_id = get_id(data['device'])
    if device_id is None:
        return 400, 'Unknown device'

    device = get_device(device_id)
    if device is None:
        return 400, 'Unknown device'
    else:
        return 200, json.dumps(device)

def handle_get_device_list(data):
    return 200, json.dumps(get_devices())
