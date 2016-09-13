from database import database


def get_devices():
    raise NotImplemented

def get_device(device_name):
    raise NotImplemented

def get_id(name_or_id):
    try:
        device_id = int(name_or_id)
        if database.device_id_exists(device_id):
            return device_id
    except ValueError:
        pass 

    return database.get_device_id(name_or_id)
