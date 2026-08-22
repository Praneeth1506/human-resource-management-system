-- Reference DDL dump, generated from backend/models/ via SQLAlchemy's
-- PostgreSQL DDL compiler. NOT executed anywhere - the app still creates
-- tables via Base.metadata.create_all() in main.py's lifespan handler.
-- Regenerate after any model change so this stays in sync:
--
--   python -c "
--   from sqlalchemy.schema import CreateTable
--   from sqlalchemy.dialects import postgresql
--   from backend.database import Base
--   import backend.models
--   for t in Base.metadata.sorted_tables:
--       print(str(CreateTable(t).compile(dialect=postgresql.dialect())).strip() + ';\n')
--   "

CREATE TABLE users (
	id SERIAL NOT NULL,
	login_id VARCHAR(50) NOT NULL,
	password_hash VARCHAR(255) NOT NULL,
	role VARCHAR(20) NOT NULL,
	first_login BOOLEAN,
	created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
	PRIMARY KEY (id),
	CONSTRAINT ck_users_role CHECK (role IN ('admin', 'employee')),
	UNIQUE (login_id)
);

CREATE TABLE employees (
	id SERIAL NOT NULL,
	user_id INTEGER,
	employee_code VARCHAR(30) NOT NULL,
	first_name VARCHAR(100) NOT NULL,
	last_name VARCHAR(100) NOT NULL,
	department VARCHAR(100),
	designation VARCHAR(100),
	joining_date DATE,
	email VARCHAR(150) NOT NULL,
	phone VARCHAR(20),
	PRIMARY KEY (id),
	CONSTRAINT uq_employees_email UNIQUE (email),
	FOREIGN KEY(user_id) REFERENCES users (id),
	UNIQUE (employee_code)
);

CREATE TABLE attendance (
	id SERIAL NOT NULL,
	employee_id INTEGER,
	date DATE NOT NULL,
	check_in TIME WITHOUT TIME ZONE,
	check_out TIME WITHOUT TIME ZONE,
	status VARCHAR(20),
	PRIMARY KEY (id),
	CONSTRAINT ck_attendance_status CHECK (status IN ('present', 'absent', 'half_day', 'leave', 'late')),
	CONSTRAINT uq_attendance_employee_date UNIQUE (employee_id, date),
	FOREIGN KEY(employee_id) REFERENCES employees (id)
);

CREATE TABLE leave_requests (
	id SERIAL NOT NULL,
	employee_id INTEGER,
	leave_type VARCHAR(30),
	start_date DATE,
	end_date DATE,
	remarks TEXT,
	attachment_url VARCHAR(255),
	status VARCHAR(20),
	created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
	PRIMARY KEY (id),
	CONSTRAINT ck_leave_status CHECK (status IN ('pending', 'approved', 'rejected')),
	FOREIGN KEY(employee_id) REFERENCES employees (id)
);

CREATE TABLE payroll (
	id SERIAL NOT NULL,
	employee_id INTEGER,
	month INTEGER,
	year INTEGER,
	basic NUMERIC(10, 2),
	hra NUMERIC(10, 2),
	pf NUMERIC(10, 2),
	professional_tax NUMERIC(10, 2),
	working_days INTEGER,
	payable_days INTEGER,
	gross NUMERIC(10, 2),
	deductions NUMERIC(10, 2),
	net_pay NUMERIC(10, 2),
	PRIMARY KEY (id),
	CONSTRAINT uq_payroll_employee_month_year UNIQUE (employee_id, month, year),
	FOREIGN KEY(employee_id) REFERENCES employees (id)
);
