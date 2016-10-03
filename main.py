#! /usr/bin/python
import tornado.ioloop
import tornado.web
import json
import reports
import devices
import database_cleanup


class WebHandler(tornado.web.RequestHandler):
    handlers = {
        'get_report': reports.handle_get_reports,
        'get_device': devices.handle_get_device,
        'get_device_list': devices.handle_get_device_list
    }

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def post(self):
        data = json.loads(self.request.body)
        if 'data' in data and data['type'] in self.handlers:
            success, response = self.handlers[data['type']](data['data'])
            if success == 200:
                self.write(response)
            else:
                self.send_error(success)
        else:
            self.send_error(400)

class ReportHandler(tornado.web.RequestHandler):
    handlers = {
        'store_reports': reports.handle_store_reports
    }

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def post(self):
        try:
            data = json.loads(self.request.body)
        except ValueError:
            print("Invalid JSON packet received")
            self.send_error(400)
            return
 
        if 'device' not in data:
            self.send_error(400)
            return

        if 'data' in data and data['type'] in self.handlers:
            success, response = self.handlers[data['type']](data['device'],
                                                            data['data'])
            if success == 200:
                self.write(response)
            else:
                self.send_error(success)
        else:
            self.send_error(400)

def configure():
    return tornado.web.Application([
        (r"/web/", WebHandler),
        (r"/report/", ReportHandler)
    ], compress_response=True)


def cleanup(ioloop):
    database_cleanup.cleanup_loop()
    ioloop.call_later(3600, cleanup)


if __name__ == "__main__":
    server = configure()
    server.listen(8888)
    ioloop = tornado.ioloop.IOLoop.current()
    cleanup(ioloop)
    ioloop.start()
