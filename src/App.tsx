import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabaseClient'; // 추가
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ContractWrite from './pages/ContractWrite';
import Login from './pages/Login';

function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. 현재 세션 확인
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // 2. 로그인 상태 변화 감지 (로그인/로그아웃 시 자동 처리)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (!session) {
                navigate('/login'); // 세션 없으면 로그인 화면으로
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    // 로딩 중이면 빈 화면 (또는 로딩 스피너)
    if (loading) return <div className="h-screen bg-gray-100" />;

    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            {/* session이 있을 때만 접근 가능 */}
            {session && (
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="write" element={<ContractWrite />} />
                    <Route path="settings" element={<div className="p-4">설정 페이지</div>} />
                </Route>
            )}

            {/* 세션 없는데 이상한 주소로 오면 로그인으로 보냄 */}
            {!session && !loading && location.pathname !== '/login' && (
                <Route path="*" element={<Login />} />
            )}
        </Routes>
    );
}

export default App;