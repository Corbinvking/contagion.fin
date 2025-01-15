/*
  # Mutation Voting System

  1. New Tables
    - `mutations`
      - `id` (text, primary key)
      - `name` (text)
      - `type` (text)
      - `description` (text)
      - `current_votes` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamp)
    - `mutation_votes`
      - `id` (uuid, primary key)
      - `mutation_id` (text, references mutations)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - Read all mutations
      - Vote once per mutation
      - Read their own votes
*/

-- Create mutations table
CREATE TABLE IF NOT EXISTS mutations (
  id text PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  description text NOT NULL,
  current_votes integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create mutation votes table
CREATE TABLE IF NOT EXISTS mutation_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mutation_id text REFERENCES mutations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(mutation_id, user_id)
);

-- Enable RLS
ALTER TABLE mutations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mutation_votes ENABLE ROW LEVEL SECURITY;

-- Policies for mutations table
CREATE POLICY "Anyone can read mutations"
  ON mutations
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for mutation_votes table
CREATE POLICY "Users can vote once per mutation"
  ON mutation_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    NOT EXISTS (
      SELECT 1 FROM mutation_votes
      WHERE user_id = auth.uid()
      AND mutation_id = mutation_votes.mutation_id
    )
  );

CREATE POLICY "Users can read their own votes"
  ON mutation_votes
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Function to update mutation vote count
CREATE OR REPLACE FUNCTION update_mutation_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE mutations
    SET current_votes = current_votes + 1
    WHERE id = NEW.mutation_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE mutations
    SET current_votes = current_votes - 1
    WHERE id = OLD.mutation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for vote count updates
CREATE TRIGGER update_mutation_votes_trigger
AFTER INSERT OR DELETE ON mutation_votes
FOR EACH ROW
EXECUTE FUNCTION update_mutation_votes();