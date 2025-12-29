import PropTypes from 'prop-types';
import { forwardRef, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Avatar, Chip, ListItemButton, ListItemIcon, ListItemText, Typography, useMediaQuery } from '@mui/material';

// project imports
import { MENU_OPEN, SET_MENU } from 'store/actions';

// assets
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

// ==============================|| SIDEBAR MENU LIST ITEMS ||============================== //

const NavItem = ({ item, level }) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const { pathname } = useLocation();
    const customization = useSelector((state) => state.customization);
    const matchesSM = useMediaQuery(theme.breakpoints.down('lg'));

    const [isSelected, setIsSelected] = useState(false);

    const Icon = item.icon;
    const itemIcon = item?.icon ? (
        <Icon stroke={1.5} size="1.3rem" />
    ) : (
        <FiberManualRecordIcon
            sx={{
                width: isSelected ? 8 : 6,
                height: isSelected ? 8 : 6
            }}
            fontSize={level > 0 ? 'inherit' : 'medium'}
        />
    );

    // Check if current item matches the current path
    useEffect(() => {
        // Direct URL match
        if (item.url && (pathname === item.url || pathname.startsWith(item.url + '/'))) {
            setIsSelected(true);
        } 
        // ID match in path segments (for dynamic routes)
        else if (pathname.split('/').includes(item.id)) {
            setIsSelected(true);
        } 
        else {
            setIsSelected(false);
        }
    }, [pathname, item.url, item.id]);

    // Handle click on menu item
    const itemHandler = (id) => {
        // Uncomment if you want to open/close submenus
        // dispatch({ type: MENU_OPEN, id: item.id });
        
        if (matchesSM) {
            dispatch({ type: SET_MENU, opened: false });
        }
    };

    // Avoid non-root level item having no key error in sub-menu
    let listItemProps = {
        component: forwardRef((props, ref) => <Link ref={ref} {...props} to={item.url} target={item.target ? '_blank' : '_self'} />)
    };
    if (item?.external) {
        listItemProps = { component: 'a', href: item.url, target: item.target ? '_blank' : '_self' };
    }

    return (
        <ListItemButton
            {...listItemProps}
            disabled={item.disabled}
            sx={{
                borderRadius: `${customization.borderRadius}px`,
                mb: 0.5,
                alignItems: 'flex-start',
                backgroundColor: level > 1 ? 'transparent !important' : 'inherit',
                py: level > 1 ? 1 : 1.25,
                pl: `${level * 24}px`,
                '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.main,
                    '&:hover': {
                        backgroundColor: theme.palette.primary.light
                    }
                }
            }}
            selected={isSelected}
            onClick={() => itemHandler(item.id)}
        >
            <ListItemIcon 
                sx={{ 
                    my: 'auto', 
                    minWidth: !item?.icon ? 18 : 36,
                    color: isSelected ? theme.palette.primary.main : 'inherit'
                }}
            >
                {itemIcon}
            </ListItemIcon>
            <ListItemText
                primary={
                    <Typography 
                        variant={isSelected ? 'h5' : 'body1'} 
                        color={isSelected ? theme.palette.primary.main : 'inherit'}
                    >
                        {item.title}
                    </Typography>
                }
                secondary={
                    item.caption && (
                        <Typography variant="caption" sx={{ ...theme.typography.subMenuCaption }} display="block" gutterBottom>
                            {item.caption}
                        </Typography>
                    )
                }
            />
            {item.chip && (
                <Chip
                    color={item.chip.color}
                    variant={item.chip.variant}
                    size={item.chip.size}
                    label={item.chip.label}
                    avatar={item.chip.avatar && <Avatar>{item.chip.avatar}</Avatar>}
                />
            )}
        </ListItemButton>
    );
};

NavItem.propTypes = {
    item: PropTypes.object,
    level: PropTypes.number
};

export default NavItem;
