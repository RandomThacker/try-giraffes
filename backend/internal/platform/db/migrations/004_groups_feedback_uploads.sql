-- Dynamic feedback questions (AMC-scoped templates)
CREATE TABLE IF NOT EXISTS feedback_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amc_id UUID NOT NULL REFERENCES amcs (id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users (id),
    prompt TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('paragraph', 'mcq', 'linear_scale', 'checkbox')),
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    scale_min INT,
    scale_max INT,
    position INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS feedback_questions_amc_position_idx
    ON feedback_questions (amc_id, position, created_at);

-- Per-meeting feedback submission summary
CREATE TABLE IF NOT EXISTS meeting_feedback_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL UNIQUE REFERENCES meetings (id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES users (id),
    skipped BOOLEAN NOT NULL DEFAULT false,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meeting_feedback_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES meeting_feedback_submissions (id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES feedback_questions (id) ON DELETE CASCADE,
    answer_text TEXT,
    answer_options JSONB NOT NULL DEFAULT '[]'::jsonb,
    answer_scale INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (submission_id, question_id)
);

-- Seed default feedback questions for AMC 100003738 (idempotent by prompt+type)
WITH amc AS (
    SELECT id FROM amcs WHERE code = '100003738'
),
creator AS (
    SELECT id FROM users WHERE email = 'vikram.singh@trygiraffes.dev'
)
INSERT INTO feedback_questions (amc_id, created_by, prompt, question_type, options, scale_min, scale_max, position)
SELECT amc.id, creator.id, q.prompt, q.question_type, q.options::jsonb, q.scale_min, q.scale_max, q.position
FROM amc
CROSS JOIN creator
CROSS JOIN (
    VALUES
        (
            'How likely is it that you would recommend the event to a friend or colleague?',
            'paragraph',
            '[]',
            NULL::INT,
            NULL::INT,
            1
        ),
        (
            'Overall, how would you rate the event?',
            'mcq',
            '["Excellent","Good","Average","Poor"]',
            NULL,
            NULL,
            2
        ),
        (
            'What did you like about the event?',
            'linear_scale',
            '[]',
            1,
            10,
            3
        ),
        (
            'What did you dislike about the event?',
            'checkbox',
            '["Timing","Content","Venue","Other"]',
            NULL,
            NULL,
            4
        )
) AS q(prompt, question_type, options, scale_min, scale_max, position)
WHERE NOT EXISTS (
    SELECT 1
    FROM feedback_questions fq
    WHERE fq.amc_id = amc.id AND fq.prompt = q.prompt
);
