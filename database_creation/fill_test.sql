BEGIN;
INSERT INTO devices (name, location, timezone) VALUES ('test', 'Ouderkerk', 'Europe/Amsterdam');

INSERT INTO reports (device, report_type, value, time) VALUES (1, 1, '98', '2016-09-13 08:00:00.0');
INSERT INTO reports (device, report_type, value, time) VALUES (1, 2, '30', '2016-09-13 08:00:00.0');
INSERT INTO reports (device, report_type, value, time) VALUES (1, 3, '3.12', '2016-09-13 08:00:00.0');
INSERT INTO reports (device, report_type, value, time) VALUES (1, 1, '96', '2016-09-13 08:05:00.0');
INSERT INTO reports (device, report_type, value, time) VALUES (1, 2, '32', '2016-09-13 08:05:00.0');
INSERT INTO reports (device, report_type, value, time) VALUES (1, 3, '3.10', '2016-09-13 08:05:00.0');
INSERT INTO reports (device, report_type, value, time) VALUES (1, 1, '93', '2016-09-13 08:10:00.0');
INSERT INTO reports (device, report_type, value, time) VALUES (1, 2, '35', '2016-09-13 08:10:00.0');
INSERT INTO reports (device, report_type, value, time) VALUES (1, 3, '3.11', '2016-09-13 08:10:00.0');

COMMIT;
