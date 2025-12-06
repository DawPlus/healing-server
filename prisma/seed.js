// 공유 Prisma 인스턴스 사용
const prisma = require('./prismaClient');

async function main() {
  console.log('Starting seeding process...');
  
  try {
    // Add program categories
    console.log('Adding program categories...');
    const programCategories = await prisma.programCategory.createMany({
      data: [
        { category_name: '어울林', description: '어울林 관련 프로그램', display_order: 1 },
        { category_name: '테라피', description: '치유 및 테라피 관련 프로그램', display_order: 2 },
        { category_name: '체험', description: '체험활동 프로그램', display_order: 3 },
        { category_name: '디톡스', description: '디지털 디톡스 및 중독 관련 프로그램', display_order: 4 },
        { category_name: '심리', description: '심리검사 및 평가 프로그램', display_order: 5 },
        { category_name: '이벤트', description: '이벤트 및 방문 프로그램', display_order: 6 }
      ],
      skipDuplicates: true,
    });
    console.log(`Added ${programCategories.count} program categories`);
    
    // Add location categories
    console.log('Adding location categories...');
    const locationCategories = await prisma.locationCategory.createMany({
      data: [
        { category_name: '예약', description: '예약 장소', display_order: 1 },
        { category_name: '프로그램', description: '프로그램 장소', display_order: 2 },
        { category_name: '기타', description: '기타 장소', display_order: 3 }
      ],
      skipDuplicates: true,
    });
    console.log(`Added ${locationCategories.count} location categories`);
    
    // Fetch created categories for foreign key references
    const allProgramCategories = await prisma.programCategory.findMany();
    const allLocationCategories = await prisma.locationCategory.findMany();
    
    // Create mapping for category names to IDs
    const programCategoryMap = {};
    allProgramCategories.forEach(cat => {
      programCategoryMap[cat.category_name] = cat.id;
    });
    
    const locationCategoryMap = {};
    allLocationCategories.forEach(cat => {
      locationCategoryMap[cat.category_name] = cat.id;
    });
    
    // Add program items
    console.log('Adding program items...');
    const programItems = await prisma.programItem.createMany({
      data: [
        // 어울林 카테고리 프로그램
        { category_id: programCategoryMap['어울林'], program_name: '어울林 해먹테라피', description: '어울林 카테고리의 해먹을 활용한 테라피 프로그램', display_order: 1 },
        { category_id: programCategoryMap['어울林'], program_name: '체질별 산림 치유', description: '개인 체질에 맞는 산림 치유 프로그램', display_order: 2 },
        { category_id: programCategoryMap['어울林'], program_name: '포레스트 클래식', description: '숲속에서 즐기는 클래식 음악 프로그램', display_order: 3 },
        { category_id: programCategoryMap['어울林'], program_name: '숲속곤충탐사대', description: '숲속 곤충을 탐사하는 체험 프로그램', display_order: 4 },
        { category_id: programCategoryMap['어울林'], program_name: '탄소중립 첫걸음', description: '탄소중립 실천을 위한 교육 프로그램', display_order: 5 },
        { category_id: programCategoryMap['어울林'], program_name: '어울林 투어', description: '자연 속 어울林 힐링 투어 프로그램', display_order: 6 },
        { category_id: programCategoryMap['어울林'], program_name: '성지골 피크닉', description: '성지골에서 즐기는, 휴식과 피크닉 프로그램', display_order: 7 },
        { category_id: programCategoryMap['어울林'], program_name: '달빛 모닥불', description: '달빛 아래 모닥불을 피우며 즐기는 힐링 프로그램', display_order: 8 },
        
        // 테라피 카테고리 프로그램
        { category_id: programCategoryMap['테라피'], program_name: '힐링 물테라피', description: '물을 활용한 힐링 테라피 프로그램', display_order: 1 },
        { category_id: programCategoryMap['테라피'], program_name: '아로마테라피', description: '향기로운 아로마를 활용한 테라피 프로그램', display_order: 2 },
        { category_id: programCategoryMap['테라피'], program_name: '힐링 오케스트라', description: '음악을 통한 힐링 테라피 프로그램', display_order: 3 },
        { category_id: programCategoryMap['테라피'], program_name: '브레인 체조', description: '두뇌 활성화를 위한 체조 프로그램', display_order: 4 },
        
        // 체험 카테고리 프로그램
        { category_id: programCategoryMap['체험'], program_name: '우드버닝', description: '나무에 그림을 그리는 우드버닝 체험', display_order: 1 },
        { category_id: programCategoryMap['체험'], program_name: '공드림', description: '공예를 통한 창의적인 체험 프로그램', display_order: 2 },
        { category_id: programCategoryMap['체험'], program_name: '쿠킹 클래스', description: '자연 속에서 요리하는 쿠킹 클래스', display_order: 3 },
        { category_id: programCategoryMap['체험'], program_name: '컬러 아로마 비누', description: '아로마 성분이 들어간 비누 만들기 체험', display_order: 4 },
        { category_id: programCategoryMap['체험'], program_name: '리틀 포레스트', description: '작은 숲을 만드는 체험 프로그램', display_order: 5 },
        
        // 디톡스 카테고리 프로그램
        { category_id: programCategoryMap['디톡스'], program_name: '도전! 등타파 (스마트폰)', description: '스마트폰 중독 탈출 프로그램', display_order: 1 },
        { category_id: programCategoryMap['디톡스'], program_name: '도전! 등타파 (도박)', description: '도박 중독 탈출 프로그램', display_order: 2 },
        { category_id: programCategoryMap['디톡스'], program_name: '도전! 힐링 벨 (스마트폰)', description: '스마트폰 중독 치유 프로그램', display_order: 3 },
        { category_id: programCategoryMap['디톡스'], program_name: '도전! 힐링 벨 (도박)', description: '도박 중독 치유 프로그램', display_order: 4 },
        { category_id: programCategoryMap['디톡스'], program_name: '디톡스 챌린지 (스마트폰)', description: '스마트폰 디톡스 챌린지 프로그램', display_order: 5 },
        { category_id: programCategoryMap['디톡스'], program_name: '디톡스 챌린지 (도박)', description: '도박 디톡스 챌린지 프로그램', display_order: 6 },
        
        // 심리 카테고리 프로그램
        { category_id: programCategoryMap['심리'], program_name: 'HRV (자율신경균형검사)', description: '자율신경 균형 측정 검사 프로그램', display_order: 1 },
        { category_id: programCategoryMap['심리'], program_name: '바이오 스트레스 측정 검사', description: '생체 스트레스 측정 및 관리 프로그램', display_order: 2 },
        
        // 이벤트 카테고리 프로그램
        { category_id: programCategoryMap['이벤트'], program_name: '고씨동굴 & 동굴생태관', description: '고씨동굴과 동굴생태관 방문 프로그램', display_order: 1 },
        { category_id: programCategoryMap['이벤트'], program_name: '국립백두대간수목원', description: '국립백두대간수목원 방문 프로그램', display_order: 2 },
        { category_id: programCategoryMap['이벤트'], program_name: '동강생태정보관 & 곤충박물관', description: '동강생태정보관과 곤충박물관 방문 프로그램', display_order: 3 },
        { category_id: programCategoryMap['이벤트'], program_name: '청령포', description: '청령포 방문 프로그램', display_order: 4 },
        { category_id: programCategoryMap['이벤트'], program_name: '영월장릉', description: '영월장릉 방문 프로그램', display_order: 5 }
      ],
      skipDuplicates: true,
    });
    console.log(`Added ${programItems.count} program items`);
    
    // Add sample locations
    console.log('Adding locations...');
    const locations = await prisma.location.createMany({
      data: [
        { location_name: '기본 장소', category_id: locationCategoryMap['기타'], capacity: 20, description: '테스트용 장소입니다.', display_order: 1 },
        { location_name: '어울林 센터', category_id: locationCategoryMap['예약'], capacity: 30, description: '어울林 활동을 위한 중앙 센터', display_order: 2 },
        { location_name: '야외 테라피장', category_id: locationCategoryMap['프로그램'], capacity: 15, description: '야외 테라피 활동을 위한 공간', display_order: 3 },
        { location_name: '체험 활동실', category_id: locationCategoryMap['예약'], capacity: 25, description: '체험 활동을 위한 실내 공간', display_order: 4 },
        { location_name: '명상 센터', category_id: locationCategoryMap['예약'], capacity: 10, description: '조용한 명상을 위한 공간', display_order: 5 }
      ],
      skipDuplicates: true,
    });
    console.log(`Added ${locations.count} locations`);
    
    // Add sample instructors
    console.log('Adding instructors...');
    const instructors = await prisma.instructor.createMany({
      data: [
        { name: '홍길동', specialty: '자연체험', phone: '010-1234-5678', email: 'test@example.com', description: '테스트용 강사입니다.' },
        { name: '김자연', specialty: '산림치유', phone: '010-2345-6789', email: 'nature@example.com', description: '산림치유 전문 강사' },
        { name: '박테라피', specialty: '아로마테라피', phone: '010-3456-7890', email: 'therapy@example.com', description: '아로마테라피 전문가' },
        { name: '이명상', specialty: '명상지도', phone: '010-4567-8901', email: 'meditation@example.com', description: '명상 지도 전문가' }
      ],
      skipDuplicates: true,
    });
    console.log(`Added ${instructors.count} instructors`);
    
    // Add sample assistant instructors
    console.log('Adding assistant instructors...');
    const assistantInstructors = await prisma.assistantInstructor.createMany({
      data: [
        { name: '김철수', specialty: '생태교육', phone: '010-9876-5432', email: 'assistant@example.com', description: '테스트용 보조강사입니다.' },
        { name: '이자연', specialty: '곤충학', phone: '010-8765-4321', email: 'insects@example.com', description: '곤충학 전문 보조강사' },
        { name: '최휴식', specialty: '스트레스관리', phone: '010-7654-3210', email: 'stress@example.com', description: '스트레스 관리 전문가' }
      ],
      skipDuplicates: true,
    });
    console.log(`Added ${assistantInstructors.count} assistant instructors`);
    
    // Add sample helpers
    console.log('Adding helpers...');
    const helpers = await prisma.helper.createMany({
      data: [
        { name: '이영희', specialty: '어린이교육', phone: '010-4567-8901', email: 'helper@example.com', description: '테스트용 헬퍼입니다.' },
        { name: '장도우미', specialty: '노인케어', phone: '010-5678-9012', email: 'elderly@example.com', description: '노인 케어 전문 헬퍼' },
        { name: '한봉사', specialty: '활동보조', phone: '010-6789-0123', email: 'activity@example.com', description: '야외활동 보조 전문가' }
      ],
      skipDuplicates: true,
    });
    console.log(`Added ${helpers.count} helpers`);
    
    // Add sample rooms
    console.log('Adding rooms...');
    const rooms = await prisma.menuRoom.createMany({
      data: [
        { 
          room_type: '싱글룸', 
          room_name: '숲속 싱글룸', 
          capacity: 1, 
          price: 50000, 
          description: '혼자 즐기는 여유로운 객실', 
          is_available: true, 
          facilities: '침대, TV, 에어컨, 화장실', 
          display_order: 1 
        },
        { 
          room_type: '더블룸', 
          room_name: '숲속 더블룸', 
          capacity: 2, 
          price: 80000, 
          description: '커플이 즐기기 좋은 객실', 
          is_available: true, 
          facilities: '더블침대, TV, 에어컨, 화장실, 미니바', 
          display_order: 2 
        },
        { 
          room_type: '트윈룸', 
          room_name: '숲속 트윈룸', 
          capacity: 2, 
          price: 80000, 
          description: '친구나 동료와 함께 즐기기 좋은 객실', 
          is_available: true, 
          facilities: '싱글침대 2개, TV, 에어컨, 화장실', 
          display_order: 3 
        },
        { 
          room_type: '스위트룸', 
          room_name: '프리미엄 스위트', 
          capacity: 4, 
          price: 150000, 
          description: '럭셔리한 공간에서 특별한 휴식', 
          is_available: true, 
          facilities: '킹사이즈 침대, 소파, 미니바, 욕조, TV, 에어컨', 
          display_order: 4 
        },
        { 
          room_type: '도미토리', 
          room_name: '단체 도미토리', 
          capacity: 8, 
          price: 25000, 
          description: '단체 숙박에 적합한 경제적인 객실', 
          is_available: true, 
          facilities: '2층 침대 4개, 공용 화장실, 에어컨', 
          display_order: 5 
        }
      ],
      skipDuplicates: true,
    });
    console.log(`Added ${rooms.count} rooms`);
    
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 