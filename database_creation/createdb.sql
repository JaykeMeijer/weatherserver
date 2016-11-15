BEGIN;
CREATE TABLE report_types (
   id serial PRIMARY KEY,
   name varchar(255) UNIQUE NOT NULL,
   admin_feature boolean NOT NULL DEFAULT false
);

CREATE TABLE devices (
    id serial PRIMARY KEY,
    name varchar(255) UNIQUE NOT NULL,
    prettyname varchar(255),
    location varchar(255),
    timezone varchar(255)
);

CREATE TABLE reports (
    id serial,
    time timestamp NOT NULL DEFAULT current_timestamp,
    device integer REFERENCES devices ON DELETE CASCADE,
    report_type integer REFERENCES report_types ON DELETE RESTRICT,
    value varchar(255) NOT NULL
);
COMMIT;
