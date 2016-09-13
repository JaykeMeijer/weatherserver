#! /usr/bin/python
import tornado.ioloop
import tornado.web
import json
from reports import handle_get_reports


class WebHandler(tornado.web.RequestHandler):
    handlers = {
        'get_report': handle_get_reports
    }

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def post(self):
        print(json.loads(self.request.body))
        data = json.loads(self.request.body)
        if 'data' in data and data['type'] in self.handlers:
            success, response = self.handlers[data['type']](data['data'])
            if success == 200:
                self.write(response)
            else:
                self.send_error(success)
        else:
            self.send_error(400)

def configure():
    return tornado.web.Application([
        (r"/web/", WebHandler)
    ])

if __name__ == "__main__":
    server = configure()
    server.listen(8888)
    tornado.ioloop.IOLoop.current().start()
