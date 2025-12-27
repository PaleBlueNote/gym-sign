import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const createPdf = async (elementId: string): Promise<Blob> => {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error('PDF로 변환할 요소를 찾을 수 없습니다.');
    }

    // 1. HTML 요소를 캔버스(이미지)로 변환
    const canvas = await html2canvas(element, {
        scale: 2, // 해상도 2배 (선명하게)
        useCORS: true, // 이미지 로딩 문제 방지
        logging: false,
        backgroundColor: '#ffffff', // 배경색 흰색 고정
    });

    // 2. 이미지를 PDF 규격에 맞게 조정
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 가로 (mm)
    const pageHeight = 297; // A4 세로 (mm)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // 3. PDF 생성 (A4 세로 방향)
    const pdf = new jsPDF('p', 'mm', 'a4');
    let heightLeft = imgHeight;
    let position = 0;

    // 첫 페이지 추가
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // 내용이 길면 페이지 추가 (계약서가 길 경우 대비)
    while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
    }

    // 4. Blob 형태로 반환 (파일 업로드용)
    return pdf.output('blob');
};