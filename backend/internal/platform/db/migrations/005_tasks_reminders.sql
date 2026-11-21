CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    amc_id UUID NOT NULL REFERENCES amcs (id),
    title TEXT NOT NULL,
    due_date DATE NOT NULL,
    done BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tasks_user_due_date_idx ON tasks (user_id, due_date);
CREATE INDEX IF NOT EXISTS tasks_amc_id_idx ON tasks (amc_id);

CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    amc_id UUID NOT NULL REFERENCES amcs (id),
    title TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    remind_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reminders_user_remind_at_idx ON reminders (user_id, remind_at);
CREATE INDEX IF NOT EXISTS reminders_amc_id_idx ON reminders (amc_id);
