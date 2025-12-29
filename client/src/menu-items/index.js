// assets
import { IconFloatLeft, IconReportAnalytics, IconUserCircle, IconApiApp, IconAperture, IconClipboardText, IconDashboard, IconHistory } from '@tabler/icons';
// assets
import { 
    IconKey, 
    IconMapPin, 
    IconChalkboard, 
    IconUsers, 
    IconUser, 
    IconListDetails, 
    IconBuildingSkyscraper,
    IconCategory,
    IconList,
    IconMap,
    IconFriends,
    IconBuilding,
    IconInfoCircle,
    IconUserPlus,
    IconBottle,
    IconCalendarEvent,
    IconChartBar,
    IconSettings,
    IconFile
} from '@tabler/icons';

// Import menu groups
import menus from './menus';

// ==============================|| MENU ITEMS ||============================== //
const icons = {
    IconKey,
    IconMapPin, 
    IconChalkboard,
    IconUsers,
    IconUser,
    IconListDetails,
    IconBuildingSkyscraper,
    IconCategory,
    IconList,
    IconMap,
    IconFriends,
    IconBuilding
};

const menuItems = {
    items: [
        {
            id: 'newFeatures',
            title : "예약관리",
            type: 'collapse',
            icon: IconCalendarEvent,
            children: [
                {
                    id: 'new0',
                    title: '신규예약',
                    type: 'item',
                    url: '/new/0',
                    icon: IconDashboard,
                },
                // {
                //     id: 'new1',
                //     title: '신규기능-1',
                //     type: 'item',
                //     url: '/new/1',
                //     icon: IconClipboardText,
                // },
                // {
                //     id: 'new2',
                //     title: '신규기능-2',
                //     type: 'item',
                //     url: '/new/2',
                //     icon: IconClipboardText,
                // },
              
             
                // {
                //     id: 'new3',
                //     title: '신규기능-3',
                //     type: 'item',
                //     url: '/new/3',
                //     icon: IconClipboardText,
                // },
                // {
                //     id: 'new4',
                //     title: '신규기능-4',
                //     type: 'item',
                //     url: '/new/4',
                //     icon: IconClipboardText,
                // },
                {
                    id: 'new5',
                    title: '예약종합현황',
                    type: 'item',
                    url: '/new/5',
                    icon: IconClipboardText,
                },
                {
                    id: 'new6',
                    title: '예약정보',
                    type: 'item',
                    url: '/new/6',
                    icon: IconClipboardText,
                },
                // {
                //     id: 'new7',
                //     title: '신규기능-7',
                //     type: 'item',
                //     url: '/new/7',
                //     icon: IconClipboardText,
                // },
                // {
                //     id: 'new8',
                //     title: '신규기능-8',
                //     type: 'item',
                //     url: '/new/8',
                //     icon: IconClipboardText,
                // },
             
            ]
        },
        {
            id: 'program',
            title : "실적관리",
            type: 'collapse',
            icon: IconChartBar,
            children: [
                {
                    id: 'programList',
                    title: '운영결과 보고검색',
                    type: 'item',
                    url: '/programList',
                    icon: IconReportAnalytics,
                },
                {
                    id: 'authentication',
                    title: '운영통계검색',
                    type: 'item',
                    icon: IconApiApp,
                    url: '/yearMonthResult',

                    // children: [
                    //     {
                    //         id: 'year',
                    //         title: '연/월통계',
                    //         type: 'item',
                    //         url: '/yearMonthResult',
                    //     },
                    //     {
                    //         id: 'program',
                    //         title: '운영통계',
                    //         type: 'item',
                    //         url: '/searchProgramResult',
                    //     }
                    // ]
                },
                // {
                //     id: 'userTemp',
                //     title: '프로그램참가자입력',
                //     type: 'item',
                //     icon: IconUserCircle,
                //     url: '/userTemp',   
                // },
                {
                    id: 'insert',
                    title: '만족도및 효과평가 입력',
                    type: 'item',
                    url: '/serviceInsertFormFinal',
                    icon: IconFloatLeft,
                },
                {
                    id: 'programResult',
                    title: '만족도 및 효과평가결과검색',
                    type: 'item',
                    icon: IconAperture,
                    url: '/sae/agencyList',

                    // children: [
                    //     {
                    //         id: 'agencyList',
                    //         title: '단체별 만족도 및 효과평가',
                    //         type: 'item',
                    //         url: '/sae/agencyList',
                    //     },
                    //     {
                    //         id: 'test3',
                    //         title: '주제어별 만족도 및 효과평가',
                    //         type: 'item',
                    //         url: '/sae/searchResult',
                    //     }
                    // ]
                },
           
                // {
                //     id: 'updateDelete',
                //     title: '수정/삭제',
                //     type: 'item',
                //     url: '/updateDelete',
                //     icon: IconFloatLeft,
                // }
            ]
        },
        {
            id: 'integratedMenus',
            title: '통합관리',
            type: 'collapse',
            icon: IconSettings,
            children: [
                {
                    id: 'program-management',
                    title: '프로그램 관리',
                    type: 'item',
                    url: '/new/menus/program-management',
                    icon: IconInfoCircle,
                    breadcrumbs: false
                },
                {
                    id: 'location-management',
                    title: '장소 관리',
                    type: 'item',
                    url: '/new/menus/location-management',
                    icon: IconMapPin,
                    breadcrumbs: false
                },
                {
                    id: 'external-instructors',
                    title: '외부강사 관리',
                    type: 'item',
                    url: '/new/menus/external-instructors',
                    icon: IconUser,
                    breadcrumbs: false
                },
                {
                    id: 'internal-instructors',
                    title: '내부강사 관리',
                    type: 'item',
                    url: '/new/menus/internal-instructors',
                    icon: IconUser,
                    breadcrumbs: false
                },
                {
                    id: 'instructors',
                    title: '강사 관리',
                    type: 'item',
                    url: '/new/menus/instructors',
                    icon: IconUser,
                    breadcrumbs: false
                },
                {
                    id: 'assistant-instructors',
                    title: '보조강사 관리',
                    type: 'item',
                    url: '/new/menus/assistant-instructors',
                    icon: IconUserPlus,
                    breadcrumbs: false
                },
                {
                    id: 'helpers',
                    title: '힐링헬퍼 관리',
                    type: 'item',
                    url: '/new/menus/helpers',
                    icon: IconUsers,
                    breadcrumbs: false
                },
                {
                    id: 'rooms',
                    title: '객실 관리',
                    type: 'item',
                    url: '/new/menus/rooms',
                    icon: IconBuilding,
                    breadcrumbs: false
                },
                {
                    id: 'meal-cost',
                    title: '식사비용 관리',
                    type: 'item',
                    url: '/new/menus/meal-cost',
                    icon: IconBottle,
                    breadcrumbs: false
                },
                {
                    id: 'employee-management',
                    title: '직원계정 관리',
                    type: 'item',
                    url: '/new/menus/employee-management',
                    icon: IconUserCircle,
                    breadcrumbs: false
                },
                {
                    id: 'userActivity',
                    title: '사용자 이용기록',
                    type: 'item',
                    url: '/userActivity',
                    icon: IconHistory,
                    breadcrumbs: false
                },
                {
                    id: 'excelDown',
                    title: '엑셀데이터',
                    type: 'item',
                    url: '/excelDownload',   
                    icon: IconFile,
                    breadcrumbs: false

                },
                {
                    id: 'effectiveness-evaluation',
                    title: '효과성 평가',
                    type: 'item',
                    url: '/new/menus/effectiveness-evaluation',   
                    icon: IconFile,
                    breadcrumbs: false

                },

                
            ]
        },
        
        
       ]
};

export default menuItems;
