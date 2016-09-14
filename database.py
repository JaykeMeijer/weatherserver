import psycopg2
import psycopg2.extras
import configparser


class Database:
    def __init__(self):
        config = configparser.ConfigParser()
        config.read(u'system.config')
        self.conn = psycopg2.connect(
            host=config.get('database', 'host'),
            database=config.get('database', 'database'),
            user=config.get('database', 'user'),
            password=config.get('database', 'password')) 

    def get_cur(self):
        return self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    def device_id_exists(self, device_id):
        cur = self.get_cur()
        query = 'SELECT id FROM devices WHERE id=%(id)s;'
        cur.execute(query, {'id': device_id})
        res = cur.fetchone()
        cur.close()
        return res is not None        

    def get_device_id(self, device_name):
        cur = self.get_cur()
        query = 'SELECT id FROM devices WHERE LOWER(name) = LOWER(%(name)s);'
        cur.execute(query, {'name': device_name})
        device = cur.fetchone()
        cur.close()

        if device is None:
            return None
        else:
            return device['id']

    def get_reports_since(self, device_id, report_type, time, admin=False):
        cur = self.get_cur()
        query = '''
                SELECT reports.id as id, time as time,
                    report_types.name as report_type, value as value
                FROM reports
                INNER JOIN report_types
                ON report_types.id = reports.report_type
                WHERE device = %(device_id)s
                AND time > NOW() - '%(seconds)s seconds'::INTERVAL
                '''
        variables = {'device_id': device_id, 'seconds': time}

        if report_type is not None:
            query += ' AND report_type = %(report_type)s'
            variables['report_type'] = report_type

        if not admin:
            query += ' AND report_types.admin_feature = false'

        cur.execute(query, variables)
        res = cur.fetchall()
        cur.close()
        return res

    def get_reports_between(self, device_id, report_type, start, end, admin=False):
        return []

    def report_type_id_exists(self, rt_id):
        cur = self.get_cur()
        query = 'SELECT id FROM report_types WHERE id=%(id)s;'
        cur.execute(query, {'id': rt_id})
        res = cur.fetchone()
        cur.close()
        return res is not None        

    def get_report_type_id(self, rt_name):
        cur = self.get_cur()
        query = 'SELECT id FROM report_types WHERE LOWER(name) = LOWER(%(name)s);'
        cur.execute(query, {'name': rt_name})
        rt = cur.fetchone()
        cur.close()

        if rt is None:
            return None
        else:
            return rt['id']

    def store_report(self, device_id, report_type_id, value):
        cur = self.conn.cursor()
        query = '''
            INSERT INTO reports (device, report_type, value)
            VALUES (%(device_id)s, %(report_type_id)s, %(value)s)'''
        cur.execute(query, {'device_id': device_id,
                            'report_type_id': report_type_id,
                            'value': value})
        self.conn.commit()
        cur.close()

database = Database()
