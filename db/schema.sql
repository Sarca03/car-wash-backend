-- Tabele za auto perionicu. Pokreće se jednom, na praznoj bazi, pre demo-data.sql.
--
-- Brisanje:
--   klijent -> brišu se i njegova vozila i termini
--   vozilo  -> brišu se i njegovi termini
--   radnik  -> termini ostaju, samo bez radnika
--   usluga  -> ne može da se obriše dok postoje termini sa njom

CREATE TABLE users (
  user_id       SERIAL PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'worker' CHECK (role IN ('admin', 'worker')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE clients (
  client_id  SERIAL PRIMARY KEY,
  full_name  VARCHAR(100) NOT NULL,
  phone      VARCHAR(20)  NOT NULL,
  email      VARCHAR(100),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE vehicles (
  vehicle_id    SERIAL PRIMARY KEY,
  client_id     INTEGER REFERENCES clients (client_id) ON DELETE CASCADE,
  brand         VARCHAR(50) NOT NULL,
  model         VARCHAR(50) NOT NULL,
  license_plate VARCHAR(20) NOT NULL UNIQUE,
  vehicle_type  VARCHAR(30) NOT NULL
);

CREATE TABLE services (
  service_id       SERIAL PRIMARY KEY,
  category         VARCHAR(50)    NOT NULL,
  service_name     VARCHAR(100)   NOT NULL,
  description      TEXT,
  price            NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  duration_minutes INTEGER        NOT NULL CHECK (duration_minutes > 0)
);

CREATE TABLE workers (
  worker_id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  phone     VARCHAR(20)  NOT NULL,
  position  VARCHAR(100) NOT NULL,
  hire_date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE appointments (
  appointment_id   SERIAL PRIMARY KEY,
  client_id        INTEGER NOT NULL REFERENCES clients (client_id) ON DELETE CASCADE,
  vehicle_id       INTEGER NOT NULL REFERENCES vehicles (vehicle_id) ON DELETE CASCADE,
  service_id       INTEGER NOT NULL REFERENCES services (service_id),
  worker_id        INTEGER REFERENCES workers (worker_id) ON DELETE SET NULL,
  appointment_time TIMESTAMPTZ    NOT NULL,
  total_price      NUMERIC(10, 2),
  status           VARCHAR(20)    NOT NULL DEFAULT 'Pending'
                   CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
  created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vehicles_client ON vehicles (client_id);
CREATE INDEX idx_appointments_time ON appointments (appointment_time);
