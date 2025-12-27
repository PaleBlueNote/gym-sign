import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2 } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // 로그인 성공 시 대시보드로 이동
            navigate('/');
        } catch (error: any) {
            alert('로그인 실패: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-blue-600 mb-2">GymSign</h1>
                    <p className="text-gray-500 text-sm">관리자 전용 로그인</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">이메일</label>
                        <div className="relative">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                placeholder="admin@gymsign.com"
                            />
                            <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">비밀번호</label>
                        <div className="relative">
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                placeholder="••••••••"
                            />
                            <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-200 flex justify-center items-center mt-6 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : '로그인'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;