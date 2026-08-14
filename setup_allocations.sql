-- Table for mapping equipment to specific job sites
CREATE TABLE IF NOT EXISTS public.job_equipment (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    equipment_master_id UUID NOT NULL REFERENCES public.equipment_master(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    -- Ensure an equipment piece isn't added to the exact same job twice
    UNIQUE(job_id, equipment_master_id)
);

-- Enable RLS
ALTER TABLE public.job_equipment ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Allow all operations for authenticated users on job_equipment"
    ON public.job_equipment
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
