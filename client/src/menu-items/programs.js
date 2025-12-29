// assets
import { IconFloatLeft, IconReportAnalytics} from '@tabler/icons';


// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const programs = {
    id: 'program',
    title: '프로그램',
    type: 'group',
    children: [
        {
            id: 'insertOperateResult',
            title: '프로그램 결과입력',
            type: 'item',
            url: '/insertOperateResult',
            icon: IconFloatLeft,
            breadcrumbs: true
        },
        {
            id: 'programList',
            title: '운영결과 보고검색',
            type: 'item',
            url: '/programList',
            icon: IconReportAnalytics,
            breadcrumbs: true
        }
    ]
};

export default programs;
