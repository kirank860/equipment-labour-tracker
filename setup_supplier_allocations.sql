-- Table for mapping suppliers to specific job sites
CREATE TABLE IF NOT EXISTS public.job_suppliers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    -- Ensure a supplier isn't added to the exact same job twice
    UNIQUE(job_id, supplier_id)
);

-- Enable RLS
ALTER TABLE public.job_suppliers ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Allow all operations for authenticated users on job_suppliers"
    ON public.job_suppliers
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
