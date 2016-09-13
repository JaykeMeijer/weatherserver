BEGIN;
INSERT INTO report_types (name, admin_feature) VALUES ('temperature', false);
INSERT INTO report_types (name, admin_feature) VALUES ('humidity', false);
INSERT INTO report_types (name, admin_feature) VALUES ('voltage', true);
COMMIT;
