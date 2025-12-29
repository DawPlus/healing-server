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
    doc.text(safeText('만족도 조사 결과'), 105, 20, { align: 'center' });
    
    // 부제목
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(safeText('<별첨7>'), 14, 20);
    
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
    
    // 기본 정보 섹션
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.setFont('NotoSansKR', 'bold');
    doc.text(safeText('1. 설문 조사 기본 정보'), 14, 50);
    
    // 설문 정보 테이블
    const surveyInfoHeaders = [
      [
        safeText('구분'), 
        safeText('내용')
      ]
    ];
    
    const participantCount = satisfactionData?.getSatisfaction?.participant_count || 0;
    const responseCount = satisfactionData?.getSatisfaction?.response_count || 0;
    const responseRate = participantCount > 0 ? Math.round((responseCount / participantCount) * 100) : 0;
    
    const surveyInfoData = [
      [safeText('조사 대상'), safeText(`${selectedReservation.group_name || '연천군가족재단'} 프로그램 참여자`)],
      [safeText('참여자 수'), safeText(`${participantCount}명`)],
      [safeText('응답자 수'), safeText(`${responseCount}명`)],
      [safeText('응답률'), safeText(`${responseRate}%`)],
      [safeText('조사 기간'), safeText(formattedDate)],
      [safeText('조사 방법'), safeText('프로그램 종료 후 만족도 및 효과평가 입력')]
    ];
    
    // 설문 정보 테이블 그리기
    doc.autoTable({
      startY: 55,
      head: surveyInfoHeaders,
      body: surveyInfoData,
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
        0: { fontStyle: 'bold', fillColor: [246, 249, 252], halign: 'center', cellWidth: 40 },
        1: { halign: 'left', cellWidth: 140 }
      }
    });
    
    // 만족도 결과 섹션
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.setFont('NotoSansKR', 'bold');
    doc.text(safeText('2. 만족도 조사 결과'), 14, finalY);
    
    // 만족도 결과 테이블
    const resultHeaders = [
      [
        safeText('항목'), 
        safeText('매우 만족'), 
        safeText('만족'), 
        safeText('보통'), 
        safeText('불만족'), 
        safeText('매우 불만족'),
        safeText('평균(5점)')
      ]
    ];
    
    // 만족도 결과 데이터
    const resultData = [];
    
    // 데이터가 있다면 실제 데이터로 채우고, 없다면 기본 항목 추가
    const satisfactionItems = satisfactionData?.getSatisfactionItems || [];
    
    if (satisfactionItems.length > 0) {
      satisfactionItems.forEach(item => {
        // 점수 계산 (5점 만점)
        const scores = [
          Number(item.very_satisfied || 0),
          Number(item.satisfied || 0),
          Number(item.neutral || 0),
          Number(item.dissatisfied || 0),
          Number(item.very_dissatisfied || 0)
        ];
        
        const totalResponses = scores.reduce((acc, curr) => acc + curr, 0);
        const weightedSum = scores[0] * 5 + scores[1] * 4 + scores[2] * 3 + scores[3] * 2 + scores[4] * 1;
        const average = totalResponses > 0 ? (weightedSum / totalResponses).toFixed(2) : '0.00';
        
        resultData.push([
          safeText(item.item_name || ''),
          safeText(item.very_satisfied || '0'),
          safeText(item.satisfied || '0'),
          safeText(item.neutral || '0'),
          safeText(item.dissatisfied || '0'),
          safeText(item.very_dissatisfied || '0'),
          safeText(average)
        ]);
      });
    } else {
      // 기본 항목
      const defaultItems = [
        '프로그램 내용',
        '강사/진행자',
        '교육환경/시설',
        '교육시간/일정',
        '프로그램 운영'
      ];
      
      defaultItems.forEach(item => {
        resultData.push([
          safeText(item),
          safeText('0'),
          safeText('0'),
          safeText('0'),
          safeText('0'),
          safeText('0'),
          safeText('0.00')
        ]);
      });
    }
    
    // 평균 점수 계산을 위한 데이터
    const averageScores = resultData.map(row => parseFloat(row[6]));
    const totalAverage = averageScores.length > 0 
      ? (averageScores.reduce((acc, curr) => acc + parseFloat(curr), 0) / averageScores.length).toFixed(2)
      : '0.00';
    
    // 전체 평균 행 추가
    resultData.push([
      safeText('전체 평균'),
      safeText(''),
      safeText(''),
      safeText(''),
      safeText(''),
      safeText(''),
      safeText(totalAverage)
    ]);
    
    // 만족도 결과 테이블 그리기
    doc.autoTable({
      startY: finalY + 5,
      head: resultHeaders,
      body: resultData,
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
        0: { fontStyle: 'bold', fillColor: [246, 249, 252], halign: 'left', cellWidth: 40 },
        1: { halign: 'center', cellWidth: 22 },
        2: { halign: 'center', cellWidth: 22 },
        3: { halign: 'center', cellWidth: 22 },
        4: { halign: 'center', cellWidth: 22 },
        5: { halign: 'center', cellWidth: 22 },
        6: { halign: 'center', cellWidth: 30, fontStyle: 'bold' }
      },
      didDrawCell: (data) => {
        // 마지막 행(전체 평균) 색상 변경
        if (data.row.index === resultData.length - 1) {
          doc.setFillColor(240, 240, 240);
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          doc.setTextColor(60, 60, 60);
          doc.setFontSize(9);
          doc.setFont('NotoSansKR', 'bold');
          
          // 텍스트 중앙 정렬
          if (data.column.index === 0) {
            const textWidth = doc.getTextWidth(safeText('전체 평균'));
            const textX = data.cell.x + (data.cell.width - textWidth) / 2;
            doc.text(safeText('전체 평균'), textX, data.cell.y + data.cell.height / 2 + 3);
          } else if (data.column.index === 6) {
            const textWidth = doc.getTextWidth(safeText(totalAverage));
            const textX = data.cell.x + (data.cell.width - textWidth) / 2;
            doc.text(safeText(totalAverage), textX, data.cell.y + data.cell.height / 2 + 3);
          }
          return false; // 기본 텍스트 렌더링 방지
        }
      }
    });
    
    // 자유 의견 섹션
    const finalY2 = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.setFont('NotoSansKR', 'bold');
    doc.text(safeText('3. 자유 의견'), 14, finalY2);
    
    // 자유 의견 데이터
    const freeOpinions = satisfactionData?.getSatisfactionComments || [];
    
    if (freeOpinions.length > 0) {
      // 의견 박스
      doc.setFillColor(252, 252, 252);
      doc.setDrawColor(220, 220, 220);
      
      let currentY = finalY2 + 5;
      freeOpinions.forEach((opinion, index) => {
        // 각 의견을 번호와 함께 표시
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.setFont('NotoSansKR', 'normal');
        
        // 텍스트 줄바꿈 처리 (최대 너비 170)
        const opinionText = `${index + 1}. ${opinion.comment || ''}`;
        const splitText = doc.splitTextToSize(safeText(opinionText), 170);
        
        // 텍스트 높이 계산
        const textHeight = splitText.length * 5 + 10;
        
        // 의견 박스 그리기
        doc.roundedRect(14, currentY, 182, textHeight, 2, 2, 'FD');
        
        // 텍스트 그리기
        doc.text(splitText, 20, currentY + 7);
        
        // 다음 의견을 위한 Y 위치 업데이트
        currentY += textHeight + 5;
      });
    } else {
      // 의견이 없는 경우
      doc.setFillColor(252, 252, 252);
      doc.setDrawColor(220, 220, 220);
      doc.roundedRect(14, finalY2 + 5, 182, 20, 2, 2, 'FD');
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont('NotoSansKR', 'italic');
      doc.text(safeText('등록된 자유 의견이 없습니다.'), 105, finalY2 + 15, { align: 'center' });
    }
    
    // PDF 저장
    doc.save(`만족도조사_${selectedReservation.group_name || 'default'}_${moment().format('YYYYMMDD')}.pdf`);
    
  } catch (error) {
    console.error('PDF 생성 오류:', error);
    showAlert('PDF 생성 중 오류가 발생했습니다.', 'error');
  }
}; 