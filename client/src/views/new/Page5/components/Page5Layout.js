import React from 'react';
import PropTypes from 'prop-types';
import { Box, Paper, Typography, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import MainCard from 'ui-component/cards/MainCard';

// Custom components
import TabsMenu from './TabsMenu';

// Page5 layout component
const Page5Layout = ({ children, title, icon, activeTab, breadcrumbsItems = [] }) => {
  // Breadcrumbs for navigation
  const defaultBreadcrumbs = [
    <Link 
      underline="hover" 
      color="inherit" 
      component={RouterLink} 
      to="/dashboard/default" 
      key="home"
      sx={{ display: 'flex', alignItems: 'center' }}
    >
      <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
      Home
    </Link>,
    <Link
      underline="hover"
      color="inherit"
      component={RouterLink}
      to="/new/page5"
      key="page5"
    >
      예약현황
    </Link>
  ];

  // Combine default breadcrumbs with any additional items
  const fullBreadcrumbs = [...defaultBreadcrumbs, ...breadcrumbsItems];

  return (
    <MainCard>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        {fullBreadcrumbs}
      </Breadcrumbs>

      {/* Page title */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3 
      }}>
        {icon}
        <Typography variant="h3" component="h1" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>

      {/* Navigation tabs */}
      <TabsMenu activeTab={activeTab} />

      {/* Page content */}
      <Box sx={{ mt: 2 }}>
        {children}
      </Box>
    </MainCard>
  );
};

Page5Layout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  icon: PropTypes.node,
  activeTab: PropTypes.string,
  breadcrumbsItems: PropTypes.array
};

export default Page5Layout; 