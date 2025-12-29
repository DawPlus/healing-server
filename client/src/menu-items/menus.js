// assets
import { IconUsers, IconBuildingCommunity, IconMapPin, IconInfoCircle, IconBuilding, IconUserPlus, IconUserCircle, IconChartBar } from '@tabler/icons';

// ==============================|| MENU ITEMS - EXTRA PAGES ||============================== //

const menus = {
  id: 'menus',
  title: '메뉴 관리',
  type: 'group',
  children: [
    {
      id: 'program-management',
      title: '프로그램 관리',
      type: 'item',
      url: '/menus/program-management',
      icon: IconInfoCircle,
      breadcrumbs: false
    },
    {
      id: 'location-management',
      title: '장소 관리',
      type: 'item',
      url: '/menus/location-management',
      icon: IconMapPin,
      breadcrumbs: false
    },
    {
      id: 'instructors',
      title: '강사 관리',
      type: 'item',
      url: '/menus/instructors',
      icon: IconUsers,
      breadcrumbs: false
    },
    {
      id: 'assistant-instructors',
      title: '보조강사 관리',
      type: 'item',
      url: '/menus/assistant-instructors',
      icon: IconUserPlus,
      breadcrumbs: false
    },
    {
      id: 'helpers',
      title: '힐링헬퍼 관리',
      type: 'item',
      url: '/menus/helpers',
      icon: IconUsers,
      breadcrumbs: false
    },
    {
      id: 'rooms',
      title: '객실 관리',
      type: 'item',
      url: '/menus/rooms',
      icon: IconBuilding,
      breadcrumbs: false
    },
    {
      id: 'effectiveness-evaluation',
      title: '효과성 평가',
      type: 'item',
      url: '/menus/effectiveness-evaluation',
      icon: IconChartBar,
      breadcrumbs: false
    },
    {
      id: 'employee-management',
      title: '직원계정 관리',
      type: 'item',
      url: '/menus/employee-management',
      icon: IconUserCircle,
      breadcrumbs: false
    }
  ]
};

export default menus; 