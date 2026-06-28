TRUNCATE transactions, subscriptions, passages RESTART IDENTITY;

WITH presets AS (
  SELECT * FROM (VALUES
    ('cotonou','porto_novo',55,1),
    ('cotonou','abomey',135,2),
    ('cotonou','parakou',425,5),
    ('porto_novo','parakou',420,5),
    ('abomey','parakou',290,3),
    ('parakou','kandi',130,2),
    ('parakou','djougou',140,2),
    ('djougou','natitingou',100,1),
    ('cotonou','natitingou',665,7)
  ) AS p(depart, arrivee, distance, gates)
),
src AS (
  SELECT
    gs.i,
    (ARRAY['Koffi Adjolala','Aicha Bello','Rachidi Toure','Marius Hounkpatin','Esperance Dossou','Ibrahim Sani','Nadege Akpovi','Komlan Agbo','Sandra Houngbedji','Yacoubou Lawani','Florence Kpode','Issa Karim','Brigitte Sossou','Dossou Yovo','Mariam Ousseini','Patrick Almeida','Adjeba Kpodar','Olivier Tossou','Fatou Diallo','Segun Adebayo','Colette Akpovi','Moussa Boubacar','Rosalie Hounsa','Benoit Adjibi'])[1 + floor(random()*24)::int] AS name,
    '01'||lpad((floor(random()*90000000+10000000))::bigint::text,8,'0') AS phone,
    chr(65+floor(random()*26)::int)||chr(65+floor(random()*26)::int)||'-'||lpad((floor(random()*900)+100)::int::text,3,'0')||'-'||chr(65+floor(random()*26)::int)||chr(65+floor(random()*26)::int) AS plate,
    (ARRAY['car','car','car','bus','truck'])[1 + floor(random()*5)::int] AS vehicle_type,
    (ARRAY['mtn','mtn','moov','celtiis','card'])[1 + floor(random()*5)::int] AS pay_method,
    CASE WHEN r.r < 0.60 THEN 'paid' WHEN r.r < 0.80 THEN 'used' WHEN r.r < 0.90 THEN 'pending' ELSE 'cancelled' END AS status,
    now() - (random()*9 || ' days')::interval AS created_ts,
    (current_date + ((floor(random()*12))::int - 3))::date AS travel_date
  FROM generate_series(1,30) AS gs(i)
  CROSS JOIN LATERAL (SELECT random() AS r) r
)
INSERT INTO subscriptions (reference, full_name, phone, email, plate, depart, arrivee, travel_date, vehicle_type, distance_km, gates, amount, status, payment_method, paid_at, created_at)
SELECT
  'PRE-'||to_char(created_ts,'YYMMDD')||'-'||lpad((row_number() OVER ())::text,4,'0'),
  name, phone, NULL, plate, p.depart, p.arrivee, travel_date, vehicle_type, p.distance, p.gates,
  p.gates * (CASE vehicle_type WHEN 'car' THEN 500 WHEN 'bus' THEN 800 ELSE 1200 END),
  status,
  CASE WHEN status IN ('paid','used') THEN pay_method ELSE NULL END,
  CASE WHEN status IN ('paid','used') THEN created_ts + interval '6 minute' ELSE NULL END,
  created_ts
FROM src
CROSS JOIN LATERAL (SELECT * FROM presets ORDER BY random() LIMIT 1) p;

WITH st AS (
  SELECT * FROM (VALUES
    ('pahou','Peage de Pahou','Cotonou','Ouidah'),
    ('akassato','Peage d''Akassato','Cotonou','Bohicon'),
    ('glazoue','Peage de Glazoue','Bohicon','Parakou'),
    ('savalou','Peage de Savalou','Bohicon','Parakou'),
    ('pira','Peage de Pira','Parakou','Bohicon'),
    ('bemberke','Peage de Bemberekè','Parakou','Kandi')
  ) AS s(id, name, tollA, tollB)
),
src2 AS (
  SELECT
    gs.i,
    (ARRAY['Koffi Adjolala','Aicha Bello','Rachidi Toure','Marius Hounkpatin','Esperance Dossou','Ibrahim Sani','Nadege Akpovi','Komlan Agbo','Sandra Houngbedji','Yacoubou Lawani','Florence Kpode','Issa Karim','Brigitte Sossou','Dossou Yovo','Mariam Ousseini','Patrick Almeida','Adjeba Kpodar','Olivier Tossou','Fatou Diallo','Segun Adebayo','Colette Akpovi','Moussa Boubacar','Rosalie Hounsa','Benoit Adjibi'])[1 + floor(random()*24)::int] AS name,
    '01'||lpad((floor(random()*90000000+10000000))::bigint::text,8,'0') AS phone,
    chr(65+floor(random()*26)::int)||chr(65+floor(random()*26)::int)||'-'||lpad((floor(random()*900)+100)::int::text,3,'0')||'-'||chr(65+floor(random()*26)::int)||chr(65+floor(random()*26)::int) AS plate,
    (ARRAY['car','car','car','bus','truck'])[1 + floor(random()*5)::int] AS vehicle_type,
    (ARRAY['mtn','mtn','moov','celtiis','card'])[1 + floor(random()*5)::int] AS pay_method,
    CASE WHEN r.r < 0.65 THEN 'paid' WHEN r.r < 0.85 THEN 'used' WHEN r.r < 0.93 THEN 'pending' ELSE 'cancelled' END AS status,
    now() - (random()*9 || ' days')::interval AS created_ts
  FROM generate_series(1,34) AS gs(i)
  CROSS JOIN LATERAL (SELECT random() AS r) r
)
INSERT INTO passages (reference, full_name, phone, plate, station, station_name, direction, vehicle_type, amount, status, payment_method, paid_at, created_at)
SELECT
  'INS-'||to_char(created_ts,'YYMMDD')||'-'||lpad((row_number() OVER ())::text,4,'0'),
  name, phone, plate, s.id, s.name,
  CASE WHEN floor(random()*2)::int = 0 THEN s.tollA||' → '||s.tollB ELSE s.tollB||' → '||s.tollA END,
  vehicle_type,
  CASE vehicle_type WHEN 'car' THEN 500 WHEN 'bus' THEN 800 ELSE 1200 END,
  status,
  CASE WHEN status IN ('paid','used') THEN pay_method ELSE NULL END,
  CASE WHEN status IN ('paid','used') THEN created_ts + interval '3 minute' ELSE NULL END,
  created_ts
FROM src2
CROSS JOIN LATERAL (SELECT * FROM st ORDER BY random() LIMIT 1) s;

INSERT INTO transactions (reference, kind, related_reference, payer_name, phone, plate, amount, payment_method, status, created_at)
SELECT 'TXN-S'||lpad(id::text,6,'0'), 'subscription', reference, full_name, phone, plate, amount, payment_method, 'success', paid_at
FROM subscriptions WHERE status IN ('paid','used');

INSERT INTO transactions (reference, kind, related_reference, payer_name, phone, plate, amount, payment_method, status, created_at)
SELECT 'TXN-P'||lpad(id::text,6,'0'), 'passage', reference, full_name, phone, plate, amount, payment_method, 'success', paid_at
FROM passages WHERE status IN ('paid','used');
