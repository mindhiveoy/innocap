'use client';

import { useState } from 'react';
import { 
  List, 
  Box,
  IconButton,
  Typography,
  Divider,
} from '@mui/material';
import styled from '@emotion/styled';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import { IndicatorCard } from './IndicatorCard';

const NAV_WIDTH = 80;
const DRAWER_WIDTH = 340;

const StyledNav = styled.nav(({ theme }) => `
  width: ${NAV_WIDTH}px;
  background-color: ${theme.palette.background.paper};
  border-right: 1px solid ${theme.palette.divider};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${theme.spacing(1)};
  position: fixed;
  height: 100vh;
  z-index: 1200;
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
`);

const ContentDrawer = styled.div(({ theme }) => `
  position: fixed;
  left: ${NAV_WIDTH}px;
  top: 0;
  width: ${DRAWER_WIDTH}px;
  height: 100vh;
  background-color: ${theme.palette.background.paper};
  border-right: 1px solid ${theme.palette.divider};
  transform: translateX(-100%);
  transition: transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms;
  z-index: 1100;
  box-shadow: ${theme.shadows[3]};

  &.open {
    transform: translateX(0);
  }
`);

export function SideNav() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  return (
    <>
      <StyledNav>
        <Box sx={{ mb: 2 }}>
          <IconButton>
            <MenuIcon />
          </IconButton>
        </Box>
        <List sx={{ width: '100%', p: 0 }}>
          {menuItems.map((item) => (
            <NavItem
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={selectedItem === item.id ? 'selected' : ''}
            >
              {item.icon}
              <Typography
                variant="caption"
                sx={{
                  mt: 0.5,
                  textAlign: 'center',
                  fontSize: '0.75rem',
                }}
              >
                {item.text}
              </Typography>
            </NavItem>
          ))}
        </List>
      </StyledNav>

      <ContentDrawer className={drawerOpen ? 'open' : ''}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {selectedItem && menuItems.find(item => item.id === selectedItem)?.text}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <IndicatorCard
            title="Public Transportation"
            description="Profitability and coverage of public transportation routes in the region"
            iconName="DirectionsBusIcon"
          />
          
          <IndicatorCard
            title="Building Emissions"
            description="CO2 emissions from residential and commercial buildings"
            iconName="MapsHomeWorkIcon"
          />
          
          <IndicatorCard
            title="Energy Consumption"
            description="Regional energy consumption patterns and efficiency metrics"
            iconName="MapsHomeWorkIcon"
          />
        </Box>
      </ContentDrawer>
    </>
  );
} 