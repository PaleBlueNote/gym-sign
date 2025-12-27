import { createClient } from '@supabase/supabase-js';

// 환경 변수 가져오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
}

// Supabase 클라이언트 생성 및 내보내기
export const supabase = createClient(supabaseUrl, supabaseAnonKey);