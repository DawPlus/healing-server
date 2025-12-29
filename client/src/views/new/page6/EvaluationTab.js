import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';
import { createKoreanPdf, safeText } from 'utils/koreanFonts';

// PDF 생성
const handlePrint = () => {
  try {
    if (!selectedReservation) {
      showAlert('선택된 예약이 없습니다.', 'warning');
      return;
    }

    // PDF 생성
    const doc = createKoreanPdf();
    
    // 제목
    doc.setFontSize(18);
    doc.setTextColor(44, 62, 80);
    doc.text(safeText('교육 프로그램 평가서'), 105, 20, { align: 'center' });
    
    // 부제목
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(safeText('<별첨8>'), 14, 20);
    
    // 단체 정보 박스
    doc.setFillColor(246, 249, 252);
    doc.setDrawColor(220, 226, 231);
    doc.roundedRect(14, 25, 182, 15, 2, 2, 'FD');
    
    // 단체 및 일자 정보
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.setFont('NotoSansKR', 'bold');
    doc.text(safeText(`${selectedReservation.group_name || '연천군가족재단'}`), 20, 33);
    
    const formattedDate = `${moment(selectedReservation.start_date).format('YYYY년 MM월 DD일')} ~ ${moment(selectedReservation.end_date).format('YYYY년 MM월 DD일')}`;
    doc.text(safeText(formattedDate), 150, 33);
    
    // 설문 결과 섹션
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.setFont('NotoSansKR', 'bold');
    doc.text(safeText('1. 프로그램 만족도 평가'), 14, 50);
    
    // 헤더
    const headers = [
      [
        safeText('평가 항목'), 
        safeText('매우 만족'), 
        safeText('만족'), 
        safeText('보통'), 
        safeText('불만족'), 
        safeText('매우 불만족')
      ]
    ];
    
    // 데이터
    const tableData = [
      [safeText('1. 프로그램의 내용은 유익했다'), safeText(''), safeText(''), safeText(''), safeText(''), safeText('')],
      [safeText('2. 프로그램 진행 방식은 적절했다'), safeText(''), safeText(''), safeText(''), safeText(''), safeText('')],
      [safeText('3. 프로그램 진행자는 전문성이 있었다'), safeText(''), safeText(''), safeText(''), safeText(''), safeText('')],
      [safeText('4. 프로그램 장소와 시설은 적합했다'), safeText(''), safeText(''), safeText(''), safeText(''), safeText('')],
      [safeText('5. 프로그램 시간 배분은 적절했다'), safeText(''), safeText(''), safeText(''), safeText(''), safeText('')],
      [safeText('6. 전반적인 프로그램 운영에 만족한다'), safeText(''), safeText(''), safeText(''), safeText(''), safeText('')]
    ];
    
    // 테이블 그리기
    doc.autoTable({
      startY: 55,
      head: headers,
      body: tableData,
      theme: 'grid',
      styles: { 
        fontSize: 9,
        cellPadding: 3,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
        valign: 'middle'
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [60, 60, 60],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [246, 249, 252], halign: 'left', cellWidth: 80 },
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'center', cellWidth: 20 },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'center', cellWidth: 20 },
        5: { halign: 'center', cellWidth: 20 }
      }
    });
    
    // 프로그램별 평가 섹션
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.setFont('NotoSansKR', 'bold');
    doc.text(safeText('2. 프로그램별 평가'), 14, finalY);
    
    // 프로그램별 평가 테이블
    const programHeaders = [
      [
        safeText('프로그램명'), 
        safeText('잘된 점'), 
        safeText('개선할 점')
      ]
    ];
    
    // 프로그램별 평가 데이터
    const programData = [];
    
    // 데이터가 있다면 실제 데이터로 채우고, 없다면 빈 행 추가
    const evaluationItems = evaluationData?.getEvaluationItems || [];
    
    if (evaluationItems.length > 0) {
      evaluationItems.forEach(item => {
        programData.push([
          safeText(item.program_name || ''),
          safeText(item.good_points || ''),
          safeText(item.improvement_points || '')
        ]);
      });
    } else {
      // 빈 데이터
      for (let i = 0; i < 3; i++) {
        programData.push([safeText(''), safeText(''), safeText('')]);
      }
    }
    
    // 프로그램별 평가 테이블 그리기
    doc.autoTable({
      startY: finalY + 5,
      head: programHeaders,
      body: programData,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
        minCellHeight: 20
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [60, 60, 60],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [246, 249, 252], halign: 'center', cellWidth: 40 },
        1: { halign: 'left', cellWidth: 70 },
        2: { halign: 'left', cellWidth: 70 }
      }
    });
    
    // 총평 섹션
    const finalY2 = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.setFont('NotoSansKR', 'bold');
    doc.text(safeText('3. 총평 및 제안사항'), 14, finalY2);
    
    // 총평 및 제안사항 박스
    doc.setFillColor(252, 252, 252);
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(14, finalY2 + 5, 182, 40, 2, 2, 'FD');
    
    // 총평 데이터가 있으면 출력
    if (evaluationData?.getEvaluation?.overall_review) {
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.setFont('NotoSansKR', 'normal');
      
      // 텍스트 줄바꿈 처리 (최대 너비 170)
      const splitText = doc.splitTextToSize(safeText(evaluationData.getEvaluation.overall_review), 170);
      doc.text(splitText, 20, finalY2 + 15);
    }
    
    // 작성자 정보 섹션
    const finalY3 = finalY2 + 50;
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.setFont('NotoSansKR', 'normal');
    
    // 작성 일자
    const today = moment().format('YYYY년 MM월 DD일');
    doc.text(safeText(`작성일: ${today}`), 150, finalY3);
    
    // 작성자
    doc.text(safeText(`작성자: ${evaluationData?.getEvaluation?.writer || ''}`), 150, finalY3 + 7);
    
    // 안내 문구
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('NotoSansKR', 'normal');
    
    // 안내 박스
    doc.setFillColor(249, 249, 249);
    doc.setDrawColor(230, 230, 230);
    doc.roundedRect(14, finalY3 + 20, 182, 15, 2, 2, 'FD');
    
    doc.text(safeText('※ 평가서는 프로그램 종료 후 작성하며, 향후 프로그램 개선에 활용됩니다.'), 20, finalY3 + 27);
    doc.text(safeText('※ 모든 의견은 소중히 반영하여 더 나은 프로그램을 제공하겠습니다.'), 20, finalY3 + 32);
    
    // PDF 저장
    doc.save(`평가서_${selectedReservation.group_name || 'default'}_${moment().format('YYYYMMDD')}.pdf`);
    
  } catch (error) {
    console.error('PDF 생성 오류:', error);
    showAlert('PDF 생성 중 오류가 발생했습니다.', 'error');
  }
}; 