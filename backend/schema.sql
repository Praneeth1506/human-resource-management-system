CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    login_id VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'employee')),
    first_login BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    employee_code VARCHAR(30) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    designation VARCHAR(100),
    joining_date DATE,
    email VARCHAR(150),
    phone VARCHAR(20)
);

CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    status VARCHAR(20) CHECK (status IN ('present', 'absent', 'half_day', 'leave', 'late')),
    UNIQUE(employee_id, date)
);

CREATE TABLE leave_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    leave_type VARCHAR(30),
    start_date DATE,
    end_date DATE,
    remarks TEXT,
    attachment_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payroll (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    month INTEGER,
    year INTEGER,
    basic NUMERIC(10,2),
    hra NUMERIC(10,2),
    pf NUMERIC(10,2),
    professional_tax NUMERIC(10,2),
    working_days INTEGER,
    payable_days INTEGER,
    gross NUMERIC(10,2),
    deductions NUMERIC(10,2),
    net_pay NUMERIC(10,2),
    UNIQUE(employee_id, month, year)
);