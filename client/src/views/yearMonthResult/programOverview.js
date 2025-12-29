import React from "react";
import { Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

const ProgramOverview = ({ data, rawData = [] }) => {
    console.log("ProgramOverview data:", data);
    console.log("ProgramOverview rawData:", rawData);
    
    const {
        people = [],
        pTotal = [],
        service = [],
        room = [{}],
        male_leaders = 0, // Default to 0 if not present
        female_leaders = 0,
        total_leaders = 0
    } = data || {}; // Destructure directly from data prop
    
    // 안전하게 숫자 변환
    const safeNumber = (value) => {
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    };
    
    // 사업구분별 데이터 계산
    const calculateBusinessCategoryData = () => {
        const profitData = {
            maleParticipants: 0,
            femaleParticipants: 0,
            totalParticipants: 0,
            maleLeaders: 0,
            femaleLeaders: 0,
            totalLeaders: 0,
            services: {}
        };
        
        const socialData = {
            maleParticipants: 0,
            femaleParticipants: 0,
            totalParticipants: 0,
            maleLeaders: 0,
            femaleLeaders: 0,
            totalLeaders: 0,
            services: {}
        };
        
        // 사업구분 매핑 (영어 -> 한국어)
        const businessCategoryMap = {
            'profit_business': '수익사업',
            'social_contribution': '사회공헌',
            '수익사업': '수익사업',
            '사회공헌': '사회공헌'
        };
        
        console.log("Raw data for business category calculation:", rawData);
        
        // rawData에서 사업구분별로 데이터 집계
        rawData.forEach(item => {
            const rawBusinessCategory = item.business_category || '';
            const businessCategory = businessCategoryMap[rawBusinessCategory] || rawBusinessCategory;
            const maleCount = safeNumber(item.male_count);
            const femaleCount = safeNumber(item.female_count);
            const totalCount = safeNumber(item.total_count);
            const maleLeaderCount = safeNumber(item.male_leader_count);
            const femaleLeaderCount = safeNumber(item.female_leader_count);
            const totalLeaderCount = safeNumber(item.total_leader_count);
            const serviceType = item.service_type || '';
            
            console.log(`Processing item: business_category=${rawBusinessCategory} -> ${businessCategory}, male=${maleCount}, female=${femaleCount}, total=${totalCount}`);
            
            if (businessCategory === '수익사업') {
                profitData.maleParticipants += maleCount;
                profitData.femaleParticipants += femaleCount;
                profitData.totalParticipants += totalCount;
                profitData.maleLeaders += maleLeaderCount;
                profitData.femaleLeaders += femaleLeaderCount;
                profitData.totalLeaders += totalLeaderCount;
                
                if (serviceType) {
                    profitData.services[serviceType] = (profitData.services[serviceType] || 0) + 1;
                }
            } else if (businessCategory === '사회공헌') {
                socialData.maleParticipants += maleCount;
                socialData.femaleParticipants += femaleCount;
                socialData.totalParticipants += totalCount;
                socialData.maleLeaders += maleLeaderCount;
                socialData.femaleLeaders += femaleLeaderCount;
                socialData.totalLeaders += totalLeaderCount;
                
                if (serviceType) {
                    socialData.services[serviceType] = (socialData.services[serviceType] || 0) + 1;
                }
            }
        });
        
        console.log("Calculated profit data:", profitData);
        console.log("Calculated social data:", socialData);
        
        return { profitData, socialData };
    };
    
    const { profitData, socialData } = calculateBusinessCategoryData();
    
    // 서비스 유형별 카운트 구하기 (기존 방식 유지 - 전체 합계용)
    const getServiceCount = (serviceType) => {
        // Expect service array items to have { name: string, cnt: number }
        const found = service.find(item => item.name === serviceType);
        return found ? found.cnt : 0;
    };
    
    // 사업구분별 서비스 카운트 구하기
    const getServiceCountByCategory = (categoryData, serviceType) => {
        const serviceTypeMap = {
            '산림교육': '산림교육',
            '산림치유': '산림치유',
            '행위중독치유': '행위중독치유',
            '행위중독예방': '행위중독예방',
            '힐링': '힐링'
        };
        
        const mappedServiceType = serviceTypeMap[serviceType];
        return categoryData.services[mappedServiceType] || 0;
    };
    
    // 총 합계 계산 (기존 방식 유지)
    const maleParticipants = safeNumber(people[0]?.man || 0);
    const femaleParticipants = safeNumber(people[0]?.woman || 0);
    const totalParticipants = safeNumber(people[0]?.total || 0);
    
    // Leaders are directly available from destructuring
    const maleLeadersNum = safeNumber(male_leaders);
    const femaleLeadersNum = safeNumber(female_leaders);
    const totalLeadersNum = safeNumber(total_leaders);
    
    const totalPeople = totalParticipants + totalLeadersNum;
    // 연인원 calculation - assuming a simple placeholder for now
    const extendedPeople = safeNumber(pTotal[0]?.sum || 0) * 2; 
    
    // 식사 계획 데이터에서 총 식사 인원수 계산
    const calculateTotalMealParticipants = () => {
        let totalMealParticipants = 0;
        
        console.log("=== 식사 인원수 계산 시작 ===");
        console.log("Raw data for meal calculation:", rawData);
        
        rawData.forEach((item, index) => {
            console.log(`[${index + 1}/${rawData.length}] 처리 중인 데이터:`, item);
            
            // meal_plans가 있는지 확인
            if (item.meal_plans) {
                let mealPlans = [];
                
                try {
                    // meal_plans가 문자열인지 배열인지 확인
                    if (typeof item.meal_plans === 'string') {
                        mealPlans = JSON.parse(item.meal_plans);
                        console.log(`  - meal_plans 파싱 완료 (문자열 → 배열):`, mealPlans);
                    } else if (Array.isArray(item.meal_plans)) {
                        mealPlans = item.meal_plans;
                        console.log(`  - meal_plans 이미 배열:`, mealPlans);
                    }
                } catch (e) {
                    console.error(`  - meal_plans 파싱 오류:`, e);
                    mealPlans = [];
                }
                
                // 각 식사 계획의 참가자 수 합계
                mealPlans.forEach((meal, mealIndex) => {
                    const participants = safeNumber(meal.participants || 0);
                    totalMealParticipants += participants;
                    console.log(`    [식사 ${mealIndex + 1}] ${meal.meal_type || '타입 없음'} - ${participants}명`);
                });
                
                console.log(`  - 이 항목의 총 식사 인원: ${mealPlans.reduce((sum, meal) => sum + safeNumber(meal.participants || 0), 0)}명`);
            } else {
                console.log(`  - meal_plans 없음`);
            }
        });
        
        console.log(`=== 식사 인원수 계산 완료: 총 ${totalMealParticipants}명 ===`);
        return totalMealParticipants;
    };
    
    // 객실 데이터 계산 함수
    const calculateRoomData = () => {
        let totalStandardRooms = 0;
        let totalDeluxeRooms = 0;
        let totalRooms = 0;
        
        console.log("=== 객실 데이터 계산 시작 ===");
        console.log("Raw data for room calculation:", rawData);
        
        rawData.forEach((item, index) => {
            console.log(`[${index + 1}/${rawData.length}] 처리 중인 데이터:`, item);
            
            const standardRoomCount = safeNumber(item.standard_room_count || 0);
            const deluxeRoomCount = safeNumber(item.deluxe_room_count || 0);
            const totalRoomCount = safeNumber(item.total_room_count || 0);
            
            totalStandardRooms += standardRoomCount;
            totalDeluxeRooms += deluxeRoomCount;
            totalRooms += totalRoomCount;
            
            console.log(`  - 스탠다드룸: ${standardRoomCount}실, 디럭스룸: ${deluxeRoomCount}실, 총객실: ${totalRoomCount}실`);
        });
        
        console.log(`=== 객실 데이터 계산 완료: 스탠다드룸 ${totalStandardRooms}실, 디럭스룸 ${totalDeluxeRooms}실, 총객실 ${totalRooms}실 ===`);
        
        return {
            standardRooms: totalStandardRooms,
            deluxeRooms: totalDeluxeRooms,
            totalRooms: totalRooms
        };
    };
    
    const roomData = calculateRoomData();
    const totalMealParticipants = calculateTotalMealParticipants();
    
    return (
        <>
            {/* <h3 className="tableTitle">프로그램시행개요</h3> */}
            <TableContainer>
                <Table className="report custom-table" size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell className="table-header" rowSpan={2} align="center">구분</TableCell>
                            <TableCell className="table-header" colSpan={7} align="center">참여인원(명)</TableCell>
                            <TableCell className="table-header" colSpan={6} align="center">서비스유형</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="table-header" align="center">남(참여자)</TableCell>
                            <TableCell className="table-header" align="center">여(참여자)</TableCell>
                            <TableCell className="table-header" align="center">계</TableCell>
                            <TableCell className="table-header" align="center">남(인솔자)</TableCell>
                            <TableCell className="table-header" align="center">여(인솔자)</TableCell>
                            <TableCell className="table-header" align="center">계</TableCell>
                            <TableCell className="table-header" align="center">합계</TableCell>
                            <TableCell className="table-header" align="center">산림교육</TableCell>
                            <TableCell className="table-header" align="center">산림치유</TableCell>
                            <TableCell className="table-header" align="center">중독치유</TableCell>
                            <TableCell className="table-header" align="center">중독예방</TableCell>
                            <TableCell className="table-header" align="center">힐링</TableCell>
                            <TableCell className="table-header" align="center">기타</TableCell>
                        </TableRow>
                    </TableHead>
                <TableBody>
                        <TableRow>
                            <TableCell align="center">수익사업</TableCell>
                            <TableCell align="center">{profitData.maleParticipants}</TableCell>
                            <TableCell align="center">{profitData.femaleParticipants}</TableCell>
                            <TableCell align="center">{profitData.totalParticipants}</TableCell>
                            <TableCell align="center">{profitData.maleLeaders}</TableCell>
                            <TableCell align="center">{profitData.femaleLeaders}</TableCell>
                            <TableCell align="center">{profitData.totalLeaders}</TableCell>
                            <TableCell align="center">{profitData.totalParticipants + profitData.totalLeaders}</TableCell>
                            <TableCell align="center">{getServiceCountByCategory(profitData, '산림교육')}</TableCell>
                            <TableCell align="center">{getServiceCountByCategory(profitData, '산림치유')}</TableCell>
                            <TableCell align="center">{getServiceCountByCategory(profitData, '행위중독치유')}</TableCell>
                            <TableCell align="center">{getServiceCountByCategory(profitData, '행위중독예방')}</TableCell>
                            <TableCell align="center">{getServiceCountByCategory(profitData, '힐링')}</TableCell>
                            <TableCell align="center">0</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="center">사회공헌</TableCell>
                            <TableCell align="center">{socialData.maleParticipants}</TableCell>
                            <TableCell align="center">{socialData.femaleParticipants}</TableCell>
                            <TableCell align="center">{socialData.totalParticipants}</TableCell>
                            <TableCell align="center">{socialData.maleLeaders}</TableCell>
                            <TableCell align="center">{socialData.femaleLeaders}</TableCell>
                            <TableCell align="center">{socialData.totalLeaders}</TableCell>
                            <TableCell align="center">{socialData.totalParticipants + socialData.totalLeaders}</TableCell>
                            <TableCell align="center">{getServiceCountByCategory(socialData, '산림교육')}</TableCell>
                            <TableCell align="center">{getServiceCountByCategory(socialData, '산림치유')}</TableCell>
                            <TableCell align="center">{getServiceCountByCategory(socialData, '행위중독치유')}</TableCell>
                            <TableCell align="center">{getServiceCountByCategory(socialData, '행위중독예방')}</TableCell>
                            <TableCell align="center">{getServiceCountByCategory(socialData, '힐링')}</TableCell>
                            <TableCell align="center">0</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="center">계</TableCell>
                            <TableCell align="center">{maleParticipants}</TableCell>
                            <TableCell align="center">{femaleParticipants}</TableCell>
                            <TableCell align="center">{totalParticipants}</TableCell>
                            <TableCell align="center">{maleLeadersNum}</TableCell>
                            <TableCell align="center">{femaleLeadersNum}</TableCell>
                            <TableCell align="center">{totalLeadersNum}</TableCell>
                            <TableCell align="center">{totalPeople}</TableCell>
                            <TableCell align="center">{getServiceCount('산림교육')}</TableCell>
                            <TableCell align="center">{getServiceCount('산림치유')}</TableCell>
                            <TableCell align="center">{getServiceCount('행위중독치유')}</TableCell>
                            <TableCell align="center">{getServiceCount('행위중독예방')}</TableCell>
                            <TableCell align="center">{getServiceCount('힐링')}</TableCell>
                            <TableCell align="center">{getServiceCount('기타') || 0}</TableCell> 
                        </TableRow>
                </TableBody>
            </Table>
            </TableContainer>
            
            <h3 className="tableTitle" style={{marginTop:"20px", marginBottom:"10px"}}>객실정보</h3>
            <TableContainer>
                <Table className="report custom-table" size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell className="table-header" rowSpan={2} align="center">객실배정</TableCell>
                            <TableCell className="table-header" colSpan={3} align="center">인원명</TableCell>
                            <TableCell className="table-header" colSpan={3} align="center">객실수</TableCell>
                            <TableCell className="table-header" align="center">식사</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="table-header" align="center">참여자</TableCell>
                            <TableCell className="table-header" align="center">인솔자</TableCell>
                            <TableCell className="table-header" align="center">계</TableCell>
                            <TableCell className="table-header" align="center">스탠다드룸</TableCell>
                            <TableCell className="table-header" align="center">디럭스룸</TableCell>
                            <TableCell className="table-header" align="center">총객실수</TableCell>
                            <TableCell className="table-header" align="center">합계</TableCell>
                        </TableRow>
                    </TableHead>
                <TableBody>
                        <TableRow>
                            <TableCell align="center">객실배정</TableCell>
                            <TableCell align="center">{totalParticipants}</TableCell>
                            <TableCell align="center">{totalLeadersNum}</TableCell>
                            <TableCell align="center">{totalPeople}</TableCell>
                            <TableCell align="center">{roomData.standardRooms}</TableCell>
                            <TableCell align="center">{roomData.deluxeRooms}</TableCell>
                            <TableCell align="center">{roomData.totalRooms}</TableCell>
                            <TableCell align="center">{totalMealParticipants}</TableCell>
                        </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
            <Divider sx={{ my: 2 }} />
    </>
    );
};

export default ProgramOverview;