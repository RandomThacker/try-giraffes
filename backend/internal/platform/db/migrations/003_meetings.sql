-- Meeting schedule schema + sample seed data

CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amc_id UUID NOT NULL REFERENCES amcs (id),
    name TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT groups_amc_name_uidx UNIQUE (amc_id, name)
);

CREATE TABLE IF NOT EXISTS group_members (
    group_id UUID NOT NULL REFERENCES groups (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS group_members_user_id_idx ON group_members (user_id);

CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID NOT NULL REFERENCES users (id),
    amc_id UUID NOT NULL REFERENCES amcs (id),
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    arn TEXT NOT NULL DEFAULT '',
    mode TEXT NOT NULL CHECK (mode IN ('instant', 'scheduled')),
    meeting_type TEXT NOT NULL CHECK (meeting_type IN ('one_to_one', 'one_to_many')),
    purpose TEXT NOT NULL CHECK (purpose IN (
        'courtesy_meet',
        'product',
        'issue_raised',
        'introductory',
        'fund_manager',
        'market_outlook',
        'any_other',
        'nfo',
        'business_head'
    )),
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'started', 'completed', 'cancelled')),
    location TEXT,
    location_kind TEXT CHECK (location_kind IS NULL OR location_kind IN ('physical', 'virtual')),
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ,
    thumbnail_url TEXT,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT meetings_ends_after_starts_chk CHECK (ends_at IS NULL OR ends_at >= starts_at),
    CONSTRAINT meetings_cancelled_fields_chk CHECK (
        (status = 'cancelled' AND cancelled_at IS NOT NULL)
        OR (status <> 'cancelled' AND cancelled_at IS NULL)
    )
);

CREATE INDEX IF NOT EXISTS meetings_created_by_starts_at_idx ON meetings (created_by, starts_at);
CREATE INDEX IF NOT EXISTS meetings_amc_id_status_idx ON meetings (amc_id, status);
CREATE INDEX IF NOT EXISTS meetings_meeting_type_starts_at_idx ON meetings (meeting_type, starts_at);

