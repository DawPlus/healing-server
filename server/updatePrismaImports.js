/**
 * 모든 리졸버 파일에서 Prisma 클라이언트 임포트를 업데이트하는 스크립트
 */
const fs = require('fs');
const path = require('path');

// 리졸버 디렉토리 경로
const resolversDir = path.join(__dirname, 'graphql', 'resolvers');

// 수정할 파일 경로를 찾는 함수
function findFilesToUpdate(dir) {
  const files = [];
  
  // 디렉토리 내 모든 파일과 디렉토리를 재귀적으로 탐색
  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        // 디렉토리인 경우 재귀 탐색
        traverse(entryPath);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        // .js 파일인 경우 내용 확인
        const content = fs.readFileSync(entryPath, 'utf8');
        
        // PrismaClient를 직접 초기화하는 파일 찾기
        if (content.includes('new PrismaClient') || 
            content.includes('{ PrismaClient }')) {
          files.push(entryPath);
        }
      }
    }
  }
  
  traverse(dir);
  return files;
}

// 파일 내용 업데이트 함수
function updateFile(filePath) {
  console.log(`업데이트 중: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Prisma 직접 초기화 코드를 공유 인스턴스 사용으로 변경
  const newPrismaImport = "const prisma = require('../../../prisma/prismaClient');";
  
  // 기존 임포트 패턴 찾기 및 교체
  content = content.replace(/const\s*{\s*PrismaClient\s*}\s*=\s*require\s*\(\s*['"]@prisma\/client['"]\s*\)\s*;?/g, '');
  content = content.replace(/const\s*prisma\s*=\s*new\s*PrismaClient\s*\(\s*.*?\s*\)\s*;?/gs, '');
  
  // 새 임포트 추가 (파일 시작 부분에)
  if (!content.includes("require('../../../prisma/prismaClient')")) {
    const lines = content.split('\n');
    
    // 첫 번째 비어 있지 않은 줄을 찾아 그 전에 임포트 추가
    let insertIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() !== '') {
        insertIndex = i;
        break;
      }
    }
    
    lines.splice(insertIndex, 0, newPrismaImport, '');
    content = lines.join('\n');
  }
  
  // 파일 업데이트
  fs.writeFileSync(filePath, content);
}

// 메인 실행 로직
console.log('Prisma 클라이언트 임포트 업데이트 시작...');

const filesToUpdate = findFilesToUpdate(resolversDir);
console.log(`${filesToUpdate.length}개 파일에서 Prisma 클라이언트 임포트 발견`);

for (const filePath of filesToUpdate) {
  updateFile(filePath);
}

console.log('업데이트 완료!'); 