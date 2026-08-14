-- Core Enums
CREATE TYPE user_role AS ENUM ('ADMIN', 'FOREMAN', 'ENGINEER');
CREATE TYPE rental_type AS ENUM ('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'TRIP_BASIS');
CREATE TYPE entry_status AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED');

-- Users Table
CREATE TABLE users (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 full_name VARCHAR(255) NOT NULL,
 email VARCHAR(255) UNIQUE NOT NULL,
 role user_role NOT NULL DEFAULT 'FOREMAN',
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs / Construction Sites
CREATE TABLE jobs (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 job_number VARCHAR(100) UNIQUE NOT NULL,
 job_name VARCHAR(255) NOT NULL,
 location VARCHAR(255) NOT NULL,
 is_active BOOLEAN DEFAULT TRUE,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers
CREATE TABLE suppliers (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 supplier_name VARCHAR(255) NOT NULL,
 contact_person VARCHAR(255),
 phone_number VARCHAR(50),
 is_active BOOLEAN DEFAULT TRUE,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment Master Catalogue
CREATE TABLE equipment_master (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 equipment_category VARCHAR(100) NOT NULL, -- Tanker, Trucks, Heavy Machinery
 equipment_name VARCHAR(255) NOT NULL, -- e.g., Sweet Water Tanker - 10,000 Gallon
 is_active BOOLEAN DEFAULT TRUE
);

-- Labour Designations Master
CREATE TABLE labour_designations (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 designation_name VARCHAR(100) UNIQUE NOT NULL -- Mason, Carpenter, Electrician, etc.
);

-- Daily Equipment Entries
CREATE TABLE equipment_entries (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 entry_date DATE NOT NULL,
 job_id UUID REFERENCES jobs(id),
 supplier_id UUID REFERENCES suppliers(id),
 equipment_master_id UUID REFERENCES equipment_master(id),
 rental_type rental_type NOT NULL,
 start_time TIME,
 end_time TIME,
 break_hours NUMERIC(4, 2) DEFAULT 0.00,
 working_hours NUMERIC(4, 2), -- Computed
 number_of_trips INT DEFAULT 0,
 vehicle_number VARCHAR(100) NOT NULL,
 foreman_name VARCHAR(255) NOT NULL,
 engineer_name VARCHAR(255) NOT NULL,
 equipment_photo_url TEXT NOT NULL, -- Mandatory photo
 remarks TEXT,
 rejection_reason TEXT,
 status entry_status DEFAULT 'SUBMITTED',
 created_by UUID REFERENCES users(id),
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Labour Entries
CREATE TABLE labour_entries (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 entry_date DATE NOT NULL,
 job_id UUID REFERENCES jobs(id),
 supplier_id UUID REFERENCES suppliers(id),
 employee_name VARCHAR(255) NOT NULL,
 designation_id UUID REFERENCES labour_designations(id),
 start_time TIME NOT NULL,
 end_time TIME NOT NULL,
 break_hours NUMERIC(4, 2) DEFAULT 0.00,
 total_working_hours NUMERIC(4, 2) NOT NULL, -- Computed
 foreman_name VARCHAR(255) NOT NULL,
 engineer_name VARCHAR(255),
 labour_photo_url TEXT,
 remarks TEXT,
 rejection_reason TEXT,
 status entry_status DEFAULT 'SUBMITTED',
 created_by UUID REFERENCES users(id),
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Allocations
CREATE TABLE IF NOT EXISTS public.job_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    equipment_master_id UUID REFERENCES public.equipment_master(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, equipment_master_id)
);

CREATE TABLE IF NOT EXISTS public.job_suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, supplier_id)
);

-- Material Transfers
CREATE TABLE IF NOT EXISTS public.material_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    to_job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    material_type VARCHAR(255) NOT NULL,
    quantity VARCHAR(100) NOT NULL,
    vehicle_type VARCHAR(100),
    vehicle_number VARCHAR(100),
    driver_name VARCHAR(255),
    is_delivered BOOLEAN DEFAULT FALSE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    photo_url TEXT NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status entry_status DEFAULT 'SUBMITTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Attendance Logs
CREATE TABLE IF NOT EXISTS public.attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location_lat NUMERIC,
    location_lng NUMERIC,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auth Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'FOREMAN')::public.user_role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- SEED DATA
-- Insert Default Equipment
INSERT INTO equipment_master (equipment_category, equipment_name) VALUES
('Tankers', 'Sweet Water Tanker (10,000 Gal)'),
('Tankers', 'Sweet Water Tanker (5,000 Gal)'),
('Tankers', 'Sweet Water Tanker (2,500 Gal)'),
('Tankers', 'Waste Water Removal Tanker'),
('Tankers', 'Dewatering Tanker'),
('Trucks', '20 CBM Dumper'),
('Trucks', '35 CBM Dumper'),
('Trucks', '40 CBM Dumper'),
('Trucks', '3 Ton Tipper'),
('Trucks', 'Low Bed Trailer'),
('Trucks', 'Recovery Truck'),
('Heavy Machinery', 'Excavator'),
('Heavy Machinery', 'Backhoe Loader'),
('Heavy Machinery', 'Wheel Loader'),
('Heavy Machinery', 'Bobcat'),
('Heavy Machinery', 'Roller'),
('Heavy Machinery', 'Crane'),
('Heavy Machinery', 'Generator'),
('Heavy Machinery', 'Air Compressor'),
('Heavy Machinery', 'Water Pump'),
('Heavy Machinery', 'Lighting Tower'),
('Heavy Machinery', 'Forklift');

-- Insert Default Labour Designations
INSERT INTO labour_designations (designation_name) VALUES
('Mason'),
('Carpenter'),
('Steel Fixer'),
('Helper / Unskilled Labour'),
('Electrician'),
('Plumber'),
('Welder'),
('Pipe Fitter'),
('Operator'),
('Driver'),
('Safety Officer'),
('Surveyor');
