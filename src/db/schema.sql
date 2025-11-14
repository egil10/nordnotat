-- Profiles table (extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  university text,
  bio text,
  created_at timestamptz DEFAULT now()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  course_code text,
  university text,
  tags text[],
  price int NOT NULL,
  summary text,
  difficulty int,
  file_path text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid REFERENCES profiles(id),
  document_id uuid REFERENCES documents(id),
  payment_id text,
  amount int,
  platform_fee int,
  seller_amount int,
  created_at timestamptz DEFAULT now()
);

-- Flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  front text NOT NULL,
  back text NOT NULL
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id serial PRIMARY KEY,
  university text,
  course_code text,
  course_name text
);

-- Course stats table
CREATE TABLE IF NOT EXISTS course_stats (
  id serial PRIMARY KEY,
  course_code text,
  avg_gpa float,
  fail_rate float,
  difficulty float,
  year int
);

-- User grades table
CREATE TABLE IF NOT EXISTS user_grades (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  course_code text,
  grade text
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_course_code ON documents(course_code);
CREATE INDEX IF NOT EXISTS idx_documents_university ON documents(university);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer_id ON purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_document_id ON purchases(document_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_document_id ON flashcards(document_id);
CREATE INDEX IF NOT EXISTS idx_user_grades_user_id ON user_grades(user_id);
CREATE INDEX IF NOT EXISTS idx_user_grades_course_code ON user_grades(course_code);

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_grades ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Documents policies
CREATE POLICY "Anyone can view documents" ON documents FOR SELECT USING (true);
CREATE POLICY "Users can create documents" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON documents FOR DELETE USING (auth.uid() = user_id);

-- Purchases policies
CREATE POLICY "Users can view own purchases" ON purchases FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Users can create purchases" ON purchases FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Flashcards policies
CREATE POLICY "Anyone can view flashcards" ON flashcards FOR SELECT USING (true);
CREATE POLICY "Users can create flashcards" ON flashcards FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM documents WHERE documents.id = flashcards.document_id AND documents.user_id = auth.uid())
);

-- User grades policies
CREATE POLICY "Users can view own grades" ON user_grades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own grades" ON user_grades FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own grades" ON user_grades FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own grades" ON user_grades FOR DELETE USING (auth.uid() = user_id);

