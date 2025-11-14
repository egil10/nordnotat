export interface Profile {
  id: string;
  full_name: string | null;
  university: string | null;
  bio: string | null;
  created_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  course_code: string | null;
  university: string | null;
  tags: string[] | null;
  price: number;
  summary: string | null;
  difficulty: number | null;
  file_path: string;
  created_at: string;
}

export interface Purchase {
  id: string;
  buyer_id: string;
  document_id: string;
  payment_id: string | null;
  amount: number;
  platform_fee: number;
  seller_amount: number;
  created_at: string;
}

export interface Flashcard {
  id: string;
  document_id: string;
  front: string;
  back: string;
}

export interface Course {
  id: number;
  university: string | null;
  course_code: string | null;
  course_name: string | null;
}

export interface CourseStats {
  id: number;
  course_code: string | null;
  avg_gpa: number | null;
  fail_rate: number | null;
  difficulty: number | null;
  year: number | null;
}

export interface UserGrade {
  id: number;
  user_id: string;
  course_code: string | null;
  grade: string | null;
}

export interface DocumentWithProfile extends Document {
  profile: Profile;
}

export interface UploadFormData {
  title: string;
  description: string;
  course_code: string;
  university: string;
  price: number;
  file: File;
}

