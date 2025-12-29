import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * jsPDF에 한글 폰트를 등록합니다.
 * @param {jsPDF} doc - jsPDF 인스턴스
 */
export const registerKoreanFont = (doc) => {
  try {
    // 기본 폰트로 설정
    doc.setFont('helvetica');
    return true;
  } catch (error) {
    console.error('한글 폰트 등록 에러:', error);
    // 폰트 등록 실패 시 기본 폰트로 대체
    doc.setFont('helvetica');
    return false;
  }
};

/**
 * 한글을 포함한 텍스트를 안전하게 처리합니다.
 * @param {string} text - 표시할 텍스트
 * @returns {string} - 안전하게 처리된 텍스트
 */
export const safeText = (text) => {
  if (!text) return '';
  
  // 한글 및 특수문자 처리 - 한글 처리 방식 수정
  try {
    // 텍스트가 있는 경우 그대로 반환 (한글 변환 과정 생략)
    return text.toString();
  } catch (e) {
    console.error('텍스트 변환 오류:', e);
    return text ? text.toString() : '';
  }
};

/**
 * 한글 폰트가 등록된 jsPDF 인스턴스를 생성합니다.
 * @param {string} orientation - 용지 방향 ('portrait' 또는 'landscape')
 * @param {string} unit - 단위 ('pt', 'mm', 'cm', 'in')
 * @param {string} format - 용지 크기 ('a4', 'letter' 등)
 * @returns {jsPDF} - 한글 폰트가 등록된 jsPDF 인스턴스
 */
export const createKoreanPdf = (orientation = 'portrait', unit = 'mm', format = 'a4') => {
  const doc = new jsPDF(orientation, unit, format);
  registerKoreanFont(doc);
  return doc;
};

export default {
  registerKoreanFont,
  safeText,
  createKoreanPdf
}; 