import { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { createPdf } from '../utils/createPdf';

const ContractWrite = () => {
    const navigate = useNavigate();
    const sigCanvas = useRef<SignatureCanvas>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        sessionCount: 10,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        price: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const clearSignature = () => sigCanvas.current?.clear();

    const handleSave = async () => {
        if (!formData.name || !formData.phone) return alert('이름과 연락처를 입력해주세요.');
        if (sigCanvas.current?.isEmpty()) return alert('서명이 필요합니다.');

        try {
            setIsSubmitting(true);

            let memberId;

            const { data: existingMember } = await supabase
                .from('members')
                .select('id')
                .eq('phone', formData.phone)
                .single();

            if (existingMember) {
                memberId = existingMember.id;
            } else {
                const { data: newMember, error: memberError } = await supabase
                    .from('members')
                    .insert([{
                        name: formData.name,
                        phone: formData.phone
                    }])
                    .select()
                    .single();

                if (memberError) throw memberError;
                memberId = newMember.id;
            }

            const pdfBlob = await createPdf('contract-area');
            const fileName = `${memberId}_${Date.now()}.pdf`;

            const { error: uploadError } = await supabase
                .storage
                .from('contracts')
                .upload(fileName, pdfBlob, {
                    contentType: 'application/pdf',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase
                .storage
                .from('contracts')
                .getPublicUrl(fileName);

            const { error: contractError } = await supabase
                .from('contracts')
                .insert([{
                    member_id: memberId,
                    session_count: Number(formData.sessionCount),
                    start_date: formData.startDate,
                    end_date: formData.endDate || formData.startDate,
                    price: Number(formData.price.replace(/,/g, '')) || 0,
                    file_url: publicUrl,
                }]);

            if (contractError) throw contractError;

            alert('계약이 성공적으로 등록되었습니다!');
            navigate('/');

        } catch (error: any) {
            console.error('Save Error:', error);
            alert(`저장 중 오류가 발생했습니다: ${error.message || error}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="bg-white p-4 shadow-sm flex items-center gap-3 sticky top-0 z-20">
                <button onClick={() => navigate(-1)} className="text-gray-600"><ArrowLeft size={24} /></button>
                <h2 className="text-lg font-bold text-gray-800">신규 계약서 작성</h2>
            </div>

            <div className="flex-1 overflow-y-auto pb-24" id="pdf-scroll-container">
                <div id="contract-area" className="bg-white max-w-2xl mx-auto min-h-screen p-6 md:p-10 text-gray-800">

                    <div className="text-center border-b-2 border-black pb-4 mb-8">
                        <h1 className="text-2xl font-bold tracking-widest">회원 등록 계약서</h1>
                        <p className="text-sm text-gray-500 mt-2">GymSign Pilates & Fitness</p>
                    </div>

                    <section className="mb-8">
                        <h3 className="text-md font-bold border-l-4 border-blue-600 pl-2 mb-4">1. 회원 정보</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">성명</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="이름 입력"
                                       className="w-full border-b border-gray-300 py-1 px-2 focus:border-blue-500 outline-none bg-transparent" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">연락처</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="010-0000-0000"
                                       className="w-full border-b border-gray-300 py-1 px-2 focus:border-blue-500 outline-none bg-transparent" />
                            </div>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h3 className="text-md font-bold border-l-4 border-blue-600 pl-2 mb-4">2. 등록 내용</h3>
                        <table className="w-full text-sm border-collapse border border-gray-300">
                            <tbody>
                            <tr>
                                <td className="border border-gray-300 p-2 bg-gray-50 font-bold w-24">등록 상품</td>
                                <td className="border border-gray-300 p-2">
                                    1:1 개인레슨 <span className="font-bold underline ml-1">{formData.sessionCount}</span> 회
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 p-2 bg-gray-50 font-bold">이용 기간</td>
                                <td className="border border-gray-300 p-2 flex gap-2 items-center">
                                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="bg-transparent outline-none" />
                                    ~
                                    <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="bg-transparent outline-none" />
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 p-2 bg-gray-50 font-bold">결제 금액</td>
                                <td className="border border-gray-300 p-2">
                                    <input type="text" name="price" value={formData.price} onChange={handleChange} placeholder="금액 입력"
                                           className="text-right w-24 outline-none border-b border-gray-300" /> 원
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </section>

                    <section className="mb-8">
                        <h3 className="text-md font-bold border-l-4 border-blue-600 pl-2 mb-4">3. 약관 동의</h3>
                        <div className="text-[10px] text-gray-500 leading-tight border border-gray-200 p-3 rounded h-32 overflow-hidden">
                            본인은 위 내용과 뒷면의 약관(또는 별첨된 이용수칙)을 충분히 숙지하였으며, 이에 동의하여 본 계약을 체결합니다.
                            <br/><br/>
                            제1조 (환불 규정) ... (생략) ...
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <input type="checkbox" id="agree" className="w-4 h-4" />
                            <label htmlFor="agree" className="text-sm font-bold">위 약관에 동의합니다.</label>
                        </div>
                    </section>

                    <section>
                        <div className="flex justify-between items-end mb-2">
                            <div className="text-sm">
                                계약일: {new Date().toLocaleDateString()}
                            </div>
                            <button onClick={clearSignature} className="text-xs text-red-500 border border-red-200 px-2 py-1 rounded">서명 지우기</button>
                        </div>

                        <div className="border-2 border-black h-40 relative touch-none bg-gray-50">
                            <SignatureCanvas
                                ref={sigCanvas}
                                canvasProps={{ className: 'w-full h-full block' }}
                                backgroundColor="rgba(255,255,255,0)"
                            />
                            <div className="absolute bottom-1 right-2 text-xs text-gray-400 pointer-events-none">
                                (인/서명)
                            </div>
                        </div>
                    </section>

                </div>
            </div>

            <div className="fixed bottom-0 max-w-md w-full bg-white p-4 border-t border-gray-200 z-20">
                <button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="w-full py-3 text-white font-bold bg-blue-600 rounded-xl shadow-lg hover:bg-blue-700 transition flex justify-center items-center gap-2 disabled:bg-gray-400"
                >
                    {isSubmitting ? (
                        <> <Loader2 className="animate-spin" /> 저장 중... </>
                    ) : (
                        <> <Save size={20} /> 계약 완료 및 저장 </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ContractWrite;