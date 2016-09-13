BEGIN;
GRANT SELECT ON TABLE devices TO weather;
GRANT SELECT ON TABLE reports TO weather;
GRANT SELECT ON TABLE report_types TO weather;

GRANT INSERT ON TABLE devices TO weather;
GRANT INSERT ON TABLE reports TO weather;

GRANT UPDATE ON TABLE reports TO weather;
GRANT UPDATE ON TABLE devices TO weather;

GRANT DELETE ON TABLE reports TO weather;
GRANT DELETE ON TABLE devices TO weather;
COMMIT;
