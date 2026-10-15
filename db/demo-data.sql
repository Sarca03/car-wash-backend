-- Demo podaci za Auto Perionicu.
-- Briše SVE klijente, vozila, usluge, radnike i termine i ubacuje uredne primere.
-- Termini se računaju od današnjeg datuma, pa se fajl može pokrenuti ponovo
-- kad god treba osvežiti demo (npr. u Neon SQL Editoru).
-- Pravi i javni nalog demo / demo, koji backend pušta samo da čita.
-- Tabele moraju već da postoje (db/schema.sql).

BEGIN;

TRUNCATE appointments, vehicles, clients, services, workers RESTART IDENTITY CASCADE;

INSERT INTO clients (full_name, phone, email) VALUES
  ('Katarina Kovačević', '0631144778', 'katarina.k@gmail.com'),
  ('Dušan Simić',        '0624455667', 'dusan.simic@yahoo.com'),
  ('Jovana Perić',       '0648899001', 'jovana.peric@gmail.com'),
  ('Nemanja Zlatković',  '0693322114', 'nemanja.z@outlook.com'),
  ('Milica Stojanović',  '0617788990', 'milica.s@gmail.com'),
  ('Stefan Đorđević',    '0605544332', 'stefan.dj@gmail.com'),
  ('Jelena Ilić',        '0651122334', 'jelena.ilic@outlook.com'),
  ('Marko Radović',      '0642233115', 'marko.radovic@gmail.com'),
  ('Ana Lazarević',      '0668877221', 'ana.lazarevic@gmail.com'),
  ('Vladimir Pantić',    '0631239876', NULL);

INSERT INTO vehicles (client_id, brand, model, license_plate, vehicle_type)
SELECT c.client_id, v.brand, v.model, v.plate, v.type
FROM (VALUES
  ('0631144778', 'Kia',        'Sportage', 'UE-741-TR',  'SUV'),
  ('0624455667', 'Ford',       'Focus',    'SU-369-KD',  'Karavan'),
  ('0648899001', 'Hyundai',    'Tucson',   'BG-1284-MK', 'SUV'),
  ('0693322114', 'Fiat',       'Punto',    'UE-147-JS',  'Hečbek'),
  ('0617788990', 'Toyota',     'RAV4',     'KG-2210-AV', 'SUV'),
  ('0605544332', 'Škoda',      'Octavia',  'UE-552-SM',  'Limuzina'),
  ('0651122334', 'Volkswagen', 'Golf 7',   'UE-318-RN',  'Hečbek'),
  ('0642233115', 'Audi',       'A4',       'BG-604-LP',  'Karavan'),
  ('0642233115', 'Renault',    'Kangoo',   'UE-090-PB',  'Kombi'),
  ('0668877221', 'Peugeot',    '208',      'ČA-211-MV',  'Hečbek'),
  ('0631239876', 'Dacia',      'Duster',   'UE-473-DS',  'SUV')
) AS v(phone, brand, model, plate, type)
JOIN clients c ON c.phone = v.phone;

INSERT INTO services (category, service_name, description, price, duration_minutes) VALUES
  ('Spolja',   'Spoljašnje pranje',               'Ručno pranje šamponom i ispiranje pod pritiskom', 800, 20),
  ('Spolja',   'Pranje i sušenje felni',          'Čišćenje felni od prašine sa kočnica',            500, 15),
  ('Spolja',   'Pranje sa voskiranjem',           'Spoljašnje pranje i zaštitni vosak',             1200, 30),
  ('Unutra',   'Dubinsko usisavanje',             'Usisavanje kabine, gepeka i patosnica',           700, 20),
  ('Unutra',   'Pranje stakala',                  'Sva stakla sa unutrašnje strane',                 400, 15),
  ('Unutra',   'Čišćenje table i plastike',       'Uklanjanje prašine i mat zaštita',                900, 25),
  ('Detaljno', 'Kompletno pranje',                'Spolja i iznutra, sa usisavanjem',               1800, 45),
  ('Detaljno', 'Dubinsko pranje enterijera',      'Sedišta, tapacir, pod i plafon',                 7500, 240);

