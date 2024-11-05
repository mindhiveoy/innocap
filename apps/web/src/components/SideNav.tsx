'use client';

import { useState } from 'react';
import { 
  List, 
  Box,
  Typography,
} from '@mui/material';
import styled from '@emotion/styled';
import HomeIcon from '@mui/icons-material/Home';
import { IndicatorCard } from './IndicatorCard';
import { useData } from '@/contexts/DataContext';
import { NAV_WIDTH, NAV_HEIGHT, DRAWER_WIDTH } from '@/constants/layout';

const StyledNav = styled.nav(({ theme }) => `
  background-color: ${theme.palette.background.paper};
  border-right: 1px solid ${theme.palette.divider};
  display: flex;
  position: fixed;
  z-index: 1200;

  @media (min-width: 769px) {
    top: 0;
    left: 0;
    width: ${NAV_WIDTH}px;
    height: 100vh;
    flex-direction: column;
    padding: ${theme.spacing(1)};
  }

  @media (max-width: 768px) {
    bottom: 0;
    left: 0;
    width: 100%;
    height: ${NAV_HEIGHT}px;
    border-right: none;
    border-top: 1px solid ${theme.palette.divider};
  }
`);

const NavList = styled(List)(({ theme }) => `
  width: 100%;
  padding: 0;
  
  @media (max-width: 768px) {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    height: 100%;
  }
`);

const NavItem = styled.div(({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${theme.spacing(1)};
  cursor: pointer;
  width: 100%;
  border-radius: ${theme.shape.borderRadius}px;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${theme.palette.action.hover};
  }

  &.selected {
    background: ${theme.palette.gradient.primary};
    color: ${theme.palette.common.white};
  }

  @media (max-width: 768px) {
    width: auto;
    flex: 1;
    justify-content: center;
    margin: ${theme.spacing(0.75)};
    padding: ${theme.spacing(0.5)};
  }
`);

const ContentDrawer = styled.div(({ theme }) => `
  position: fixed;
  background-color: rgba(255, 255, 255, 0.70);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  transition: transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms;
  z-index: 1100;
  box-shadow: ${theme.shadows[3]};
  overflow: auto;

  @media (max-width: 768px) {
    left: 0;
    bottom: ${NAV_HEIGHT}px;
    width: 100%;
    height: calc(100vh - ${NAV_HEIGHT}px);
    max-height: calc(100vh - ${NAV_HEIGHT}px);
    border-top: 1px solid ${theme.palette.divider};
    transform: translateY(100%);
    border-top-left-radius: ${theme.shape.borderRadius}px;
    border-top-right-radius: ${theme.shape.borderRadius}px;
  }

  @media (min-width: 769px) {
    left: ${NAV_WIDTH}px;
    top: 0;
    width: ${DRAWER_WIDTH}px;
    height: 100vh;
    border-right: 1px solid ${theme.palette.divider};
    transform: translateX(-100%);
  }

  &.open {
    transform: translateX(0) translateY(0);
  }
`);

export function SideNav() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { indicators, isLoading: loading, error } = useData();

  const menuItems = [
    { text: 'Welcome', icon: <HomeIcon />, id: 'welcome' },
    { 
      text: 'Green', 
      icon: (
        <Box 
          component="img" 
          src="/icons/leaf.svg" 
          sx={{ 
            width: 24, 
            height: 24,
            filter: selectedItem === 'green' ? 'brightness(0) invert(1)' : 'none'
          }} 
        />
      ), 
      id: 'green' 
    },
    { 
      text: 'Digital', 
      icon: (
        <Box 
          component="img" 
          src="/icons/access-point-network.svg" 
          sx={{ 
            width: 24, 
            height: 24,
            filter: selectedItem === 'digital' ? 'brightness(0) invert(1)' : 'none'
          }} 
        />
      ), 
      id: 'digital' 
    },
    { 
      text: 'Ask AI', 
      icon: (
        <Box 
          component="img" 
          src="/icons/chat-question.svg" 
          sx={{ 
            width: 24, 
            height: 24,
            filter: selectedItem === 'ai' ? 'brightness(0) invert(1)' : 'none'
          }} 
        />
      ), 
      id: 'ai' 
    },
    { 
      text: 'Guide', 
      icon: (
        <Box 
          component="img" 
          src="/icons/information-variant-box.svg" 
          sx={{ 
            width: 24, 
            height: 24,
            filter: selectedItem === 'guide' ? 'brightness(0) invert(1)' : 'none'
          }} 
        />
      ), 
      id: 'guide' 
    },
  ];

  const handleItemClick = (itemId: string) => {
    if (selectedItem === itemId) {
      setDrawerOpen(!drawerOpen);
    } else {
      setSelectedItem(itemId);
      setDrawerOpen(true);
    }
  };

  const renderDrawerContent = () => {
    switch (selectedItem) {
      case 'welcome':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Welcome to Innocap
            </Typography>
            <Typography variant="body1">
              Explore sustainability and digital innovation indicators across municipalities in South Savo region.
            </Typography>
          </Box>
        );

      case 'green':
        return (
          <Box sx={{ p: 3 }}>
            {loading ? (
              <Typography>Loading indicators...</Typography>
            ) : error ? (
              <Typography color="error">Error loading indicators</Typography>
            ) : (
              indicators?.map(indicator => (
                <IndicatorCard
                  key={indicator.id}
                  indicator={indicator}
                />
              ))
            )}
          </Box>
        );

      case 'digital':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Digital Indicators
            </Typography>
            <Typography variant="body1">
              Coming soon: Explore digital transformation indicators across the region.
            </Typography>
          </Box>
        );

      case 'ai':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Ask AI
            </Typography>
            <Typography variant="body1">
              Coming soon: Get AI-powered insights about regional development and sustainability.
            </Typography>
          </Box>
        );

      case 'guide':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              User Guide
            </Typography>
            <Typography variant="body1">
              Learn how to use the platform and understand the indicators.
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              • Click on municipalities to see detailed information
            </Typography>
            <Typography variant="body2">
              • Use the tabs to switch between different indicator categories
            </Typography>
            <Typography variant="body2">
              • Explore the map to understand regional patterns
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <StyledNav>
        <NavList>
          {menuItems.map((item) => (
            <NavItem
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={selectedItem === item.id ? 'selected' : ''}
            >
              <Box
                sx={{
                  width: { xs: 20, md: 24 },
                  height: { xs: 20, md: 24 },
                  '& img': {
                    width: '100%',
                    height: '100%'
                  }
                }}
              >
                {item.icon}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  mt: { xs: 0.25, md: 0.5 },
                  textAlign: 'center',
                  fontSize: { xs: '0.65rem', md: '0.75rem' },
                }}
              >
                {item.text}
              </Typography>
            </NavItem>
          ))}
        </NavList>
      </StyledNav>

      <ContentDrawer className={drawerOpen ? 'open' : ''}>
        {renderDrawerContent()}
      </ContentDrawer>
    </>
  );
} 