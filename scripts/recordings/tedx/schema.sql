-- The repo has no schema or migrations. These tables are inferred from the queries in src/db/.
CREATE TABLE seat_types (id serial PRIMARY KEY, name text, price numeric(8,2), fee numeric(8,2));
CREATE TABLE orders (id serial PRIMARY KEY, order_code text, status int, note text,
  "timestamp" timestamptz DEFAULT now());
CREATE TABLE seats (id serial PRIMARY KEY, name text, type int REFERENCES seat_types(id),
  attendee_name text, order_id int);
CREATE TABLE seats_reservations (id serial PRIMARY KEY, order_id int, seat_id int,
  attendee_name text, "timestamp" timestamptz DEFAULT now());
CREATE TABLE customers (id serial PRIMARY KEY, order_id int, first_name text, last_name text,
  email text, phone_number text, address_line_1 text, address_line_2 text, city text, state text,
  zip_code text);
CREATE TABLE sessions (id serial PRIMARY KEY, session_string text, order_id int);
CREATE TABLE payments (id serial PRIMARY KEY, order_id int, amount numeric(8,2));
CREATE TABLE shipments (id serial PRIMARY KEY, order_id int, status boolean DEFAULT false,
  tracking_number text, not_shipping boolean DEFAULT false);
CREATE TABLE stripe_customers (id serial PRIMARY KEY, email text, stripe_id text);
