// 기존 import 문에 useNavigate, supabase 추가
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, PenTool, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate(); // 추가

    // 로그아웃 핸들러 추가
    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path ? "text-blue-600" : "text-gray-400";

    return (
        <div className="flex flex-col h-screen bg-gray-100 max-w-md mx-auto shadow-2xl overflow-hidden">
            <header className="bg-white p-4 shadow-sm flex justify-between items-center z-10">
                <h1 className="text-lg font-bold text-blue-600">GymSign</h1>
                {/* 로그아웃 버튼에 onClick 연결 */}
                <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 flex items-center gap-1 hover:text-red-500 transition"
                >
                    <LogOut size={16} /> 로그아웃
                </button>
            </header>

            {/* ... 나머지 코드는 그대로 유지 ... */}
            <main className="flex-1 overflow-y-auto pb-20">
                <Outlet />
            </main>

            <nav className="bg-white border-t border-gray-200 p-2 flex justify-around items-center absolute bottom-0 w-full max-w-md pb-6 pt-3">
                {/* ... 기존 네비게이션 코드 유지 ... */}
                <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/')}`}>
                    <Home size={24} />
                    <span className="text-xs">홈</span>
                </Link>

                <Link to="/write" className="relative -top-5">
                    <div className="bg-blue-600 p-4 rounded-full shadow-lg text-white hover:bg-blue-700 transition-colors">
                        <PenTool size={24} />
                    </div>
                </Link>

                <Link to="/settings" className={`flex flex-col items-center gap-1 ${isActive('/settings')}`}>
                    <div className="w-6 h-6 rounded-full bg-gray-200" />
                    <span className="text-xs">내 정보</span>
                </Link>
            </nav>
        </div>
    );
};

export default Layout;