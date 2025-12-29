import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';

// PDF 생성
const handlePrint = () => {
  try {
    if (!selectedReservation) {
      showAlert('선택된 예약이 없습니다.', 'warning');
      return;
    }

    // PDF 생성
    const doc = new jsPDF();
    
    // 제목
    doc.setFontSize(18);
    doc.setTextColor(44, 62, 80);
    doc.text(`${selectedReservation.program_name || '교육일지'}`, 105, 20, { align: 'center' });
    
    // 부제목
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('<별첨7>', 14, 20);
    
    // 단체 정보 박스
    doc.setFillColor(246, 249, 252);
    doc.setDrawColor(220, 226, 231);
    doc.roundedRect(14, 25, 182, 15, 2, 2, 'FD');
    
    // 단체 및 일자 정보
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'bold');
    doc.text(`${selectedReservation.group_name || '연천군가족재단'}`, 20, 33);
    
    const formattedDate = `${moment(selectedDate).format('YYYY년 MM월 DD일')} (${moment(selectedDate).format('ddd')})`;
    doc.text(formattedDate, 150, 33);
    
    // 일지 작성 섹션 헤더
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.setFont('helvetica', 'bold');
    doc.text('○ 일지 작성', 14, 50);
    
    // 테이블 헤더
    const headers = [
      [
        '시간', 
        '프로그램', 
        '장소', 
        '진행자', 
        '특이사항'
      ]
    ];
    
    // 테이블 데이터
    const tableData = [];
    
    if (educationDiaryData?.getEducationDiary && educationDiaryData.getEducationDiary.length > 0) {
      educationDiaryData.getEducationDiary.forEach(diary => {
        const startTime = diary.start_time ? moment(diary.start_time, 'HH:mm').format('HH:mm') : '';
        const endTime = diary.end_time ? moment(diary.end_time, 'HH:mm').format('HH:mm') : '';
        let timeRange = '';
        
        if (startTime && endTime) {
          timeRange = `${startTime}\n~${endTime}`;
        } else if (startTime) {
          timeRange = startTime;
        }
        
        tableData.push([
          timeRange,
          diary.program_name || '',
          diary.location || '',
          diary.instructor || '',
          diary.special_note || ''
        ]);
      });
    } else {
      // 기본 데이터 (없을 경우)
      tableData.push(
        ['09:00\n~10:30', '', '', '', ''],
        ['10:30\n~12:00', '', '', '', ''],
        ['13:00\n~14:30', '', '', '', ''],
        ['14:30\n~16:00', '', '', '', ''],
        ['16:00\n~17:30', '', '', '', ''],
        ['19:00\n~21:00', '', '', '', '']
      );
    }
    
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
        0: { fontStyle: 'bold', fillColor: [246, 249, 252], halign: 'center', cellWidth: 20 },
        1: { halign: 'left', cellWidth: 50 },
        2: { halign: 'center', cellWidth: 30 },
        3: { halign: 'center', cellWidth: 25 },
        4: { halign: 'left', cellWidth: 65 }
      }
    });
    
    // 참가자 현황 섹션
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.setFont('helvetica', 'bold');
    doc.text('○ 참가자 현황', 14, finalY);
    
    // 참가자 현황 테이블
    const participantHeaders = [
      [
        '구분', 
        '계획 인원', 
        '실제 참가', 
        '미참석', 
        '참가율'
      ]
    ];
    
    // 참가자 현황 데이터
    const participantData = [
      [
        '참가자',
        '',
        '',
        '',
        ''
      ],
      [
        '인솔자',
        '',
        '',
        '',
        ''
      ],
      [
        '합계',
        '',
        '',
        '',
        ''
      ]
    ];
    
    // 참가자 현황 테이블 그리기
    doc.autoTable({
      startY: finalY + 5,
      head: participantHeaders,
      body: participantData,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [220, 220, 220],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [60, 60, 60],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [246, 249, 252], halign: 'center', cellWidth: 25 },
        1: { halign: 'center', cellWidth: 25 },
        2: { halign: 'center', cellWidth: 25 },
        3: { halign: 'center', cellWidth: 25 },
        4: { halign: 'center', cellWidth: 25 }
      }
    });
    
    // 교육 내용 및 평가 섹션
    const finalY2 = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.setFont('helvetica', 'bold');
    doc.text('○ 교육 내용 및 평가', 14, finalY2);
    
    // 교육 내용 및 평가 테이블
    const evaluationHeaders = [
      [
        '프로그램명', 
        '교육내용', 
        '참가자 반응', 
        '개선 및 보완점'
      ]
    ];
    
    // 교육 내용 및 평가 데이터
    const evaluationData = [
      [
        '',
        '',
        '',
        ''
      ],
      [
        '',
        '',
        '',
        ''
      ]
    ];
    
    // 교육 내용 및 평가 테이블 그리기
    doc.autoTable({
      startY: finalY2 + 5,
      head: evaluationHeaders,
      body: evaluationData,
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
        0: { fontStyle: 'bold', fillColor: [246, 249, 252], halign: 'center', cellWidth: 35 },
        1: { halign: 'left', cellWidth: 55 },
        2: { halign: 'left', cellWidth: 55 },
        3: { halign: 'left', cellWidth: 45 }
      }
    });
    
    // 기타 의견 섹션
    const finalY3 = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.setFont('helvetica', 'bold');
    doc.text('○ 기타 의견 및 특이사항', 14, finalY3);
    
    // 기타 의견 빈 박스
    doc.setFillColor(252, 252, 252);
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(14, finalY3 + 5, 182, 25, 2, 2, 'FD');
    
    // 안내 문구
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    
    // 안내 박스
    doc.setFillColor(249, 249, 249);
    doc.setDrawColor(230, 230, 230);
    doc.roundedRect(14, finalY3 + 35, 182, 15, 2, 2, 'FD');
    
    doc.text('※ 교육 일지는 매일 작성하며, 내용은 직접 작성하여 주십시오.', 20, finalY3 + 42);
    doc.text('※ 참가자 현황은 계획 인원과 실제 참가 인원을 비교하여 작성합니다.', 20, finalY3 + 47);
    
    // PDF 저장
    doc.save(`교육일지_${selectedReservation.group_name || 'default'}_${moment(selectedDate).format('YYYYMMDD')}.pdf`);
    
  } catch (error) {
    console.error('PDF 생성 오류:', error);
    showAlert('PDF 생성 중 오류가 발생했습니다.', 'error');
  }
}; 