ALTER TABLE users
    ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Dummy roster for meetings / participant pickers.
-- Login: Password123!  |  PIN: 1234  |  AMC: 100003738
INSERT INTO users (email, full_name, password_hash, pin_hash, amc_id)
SELECT
    v.email,
    v.full_name,
    pw.hash,
    pin.hash,
    a.id
FROM amcs a
CROSS JOIN (
    VALUES
        ('arun.verma@trygiraffes.dev', 'Arun Verma'),
        ('arjun.wadhwa@trygiraffes.dev', 'Arjun Wadhwa'),
        ('aatya.sharma@trygiraffes.dev', 'Aatya Sharma'),
        ('ganesh.mohan@trygiraffes.dev', 'Ganesh Mohan'),
        ('priya.nair@trygiraffes.dev', 'Priya Nair'),
        ('rahul.mehta@trygiraffes.dev', 'Rahul Mehta'),
        ('sneha.kapoor@trygiraffes.dev', 'Sneha Kapoor'),
        ('karan.joshi@trygiraffes.dev', 'Karan Joshi'),
        ('neha.gupta@trygiraffes.dev', 'Neha Gupta'),
        ('vikram.singh@trygiraffes.dev', 'Vikram Singh')
) AS v(email, full_name)
CROSS JOIN (
    VALUES ($pw$$2a$12$NzJ/LmPUZoKX6fjkSATcke4yqsSB3mauv7HOVPCnQRgNz2IqquVTW$pw$)
) AS pw(hash)
CROSS JOIN (
    VALUES ($pin$$2a$12$k0TKw4Cbm1gP19lJ7yaVkeyiqvXuyAVI.KmAPY2PkyJ4FCDCAcFx2$pin$)
) AS pin(hash)
WHERE a.code = '100003738'
ON CONFLICT (email) DO NOTHING;
