
CREATE TABLE wallets (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL UNIQUE REFERENCES users(id),
    balance     NUMERIC(14,2) NOT NULL DEFAULT 1000 CHECK (balance >= 0),
    currency    VARCHAR(3) NOT NULL DEFAULT 'INR' CHECK (currency IN ('INR', 'USD')),
    status      VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);