CREATE TABLE IF NOT EXISTS meeting_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings (id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('participant', 'broadcast')),
    target_type TEXT NOT NULL CHECK (target_type IN ('user', 'group')),
    user_id UUID REFERENCES users (id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT meeting_targets_target_chk CHECK (
        (target_type = 'user' AND user_id IS NOT NULL AND group_id IS NULL)
        OR (target_type = 'group' AND group_id IS NOT NULL AND user_id IS NULL)
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS meeting_targets_user_uidx
    ON meeting_targets (meeting_id, role, user_id)
    WHERE target_type = 'user' AND user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS meeting_targets_group_uidx
    ON meeting_targets (meeting_id, role, group_id)
    WHERE target_type = 'group' AND group_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS meeting_targets_meeting_id_idx ON meeting_targets (meeting_id);
CREATE INDEX IF NOT EXISTS meeting_targets_user_id_idx ON meeting_targets (user_id);
CREATE INDEX IF NOT EXISTS meeting_targets_group_id_idx ON meeting_targets (group_id);

CREATE TABLE IF NOT EXISTS meeting_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL UNIQUE REFERENCES meetings (id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES users (id),
    about_product TEXT,
    about_brand TEXT,
    about_pricing TEXT,
    any_concern TEXT,
    looking_for_specific TEXT,
    talked_about TEXT,
    skipped BOOLEAN NOT NULL DEFAULT false,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meeting_cancellations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL UNIQUE REFERENCES meetings (id) ON DELETE CASCADE,
    cancelled_by UUID NOT NULL REFERENCES users (id),
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meeting_reschedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings (id) ON DELETE CASCADE,
    rescheduled_by UUID NOT NULL REFERENCES users (id),
    message TEXT NOT NULL DEFAULT '',
    previous_starts_at TIMESTAMPTZ NOT NULL,
    new_starts_at TIMESTAMPTZ NOT NULL,
    previous_location TEXT,
    new_location TEXT,
    previous_location_kind TEXT CHECK (
        previous_location_kind IS NULL OR previous_location_kind IN ('physical', 'virtual')
    ),
    new_location_kind TEXT CHECK (
        new_location_kind IS NULL OR new_location_kind IN ('physical', 'virtual')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS meeting_reschedules_meeting_id_idx ON meeting_reschedules (meeting_id);

-- ---------------------------------------------------------------------------
-- Seed: groups + sample meetings (idempotent by stable titles / group names)
-- ---------------------------------------------------------------------------

WITH amc AS (
    SELECT id FROM amcs WHERE code = '100003738'
),
creator AS (
    SELECT u.id
    FROM users u
    WHERE u.email = 'vikram.singh@trygiraffes.dev'
),
ins_groups AS (
    INSERT INTO groups (amc_id, name, created_by)
    SELECT amc.id, g.name, creator.id
    FROM amc
    CROSS JOIN creator
    CROSS JOIN (
        VALUES
            ('Group Neon'),
            ('Group besties'),
            ('Label')
    ) AS g(name)
    ON CONFLICT (amc_id, name) DO NOTHING
    RETURNING id, name
)
SELECT 1;

INSERT INTO group_members (group_id, user_id)
SELECT g.id, u.id
FROM groups g
INNER JOIN amcs a ON a.id = g.amc_id AND a.code = '100003738'
INNER JOIN users u ON u.email = ANY (
    CASE g.name
        WHEN 'Group Neon' THEN ARRAY[
            'arun.verma@trygiraffes.dev',
            'arjun.wadhwa@trygiraffes.dev',
            'priya.nair@trygiraffes.dev'
        ]
        WHEN 'Group besties' THEN ARRAY[
            'aatya.sharma@trygiraffes.dev',
            'sneha.kapoor@trygiraffes.dev',
            'neha.gupta@trygiraffes.dev'
        ]
        WHEN 'Label' THEN ARRAY[
            'ganesh.mohan@trygiraffes.dev',
            'rahul.mehta@trygiraffes.dev',
            'karan.joshi@trygiraffes.dev'
        ]
        ELSE ARRAY[]::TEXT[]
    END
)
ON CONFLICT DO NOTHING;

-- 1) Upcoming scheduled one-to-one
WITH creator AS (
    SELECT id FROM users WHERE email = 'vikram.singh@trygiraffes.dev'
),
amc AS (
    SELECT id FROM amcs WHERE code = '100003738'
),
participant AS (
    SELECT id FROM users WHERE email = 'arun.verma@trygiraffes.dev'
),
ins AS (
    INSERT INTO meetings (
        created_by, amc_id, title, description, arn,
        mode, meeting_type, purpose, status,
        location, location_kind, starts_at, ends_at
    )
    SELECT
        creator.id,
        amc.id,
        'Call with Arun',
        'NFO launch discussion..',
        '@1767889',
        'scheduled',
        'one_to_one',
        'courtesy_meet',
        'scheduled',
        'IT Park, Bangalore',
        'physical',
        timestamptz '2026-11-22 08:20:00+05:30',
        timestamptz '2026-11-22 10:30:00+05:30'
    FROM creator, amc
    WHERE NOT EXISTS (
        SELECT 1 FROM meetings m
        WHERE m.created_by = creator.id AND m.title = 'Call with Arun' AND m.status = 'scheduled'
    )
    RETURNING id
)
INSERT INTO meeting_targets (meeting_id, role, target_type, user_id)
SELECT ins.id, 'participant', 'user', participant.id
FROM ins, participant;

-- 2) Cancelled scheduled meeting
WITH creator AS (
    SELECT id FROM users WHERE email = 'vikram.singh@trygiraffes.dev'
),
amc AS (
    SELECT id FROM amcs WHERE code = '100003738'
),
participant AS (
    SELECT id FROM users WHERE email = 'aatya.sharma@trygiraffes.dev'
),
ins AS (
    INSERT INTO meetings (
        created_by, amc_id, title, description, arn,
        mode, meeting_type, purpose, status,
        location, location_kind, starts_at, ends_at, cancelled_at
    )
    SELECT
        creator.id,
        amc.id,
        'Conference call',
        'Weekly conference sync',
        '@1767889',
        'scheduled',
        'one_to_many',
        'product',
        'cancelled',
        'Online',
        'virtual',
        timestamptz '2026-11-21 08:20:00+05:30',
        timestamptz '2026-11-21 10:30:00+05:30',
        timestamptz '2026-11-20 18:00:00+05:30'
    FROM creator, amc
    WHERE NOT EXISTS (
        SELECT 1 FROM meetings m
        WHERE m.created_by = creator.id AND m.title = 'Conference call' AND m.status = 'cancelled'
    )
    RETURNING id
),
tgt AS (
    INSERT INTO meeting_targets (meeting_id, role, target_type, user_id)
    SELECT ins.id, 'participant', 'user', participant.id
    FROM ins, participant
    RETURNING meeting_id
)
INSERT INTO meeting_cancellations (meeting_id, cancelled_by, reason)
SELECT tgt.meeting_id, creator.id, 'Partner requested a later slot.'
FROM tgt, creator;

-- 3) Instant one-to-many (started) with group participant + broadcast
WITH creator AS (
    SELECT id FROM users WHERE email = 'vikram.singh@trygiraffes.dev'
),
amc AS (
    SELECT id FROM amcs WHERE code = '100003738'
),
neon AS (
    SELECT g.id
    FROM groups g
    INNER JOIN amcs a ON a.id = g.amc_id
    WHERE a.code = '100003738' AND g.name = 'Group Neon'
),
broadcast_user AS (
    SELECT id FROM users WHERE email = 'arjun.wadhwa@trygiraffes.dev'
),
ins AS (
    INSERT INTO meetings (
        created_by, amc_id, title, description, arn,
        mode, meeting_type, purpose, status,
        starts_at, ends_at, thumbnail_url
    )
    SELECT
        creator.id,
        amc.id,
        'NFO Discussion',
        'NFO launch discussion..',
        '@1767889',
        'instant',
        'one_to_many',
        'nfo',
        'started',
        now(),
        now() + interval '1 hour',
        '/uploads/thumbnails/nfo-discussion.png'
    FROM creator, amc
    WHERE NOT EXISTS (
        SELECT 1 FROM meetings m
        WHERE m.created_by = creator.id AND m.title = 'NFO Discussion' AND m.mode = 'instant'
    )
    RETURNING id
)
INSERT INTO meeting_targets (meeting_id, role, target_type, user_id, group_id)
SELECT ins.id, 'participant', 'group', NULL, neon.id FROM ins, neon
UNION ALL
SELECT ins.id, 'broadcast', 'user', broadcast_user.id, NULL FROM ins, broadcast_user
UNION ALL
SELECT ins.id, 'broadcast', 'group', NULL, neon.id FROM ins, neon;