INSERT INTO workers (full_name, phone, position, hire_date) VALUES
  ('Miloš Jovanović', '0637712408', 'Specijalista za enterijer', '2024-03-04'),
  ('Nikola Pavlović', '0629054316', 'Perač, voskiranje',         '2024-06-17'),
  ('Luka Marković',   '0645581923', 'Perač',                     '2025-02-10'),
  ('Uroš Tomić',      '0601378845', 'Pomoćni radnik',            '2025-09-01');

-- Termini: dan je pomak od danas (0 = danas), vreme je po beogradskom vremenu
INSERT INTO appointments (client_id, vehicle_id, service_id, worker_id, appointment_time, total_price, status)
SELECT v.client_id, v.vehicle_id, s.service_id, w.worker_id,
       ((CURRENT_DATE + a.day) + a.at) AT TIME ZONE 'Europe/Belgrade',
       s.price, a.status
FROM (VALUES
  ('UE-552-SM',  'Kompletno pranje',            'Nikola Pavlović',  -3, time '10:00', 'Completed'),
  ('BG-1284-MK', 'Spoljašnje pranje',           'Luka Marković',    -3, time '12:30', 'Completed'),
  ('UE-318-RN',  'Pranje sa voskiranjem',       'Nikola Pavlović',  -2, time '09:30', 'Completed'),
  ('ČA-211-MV',  'Dubinsko usisavanje',         'Uroš Tomić',       -2, time '14:00', 'Cancelled'),
  ('UE-090-PB',  'Kompletno pranje',            'Luka Marković',    -1, time '11:00', 'Completed'),
  ('KG-2210-AV', 'Dubinsko pranje enterijera',  'Miloš Jovanović',  -1, time '08:00', 'Completed'),
  ('UE-741-TR',  'Kompletno pranje',            'Nikola Pavlović',   0, time '08:30', 'Completed'),
  ('SU-369-KD',  'Spoljašnje pranje',           'Luka Marković',     0, time '10:00', 'Completed'),
  ('BG-604-LP',  'Dubinsko pranje enterijera',  'Miloš Jovanović',   0, time '11:00', 'Confirmed'),
  ('UE-147-JS',  'Pranje i sušenje felni',      'Uroš Tomić',        0, time '13:30', 'Pending'),
  ('UE-473-DS',  'Pranje sa voskiranjem',       'Nikola Pavlović',   0, time '15:00', 'Pending'),
  ('KG-2210-AV', 'Pranje stakala',              'Luka Marković',     1, time '09:00', 'Confirmed'),
  ('UE-552-SM',  'Čišćenje table i plastike',   'Uroš Tomić',        1, time '12:00', 'Pending'),
  ('ČA-211-MV',  'Kompletno pranje',            'Nikola Pavlović',   2, time '10:30', 'Pending')
) AS a(plate, service, worker, day, at, status)
JOIN vehicles v ON v.license_plate = a.plate
JOIN services s ON s.service_name = a.service
JOIN workers  w ON w.full_name = a.worker;

-- Javni demo nalog (lozinka: demo). Backend ga pušta samo da čita.
DELETE FROM users WHERE username = 'demo';
INSERT INTO users (username, email, password_hash, role)
VALUES ('demo', 'demo@example.com', '$2b$10$IMSFb1x5NSXA7a6y0hStnuK.LNzaCM5Mp6IUjZpKFLXKnT4Xf9EN2', 'worker');

COMMIT;

-- Provera
SELECT 'klijenti' AS tabela, COUNT(*) FROM clients
UNION ALL SELECT 'vozila', COUNT(*) FROM vehicles
UNION ALL SELECT 'usluge', COUNT(*) FROM services
UNION ALL SELECT 'radnici', COUNT(*) FROM workers
UNION ALL SELECT 'termini', COUNT(*) FROM appointments;
