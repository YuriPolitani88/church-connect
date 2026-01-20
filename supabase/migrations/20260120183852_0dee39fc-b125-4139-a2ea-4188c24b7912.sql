-- Add user_id column to guardians table to link guardians to authenticated users
ALTER TABLE public.guardians 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_guardians_user_id ON public.guardians(user_id);

-- RLS policy for guardians to view their own profile
CREATE POLICY "Guardians can view their own guardian profile"
ON public.guardians
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL);

-- RLS policy for guardians to update their own profile
CREATE POLICY "Guardians can update their own guardian profile"
ON public.guardians
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Allow guardians to view their children via child_guardians
CREATE POLICY "Guardians can view their children relationships"
ON public.child_guardians
FOR SELECT
TO authenticated
USING (
  guardian_id IN (
    SELECT id FROM public.guardians WHERE user_id = auth.uid()
  )
);

-- Allow guardians to view their own children
CREATE POLICY "Guardians can view their own children"
ON public.children
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT child_id FROM public.child_guardians 
    WHERE guardian_id IN (
      SELECT id FROM public.guardians WHERE user_id = auth.uid()
    )
  )
);

-- Allow guardians to view check-ins for their children
CREATE POLICY "Guardians can view check-ins for their children"
ON public.check_ins
FOR SELECT
TO authenticated
USING (
  child_id IN (
    SELECT child_id FROM public.child_guardians 
    WHERE guardian_id IN (
      SELECT id FROM public.guardians WHERE user_id = auth.uid()
    )
  )
);

-- Allow guardians to view their own alerts
CREATE POLICY "Guardians can view their own alerts"
ON public.parent_alerts
FOR SELECT
TO authenticated
USING (
  guardian_id IN (
    SELECT id FROM public.guardians WHERE user_id = auth.uid()
  )
);

-- Allow guardians to mark alerts as read
CREATE POLICY "Guardians can update their own alerts"
ON public.parent_alerts
FOR UPDATE
TO authenticated
USING (
  guardian_id IN (
    SELECT id FROM public.guardians WHERE user_id = auth.uid()
  )
);