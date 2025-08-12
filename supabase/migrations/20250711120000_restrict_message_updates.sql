-- Drop existing update policy and replace with one allowing updates only for sender or receiver
DROP POLICY IF EXISTS "Participants can update messages" ON messages;

CREATE POLICY "Participants can update read status" ON messages
  FOR UPDATE USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  ) WITH CHECK (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- Trigger function to reject updates to any column other than 'read'
CREATE OR REPLACE FUNCTION restrict_messages_updates()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    OLD.sender_id IS DISTINCT FROM NEW.sender_id OR
    OLD.receiver_id IS DISTINCT FROM NEW.receiver_id OR
    OLD.content IS DISTINCT FROM NEW.content OR
    OLD.created_at IS DISTINCT FROM NEW.created_at OR
    OLD.id IS DISTINCT FROM NEW.id
  ) THEN
    RAISE EXCEPTION 'Only the read column may be updated';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_read_only_update ON messages;
CREATE TRIGGER ensure_read_only_update
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION restrict_messages_updates();

-- Indexes to optimize message lookups
CREATE INDEX IF NOT EXISTS messages_pair_idx ON messages (sender_id, receiver_id, created_at);
CREATE INDEX IF NOT EXISTS messages_receiver_read_idx ON messages (receiver_id, read);

