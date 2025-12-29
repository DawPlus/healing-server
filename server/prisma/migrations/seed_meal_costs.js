const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * 식사 메뉴의 기본 판매가와 재료비를 설정하는 스크립트
 * 
 * • 식사 판매가 (결과보고 수입금액)
 * - 조식 8,800원
 * - 중식(일반) 12,000원
 * - 중식(도시락) 15,000원
 * - 석식(일반) 12,000원
 * - 석식(특식A) 20,000원
 * - 석식(특식B) 25,000원
 * 
 * • 식사 재료비 (결과보고 지출금액)
 * - 조식 6,000원
 * - 중식(일반) 6,000원
 * - 중식(도시락) 10,000원
 * - 석식(일반) 6,000원
 * - 석식(특식A) 10,000원
 * - 석식(특식B) 13,000원
 */
async function main() {
  try {
    console.log('식사 비용 기본 데이터 생성 시작...');
    
    // 모든 기존 식사 옵션 삭제 (있는 경우)
    await prisma.project3MealOption.deleteMany({});
    console.log('기존 식사 옵션 데이터 삭제 완료');
    
    // 기본 식사 옵션 생성
    const mealOptions = [
      {
        meal_type: 'breakfast',
        meal_option: '조식',
        price_per_person: 8800,
        ingredient_cost: 6000,
        description: '기본 조식',
        is_active: true
      },
      {
        meal_type: 'lunch',
        meal_option: '중식(일반)',
        price_per_person: 12000,
        ingredient_cost: 6000, 
        description: '기본 중식',
        is_active: true
      },
      {
        meal_type: 'lunch_box',
        meal_option: '도시락 중식',
        price_per_person: 15000,
        ingredient_cost: 10000,
        description: '도시락 형태 중식',
        is_active: true
      },
      {
        meal_type: 'dinner',
        meal_option: '석식(일반)',
        price_per_person: 12000,
        ingredient_cost: 6000,
        description: '기본 석식',
        is_active: true
      },
      {
        meal_type: 'dinner_special_a',
        meal_option: '특식A 석식',
        price_per_person: 20000,
        ingredient_cost: 10000,
        description: '특별 석식 A',
        is_active: true
      },
      {
        meal_type: 'dinner_special_b',
        meal_option: '특식B 석식',
        price_per_person: 25000,
        ingredient_cost: 13000,
        description: '특별 석식 B',
        is_active: true
      }
    ];
    
    // 식사 옵션 생성
    for (const option of mealOptions) {
      await prisma.project3MealOption.create({
        data: option
      });
      console.log(`생성됨: ${option.meal_option} - 판매가 ${option.price_per_person}원, 재료비 ${option.ingredient_cost}원`);
    }
    
    console.log('식사 비용 기본 데이터 생성 완료');
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 