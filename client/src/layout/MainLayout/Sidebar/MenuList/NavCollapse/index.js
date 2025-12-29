import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Collapse, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';

// project imports
import NavItem from '../NavItem';
import { MENU_OPEN } from 'store/actions';

// assets
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { IconChevronDown, IconChevronUp } from '@tabler/icons';

// ==============================|| SIDEBAR MENU LIST COLLAPSE ITEMS ||============================== //

const NavCollapse = ({ menu, level }) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const customization = useSelector((state) => state.customization);
    
    const [selected, setSelected] = useState(false);
    const [childrenMatches, setChildrenMatches] = useState(false);

    // Redux에서 메뉴 열림 상태 가져오기
    const isOpen = customization.isOpen.includes(menu.id);

    const handleClick = (e) => {
        // 이벤트 버블링 방지
        e.stopPropagation();
        
        // Redux 액션 디스패치를 통해 메뉴 열림/닫힘 상태 토글
        dispatch({ type: MENU_OPEN, id: menu.id });
        setSelected(!selected ? menu.id : null);
    };

    const { pathname } = useLocation();

    // Check if children match the current path
    const isChildPathMatching = (children) => {
        let match = false;
        children.forEach((item) => {
            // Handle specific item URL match
            if (item.url && (pathname === item.url || pathname.startsWith(item.url))) {
                match = true;
            }
            
            // Handle ID match in path segments
            if (pathname.split('/').includes(item.id)) {
                match = true;
            }
            
            // Check nested children recursively
            if (item.children) {
                const childMatch = isChildPathMatching(item.children);
                if (childMatch) match = true;
            }
        });
        return match;
    };

    // Check current path match with menu items
    useEffect(() => {
        // Check if any child matches current path
        if (menu.children) {
            const childrenMatch = isChildPathMatching(menu.children);
            setChildrenMatches(childrenMatch);
            
            // If children match, open the parent menu
            if (childrenMatch && !customization.isOpen.includes(menu.id)) {
                dispatch({ type: MENU_OPEN, id: menu.id });
            }
        }
    }, [pathname, menu.children, menu.id, dispatch, customization.isOpen]);

    // menu collapse & item
    const menus = menu.children?.map((item) => {
        switch (item.type) {
            case 'collapse':
                return <NavCollapse key={item.id} menu={item} level={level + 1} />;
            case 'item':
                return <NavItem key={item.id} item={item} level={level + 1} />;
            default:
                return (
                    <Typography key={item.id} variant="h6" color="error" align="center">
                        Menu Items Error
                    </Typography>
                );
        }
    });

    const Icon = menu.icon;
    const menuIcon = menu.icon ? (
        <Icon strokeWidth={1.5} size="1.3rem" style={{ marginTop: 'auto', marginBottom: 'auto' }} />
    ) : (
        <FiberManualRecordIcon
            sx={{
                width: childrenMatches ? 8 : 6,
                height: childrenMatches ? 8 : 6
            }}
            fontSize={level > 0 ? 'inherit' : 'medium'}
        />
    );

    return (
        <>
            <ListItemButton
                sx={{
                    borderRadius: `${customization.borderRadius}px`,
                    mb: 0.5,
                    alignItems: 'flex-start',
                    backgroundColor: level > 1 ? 'transparent !important' : 'inherit',
                    py: level > 1 ? 1 : 1.25,
                    pl: `${level * 24}px`,
                    '&.Mui-selected': {
                        backgroundColor: childrenMatches ? theme.palette.primary.light : 'inherit',
                        color: childrenMatches ? theme.palette.primary.main : 'inherit',
                        '&:hover': {
                            backgroundColor: childrenMatches ? theme.palette.primary.light : 'inherit',
                        }
                    }
                }}
                selected={childrenMatches}
                onClick={handleClick}
            >
                <ListItemIcon 
                    sx={{ 
                        my: 'auto', 
                        minWidth: !menu.icon ? 18 : 36,
                        color: childrenMatches ? theme.palette.primary.main : 'inherit'  
                    }}
                >
                    {menuIcon}
                </ListItemIcon>
                <ListItemText
                    primary={
                        <Typography 
                            variant={childrenMatches ? 'h5' : 'body1'} 
                            color={childrenMatches ? theme.palette.primary.main : 'inherit'}
                            sx={{ my: 'auto' }}
                        >
                            {menu.title}
                        </Typography>
                    }
                    secondary={
                        menu.caption && (
                            <Typography variant="caption" sx={{ ...theme.typography.subMenuCaption }} display="block" gutterBottom>
                                {menu.caption}
                            </Typography>
                        )
                    }
                />
                {isOpen ? (
                    <IconChevronUp stroke={1.5} size="1rem" style={{ marginTop: 'auto', marginBottom: 'auto', color: childrenMatches ? theme.palette.primary.main : 'inherit' }} />
                ) : (
                    <IconChevronDown stroke={1.5} size="1rem" style={{ marginTop: 'auto', marginBottom: 'auto', color: childrenMatches ? theme.palette.primary.main : 'inherit' }} />
                )}
            </ListItemButton>
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <List
                    component="div"
                    disablePadding
                    sx={{
                        position: 'relative'
                    }}
                    onClick={(e) => e.stopPropagation()} // 이벤트 버블링 방지
                >
                    {menus}
                </List>
            </Collapse>
        </>
    );
};

NavCollapse.propTypes = {
    menu: PropTypes.object,
    level: PropTypes.number
};

export default NavCollapse;
