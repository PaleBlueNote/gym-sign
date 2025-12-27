import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Search, FileText, Calendar, Dumbbell, ExternalLink } from 'lucide-react';

// 데이터 타입 정의
interface ContractData {
    id: string;
    created_at: string;
    session_count: number;
    start_date: string;
    end_date: string;
    file_url: string;
    members: {
        name: string;
        phone: string;
    };
}

const Dashboard = () => {
    const [contracts, setContracts] = useState<ContractData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // 데이터 불러오기 함수
    const fetchContracts = async () => {
        try {
            setLoading(true);
            // contracts 테이블에서 데이터를 가져오되, 연결된 members 테이블의 정보(이름, 폰)도 같이 가져옴
            const { data, error } = await supabase
                .from('contracts')
                .select(`
          *,
          members ( name, phone )
        `)
                .order('created_at', { ascending: false }); // 최신순 정렬

            if (error) throw error;
            setContracts(data as any || []); // 타입 단언 사용 (간단한 처리를 위해)
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 마운트 시 데이터 조회
    useEffect(() => {
        fetchContracts();
    }, []);

    // 검색어 필터링 로직
    const filteredContracts = contracts.filter((contract) =>
        contract.members.name.includes(searchTerm) ||
        contract.members.phone.includes(searchTerm)
    );

    return (
        <div className="p-4 min-h-full bg-gray-50 pb-20">
            {/* 1. 상단 타이틀 & 검색바 */}
            <div className="mb-6 sticky top-0 bg-gray-50 pt-2 z-10">
                <h2 className="text-xl font-bold text-gray-800 mb-4">회원권 관리</h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="회원 이름 또는 전화번호 검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 pl-10 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                </div>
            </div>

            {/* 2. 리스트 영역 */}
            {loading ? (
                <div className="text-center py-10 text-gray-500">로딩 중...</div>
            ) : filteredContracts.length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-gray-100">
                    데이터가 없습니다.<br />
                    아래 버튼을 눌러 첫 계약을 등록해보세요!
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredContracts.map((contract) => (
                        <div
                            key={contract.id}
                            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
                            onClick={() => window.open(contract.file_url, '_blank')} // 클릭 시 PDF 열기
                        >
                            {/* 카드 헤더: 이름 & 날짜 */}
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        {contract.members.name}
                                        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {contract.members.phone.slice(-4)}
                    </span>
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-1">
                                        등록일: {new Date(contract.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="bg-blue-50 text-blue-600 p-2 rounded-full">
                                    <FileText size={20} />
                                </div>
                            </div>

                            {/* 구분선 */}
                            <hr className="border-gray-100 my-3" />

                            {/* 상세 정보 그리드 */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Dumbbell size={16} className="text-blue-500" />
                                    <span className="font-semibold">{contract.session_count}회</span>
                                    <span className="text-gray-400 text-xs">개인레슨</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar size={16} className="text-green-500" />
                                    <span>~ {contract.end_date}</span>
                                </div>
                            </div>

                            {/* 하단 바로가기 힌트 */}
                            <div className="mt-4 flex justify-end">
                <span className="text-xs text-blue-500 flex items-center gap-1 font-medium">
                  계약서 보기 <ExternalLink size={12} />
                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;