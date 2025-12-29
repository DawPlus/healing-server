import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import activityLogger from 'utils/activityLogger';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

// 라우트 관찰 컴포넌트 (일반 import로 변경)
import RouteObserver from 'utils/RouteObserver';

// dashboard routing
//const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// New migrated pages
const Page0Index = Loadable(lazy(() => import('views/new/Page0')));
const Page1Index = Loadable(lazy(() => import('views/new/page1/index')));
const Page2Index = Loadable(lazy(() => import('views/new/page2/index')));
const Page3Index = Loadable(lazy(() => import('views/new/page3/index')));
const Page4Index = Loadable(lazy(() => import('views/new/page4/index')));
const New5Page = Loadable(lazy(() => import('views/new/Page5')));
const Page6Index = Loadable(lazy(() => import('views/new/page6')));
const New7Page = Loadable(lazy(() => import('views/new/Page7')));
const New8Page = Loadable(lazy(() => import('views/new/Page8')));
const PageFinalIndex = Loadable(lazy(() => import('views/new/pageFinal')));

// New Menus Management component (GraphQL version)
const MenusManagement = Loadable(lazy(() => import('views/new/menus')));

// Menu System Components
const ProgramCategories = Loadable(lazy(() => import('views/new/menus/categories')));
const ProgramItems = Loadable(lazy(() => import('views/new/menus/programs')));
const LocationCategories = Loadable(lazy(() => import('views/new/menus/locationCategories')));
const Locations = Loadable(lazy(() => import('views/new/menus/locations')));
const Instructors = Loadable(lazy(() => import('views/new/menus/instructors')));
const ExternalInstructors = Loadable(lazy(() => import('views/new/menus/externalInstructors')));
const InternalInstructors = Loadable(lazy(() => import('views/new/menus/internalInstructors')));
const MenuRooms = Loadable(lazy(() => import('views/new/menus/rooms')));

// Integrated Menu Components
const ProgramManagement = Loadable(lazy(() => import('views/new/menus/programCategories')));
const LocationManagement = Loadable(lazy(() => import('views/new/menus/location-management')));
const AssistantInstructors = Loadable(lazy(() => import('views/new/menus/assistantInstructors')));
const Helpers = Loadable(lazy(() => import('views/new/menus/helpers')));
const EmployeeManagement = Loadable(lazy(() => import('views/new/menus/employee-management')));
const MealCostManagement = Loadable(lazy(() => import('views/new/meal-management')));
const EffectivenessEvaluation = Loadable(lazy(() => import('views/new/menus/effectiveness-evaluation')));

// HAY Healing Center Statistical Services Components
const ProgramList = Loadable(lazy(() => import('views/programList')));
const YearMonthResult = Loadable(lazy(() => import('views/yearMonthResult')));
const SearchProgramResult = Loadable(lazy(() => import('views/searchProgramResult')));
const UserTemp = Loadable(lazy(() => import('views/management/userTemp')));
const ServiceInsertForm = Loadable(lazy(() => import('views/serviceInsertFormFinal')));
const AgencyList = Loadable(lazy(() => import('views/programResult/agencyList')));
const SearchResult = Loadable(lazy(() => import('views/programResult/searchResult')));
const ExcelDownload = Loadable(lazy(() => import('views/excelDownload')));

// User Activity Tracking
const UserActivity = Loadable(lazy(() => import('views/userActivity')));

// 라우트와 페이지 제목 매핑
const routeTitles = {
  '/programList': '운영결과 보고검색',
  '/yearMonthResult': '운영통계검색',
  '/userTemp': '프로그램참가자입력',
  '/serviceInsertFormFinal': '만족도및 효과평가 입력',
  '/sae/agencyList': '단체별 만족도 및 효과평가',
  '/sae/searchResult': '주제어별 만족도 및 효과평가',
  '/excelDownload': '엑셀데이터',
  '/new/menus/program-management': '프로그램 관리',
  '/new/menus/location-management': '장소 관리',
  '/new/menus/instructors': '강사 관리',
  '/new/menus/assistant-instructors': '보조강사 관리',
  '/new/menus/helpers': '힐링헬퍼 관리',
  '/new/menus/rooms': '객실 관리',
  '/new/menus/meal-cost': '식사비용 관리',
  '/new/menus/employee-management': '직원계정 관리',
  '/new/menus/effectiveness-evaluation': '효과성 평가',
  '/userActivity': '사용자 이용기록'
};

