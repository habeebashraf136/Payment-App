
CREATE TYPE transaction_status AS ENUM ('success', 'failed', 'pending');
CREATE TYPE transaction_type   AS ENUM ('transfer');
CREATE TYPE currency_code      AS ENUM ('INR', 'USD');

CREATE TABLE transactions (
    sender_id     UUID NOT NULL REFERENCES users(id),
    receiver_id   UUID NOT NULL REFERENCES users(id),
    amount        NUMERIC(9, 2) NOT NULL CHECK (amount >= 0),
    currency      currency_code NOT NULL,
    status        transaction_status NOT NULL DEFAULT 'success',
    type          transaction_type NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactons_sender    ON transactions(sender_id);
CREATE INDEX idx_transactions_receiver ON transactions(receiver_id);

