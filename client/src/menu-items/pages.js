// assets
import { IconKey } from '@tabler/icons';

// constant
const icons = {
    IconKey
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const pages = {
    id: 'page2',
    title: '운영통계검색',
    caption: '연/월 통계 및 프로그램 통계 ',
    type: 'group',
    children: [
        {
            id: 'authentication',
            title: '운영통계검색',
            type: 'collapse',
            icon: icons.IconKey,
            children: [
                {
                    id: 'login3',
                    title: '연/월통계',
                    type: 'item',
                    url: '/pages/login/login3',
                    target: true
                },
                {
                    id: 'register3',
                    title: '프로그램통계',
                    type: 'item',
                    url: '/pages/register/register3',
                    target: true
                }
            ]
        }
    ]
};

export default pages;