// 로그 관찰 HOC - 모든 컴포넌트에 RouteObserver 추가
const withRouteObserver = (Component) => (props) => (
  <>
    <RouteObserver />
    <Component {...props} />
  </>
);

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = [{
    path: '/',
    element: <MainLayout />,
    children: [
     
        // Page0 routing (신규기능-0)
        { path: 'new/0', element: <Navigate to="/new/page0" replace /> },
        { path: 'new/page0/*', element: withRouteObserver(Page0Index)() },
        
        // New migrated pages
        { path: 'new/1', element: <Navigate to="/new/page1" replace /> },
        { path: 'new/page1/*', element: withRouteObserver(Page1Index)() },

        // Page2 routing
        { path: 'new/2', element: <Navigate to="/new/page2" replace /> },
        { path: 'new/page2/*', element: withRouteObserver(Page2Index)() },
        
        // New Menus Management routing (GraphQL version)
        { path: 'new/menus', element: withRouteObserver(MenusManagement)() },
        
        // Menu System routes
        { path: 'new/menus/categories', element: withRouteObserver(ProgramCategories)() },
        { path: 'new/menus/programs', element: withRouteObserver(ProgramItems)() },
        { path: 'new/menus/location-categories', element: withRouteObserver(LocationCategories)() },
        { path: 'new/menus/locations', element: withRouteObserver(Locations)() },
        { path: 'new/menus/instructors', element: withRouteObserver(Instructors)() },
        { path: 'new/menus/external-instructors', element: withRouteObserver(ExternalInstructors)() },
        { path: 'new/menus/internal-instructors', element: withRouteObserver(InternalInstructors)() },
        { path: 'new/menus/rooms', element: withRouteObserver(MenuRooms)() },

        // Integrated Menu Components routes
        { path: 'new/menus/program-management', element: withRouteObserver(ProgramManagement)() },
        { path: 'new/menus/location-management', element: withRouteObserver(LocationManagement)() },
        { path: 'new/menus/assistant-instructors', element: withRouteObserver(AssistantInstructors)() },
        { path: 'new/menus/helpers', element: withRouteObserver(Helpers)() },
        { path: 'new/menus/employee-management', element: withRouteObserver(EmployeeManagement)() },
        { path: 'new/menus/meal-cost', element: withRouteObserver(MealCostManagement)() },
        { path: 'new/menus/effectiveness-evaluation', element: withRouteObserver(EffectivenessEvaluation)() },

        // Page3 routing
        { path: 'new/3', element: <Navigate to="/new/page3" replace /> },
        { path: 'new/page3/*', element: withRouteObserver(Page3Index)() },

        // Page4 routing
        { path: 'new/4', element: <Navigate to="/new/page4" replace /> },
        { path: 'new/page4/*', element: withRouteObserver(Page4Index)() },

        // Page5 routing
        { path: 'new/5', element: <Navigate to="/new/page5" replace /> },
        { path: 'new/page5/*', element: withRouteObserver(New5Page)() },
        
        { path: 'new/6', element: <Navigate to="/new/page6" replace /> },
        { path: 'new/page6/*', element: withRouteObserver(Page6Index)() },
        { path: 'new/7', element: withRouteObserver(New7Page)() },
        { path: 'new/8', element: withRouteObserver(New8Page)() },
        
        // PageFinal routing (만족도 조사)
        { path: 'new/pageFinal', element: <Navigate to="/new/pageFinal" replace /> },
        { path: 'new/pageFinal/*', element: withRouteObserver(PageFinalIndex)() },

        // HAY Healing Center Statistical Services Routes
        { path: 'programList', element: withRouteObserver(ProgramList)() },
        { path: 'yearMonthResult', element: withRouteObserver(YearMonthResult)() },
        { path: 'searchProgramResult', element: withRouteObserver(SearchProgramResult)() },
        { path: 'userTemp', element: withRouteObserver(UserTemp)() },
        { path: 'serviceInsertForm', element: withRouteObserver(ServiceInsertForm)() },
        { path: 'serviceInsertFormFinal', element: withRouteObserver(ServiceInsertForm)() },
        { path: 'sae/agencyList', element: withRouteObserver(AgencyList)() },
        { path: 'sae/searchResult', element: withRouteObserver(SearchResult)() },
        { path: 'excelDownload', element: withRouteObserver(ExcelDownload)() },
        
        // User Activity Tracking Route
        { path: 'userActivity', element: withRouteObserver(UserActivity)() },
    ]
}];

export default MainRoutes;
