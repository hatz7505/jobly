CREATE TABLE companies (
  handle TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  num_employees INTEGER,
  description TEXT, 
  logo_url TEXT
);

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  salary FLOAT(2) NOT NULL,
  equity FLOAT(2) NOT NULL CHECK(equity < 1),
  company_handle TEXT NOT NULL REFERENCES companies ON DELETE CASCADE,
  date_posted TIMESTAMP DEFAULT current_timestamp
);