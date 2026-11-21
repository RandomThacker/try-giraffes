-- Demo tasks / reminders / meetings for thackeraryan0@gmail.com (idempotent)

WITH u AS (
    SELECT id, amc_id FROM users WHERE email = 'thackeraryan0@gmail.com'
),
task_seed AS (
    SELECT * FROM (
        VALUES
            ('Follow up with distributor on NFO bookings', CURRENT_DATE + 1, false),
            ('Send product sheet to branch partners', CURRENT_DATE + 2, false),
            ('Review weekly AUM snapshot', CURRENT_DATE + 3, false),
            ('Prepare courtesy-meet talking points', CURRENT_DATE + 5, false)
    ) AS t(title, due_date, done)
)
INSERT INTO tasks (user_id, amc_id, title, due_date, done)
SELECT u.id, u.amc_id, t.title, t.due_date::date, t.done
FROM u
CROSS JOIN task_seed t
WHERE NOT EXISTS (
    SELECT 1 FROM tasks x
    WHERE x.user_id = u.id AND x.title = t.title
);

WITH u AS (
    SELECT id, amc_id FROM users WHERE email = 'thackeraryan0@gmail.com'
),
reminder_seed AS (
    SELECT * FROM (
        VALUES
            ('Call back mutual fund partner', 'Discuss SIP top-up options', now() + interval '3 hours'),
            ('Submit attendance reminder', 'Mark present before noon', now() + interval '1 day'),
            ('Market outlook huddle prep', 'Skim key indices before the call', now() + interval '2 days'),
            ('Send meeting notes', 'Share summary with participants', now() + interval '4 days')
    ) AS r(title, note, remind_at)
)
INSERT INTO reminders (user_id, amc_id, title, note, remind_at)
SELECT u.id, u.amc_id, r.title, r.note, r.remind_at::timestamptz
FROM u
CROSS JOIN reminder_seed r
WHERE NOT EXISTS (
    SELECT 1 FROM reminders x
    WHERE x.user_id = u.id AND x.title = r.title
);

-- Upcoming one-to-one
WITH u AS (
    SELECT id, amc_id FROM users WHERE email = 'thackeraryan0@gmail.com'
),
pick AS (
    SELECT COALESCE(
        (
            SELECT ou.id
            FROM users ou
            INNER JOIN u ON ou.amc_id = u.amc_id
            WHERE ou.email <> 'thackeraryan0@gmail.com'
            ORDER BY ou.email
            LIMIT 1
        ),
        u.id
    ) AS id
    FROM u
),
ins AS (
    INSERT INTO meetings (
        created_by, amc_id, title, description, arn,
        mode, meeting_type, purpose, status,
        location, location_kind, starts_at, ends_at
    )
    SELECT
        u.id,
        u.amc_id,
        'Partner catch-up',
        'Courtesy meet and pipeline review',
        '@ARYAN01',
        'scheduled',
        'one_to_one',
        'courtesy_meet',
        'scheduled',
        'BKC, Mumbai',
        'physical',
        date_trunc('day', now()) + interval '1 day' + interval '10 hours',
        date_trunc('day', now()) + interval '1 day' + interval '11 hours'
    FROM u
    WHERE NOT EXISTS (
        SELECT 1 FROM meetings m
        WHERE m.created_by = u.id AND m.title = 'Partner catch-up' AND m.status = 'scheduled'
    )
    RETURNING id
)
INSERT INTO meeting_targets (meeting_id, role, target_type, user_id)
SELECT ins.id, 'participant', 'user', pick.id
FROM ins
CROSS JOIN pick;

-- Same-day product discussion
WITH u AS (
    SELECT id, amc_id FROM users WHERE email = 'thackeraryan0@gmail.com'
),
pick AS (
    SELECT COALESCE(
        (
            SELECT ou.id
            FROM users ou
            INNER JOIN u ON ou.amc_id = u.amc_id
            WHERE ou.email <> 'thackeraryan0@gmail.com'
            ORDER BY ou.email
            LIMIT 1
        ),
        u.id
    ) AS id
    FROM u
),
ins AS (
    INSERT INTO meetings (
        created_by, amc_id, title, description, arn,
        mode, meeting_type, purpose, status,
        location, location_kind, starts_at, ends_at
    )
    SELECT
        u.id,
        u.amc_id,
        'Product deep-dive',
        'Walk through new fund features and FAQ',
        '@ARYAN02',
        'scheduled',
        'one_to_many',
        'product',
        'scheduled',
        'Online',
        'virtual',
        date_trunc('day', now()) + interval '15 hours',
        date_trunc('day', now()) + interval '16 hours'
    FROM u
    WHERE NOT EXISTS (
        SELECT 1 FROM meetings m
        WHERE m.created_by = u.id AND m.title = 'Product deep-dive' AND m.status = 'scheduled'
    )
    RETURNING id
)
INSERT INTO meeting_targets (meeting_id, role, target_type, user_id)
SELECT ins.id, 'participant', 'user', pick.id
FROM ins
CROSS JOIN pick;

-- Instant / in-progress meeting
WITH u AS (
    SELECT id, amc_id FROM users WHERE email = 'thackeraryan0@gmail.com'
),
pick AS (
    SELECT COALESCE(
        (
            SELECT ou.id
            FROM users ou
            INNER JOIN u ON ou.amc_id = u.amc_id
            WHERE ou.email <> 'thackeraryan0@gmail.com'
            ORDER BY ou.email
            LIMIT 1
        ),
        u.id
    ) AS id
    FROM u
),
ins AS (
    INSERT INTO meetings (
        created_by, amc_id, title, description, arn,
        mode, meeting_type, purpose, status,
        location, location_kind, starts_at, ends_at
    )
    SELECT
        u.id,
        u.amc_id,
        'Quick sync',
        'Short check-in on open issues',
        '@ARYAN03',
        'instant',
        'one_to_one',
        'issue_raised',
        'started',
        'Online',
        'virtual',
        now(),
        now() + interval '45 minutes'
    FROM u
    WHERE NOT EXISTS (
        SELECT 1 FROM meetings m
        WHERE m.created_by = u.id AND m.title = 'Quick sync' AND m.mode = 'instant'
    )
    RETURNING id
)
INSERT INTO meeting_targets (meeting_id, role, target_type, user_id)
SELECT ins.id, 'participant', 'user', pick.id
FROM ins
CROSS JOIN pick;
