'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
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
import { Indicator } from '@repo/ui/types/indicators';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';

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
    justify-content: space-evenly;
    align-items: center;
    height: 100%;
    padding: ${theme.spacing(1, 0)};
  }
`);

const NavItem = styled.button(({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${theme.spacing(1)};
  cursor: pointer;
  width: 100%;
  border: none;
  background: none;
  border-radius: ${theme.shape.borderRadius}px;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${theme.palette.action.hover};
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${theme.palette.primary.main};
  }

  &.selected {
    background: ${theme.palette.gradient.primary};
    color: ${theme.palette.common.white};
  }

  @media (max-width: 768px) {
    width: ${NAV_HEIGHT - 8}px;
    min-width: ${NAV_HEIGHT - 16}px;
    flex: 0 0 auto;
    justify-content: center;
    margin: ${theme.spacing(0.75)};
    padding: ${theme.spacing(0.5)};
    height: ${NAV_HEIGHT - 16}px;
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

const GroupTitle = styled(Typography)(({ theme }) => `
  color: ${theme.palette.text.secondary};
  font-weight: 500;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: ${theme.spacing(1)};
`);

const DrawerContent = styled(Box)(({ theme }) => `
  display: flex;
  flex-direction: column;
  padding: ${theme.spacing(3, 2)};
  gap: ${theme.spacing(2)};
`);

const LogoContainer = styled(Box)(({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
  margin-top: ${theme.spacing(3)};
  align-items: center;
  justify-content: center;

  img {
    max-width: 100%;
    height: auto;
  }
`)

const DrawerHeader = styled(Box)(({ theme }) => `
  display: flex;
  align-items: center;
  padding: ${theme.spacing(2, 2)};
  position: sticky;
  top: 0;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(5px);
  z-index: 1;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
  gap: ${theme.spacing(2)};
  
  @media (max-width: 768px) {
    justify-content: space-between;
  }
  
  @media (min-width: 769px) {
    justify-content: space-between;
  }

  h2 {
    margin: 0;
    flex: 1;
    font-size: ${theme.typography.h2.fontSize};
    
    @media (max-width: 1200px) {
      font-size: 1.25rem;
    }
  }
`);

const CloseButton = styled.button(({ theme }) => `
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${theme.palette.primary.main};
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  border-radius: ${theme.shape.borderRadius}px;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(1.1);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${theme.palette.primary.main};
    transform: scale(1.1);
  }

  svg {
    display: block;
    margin: auto;
  }
`);

const LogoSection = styled(Box)(({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${theme.spacing(2)};

  @media (max-width: 768px) {
    display: none;
  }
`);

const LogoImage = styled(Box)(({ theme }) => `
  width: 65px;
  height: 65px;
  background-color: ${theme.palette.primary.darkest};
  border-radius: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: auto;
    height: 50px;
    object-fit: contain;
    margin-bottom: -5px;
  }
`);

interface GroupedIndicators {
  [key: string]: {
    group: string;
    groupFI: string;
    indicators: Indicator[];
  };
}




interface MenuItem {
  text: string;
  icon: React.ReactNode;
  id: string;
}

export function SideNav() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const { indicators, error } = useData();
  const drawerRef = useRef<HTMLDivElement>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  const menuItems: MenuItem[] = [
    {
      text: 'Welcome',
      icon: <HomeIcon />,
      id: 'welcome'
    },
    {
      text: 'Green',
      icon: (
        <Box
          component="img"
          src="/icons/leaf.svg"
          alt=""
          aria-hidden="true"
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
      text: 'About',
      icon: (
        <Box
          component="img"
          src="/icons/information-variant-box.svg"
          sx={{
            width: 24,
            height: 24,
            filter: selectedItem === 'about' ? 'brightness(0) invert(1)' : 'none'
          }}
        />
      ),
      id: 'about'
    },
  ];

  // Group indicators by their group property
  const groupedIndicators = indicators?.reduce<GroupedIndicators>((acc, indicator) => {
    if (!indicator.group) return acc;

    if (!acc[indicator.group]) {
      acc[indicator.group] = {
        group: indicator.group,
        groupFI: indicator.groupFI,
        indicators: []
      };
    }

    acc[indicator.group].indicators.push(indicator);
    return acc;
  }, {});

  // Focus management when opening/closing drawer
  useEffect(() => {
    if (drawerOpen) {
      lastActiveElementRef.current = document.activeElement as HTMLElement;
      const closeButton = drawerRef.current?.querySelector('button') as HTMLElement;
      closeButton?.focus();
    } else if (lastActiveElementRef.current) {
      lastActiveElementRef.current.focus();
    }
  }, [drawerOpen]);

  // Handle escape key to close drawer
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && drawerOpen) {
        setDrawerOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [drawerOpen]);

  const handleItemClick = useCallback((itemId: string) => {
    if (selectedItem === itemId) {
      setDrawerOpen(!drawerOpen);
    } else {
      setSelectedItem(itemId);
      setDrawerOpen(true);
    }
  }, [selectedItem, drawerOpen]);

  const handleItemKeyDown = useCallback((event: React.KeyboardEvent, itemId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleItemClick(itemId);
    }
  }, [handleItemClick]);

  const renderDrawerContent = () => {
    const content = (() => {
      switch (selectedItem) {
        case 'welcome':
          return (
            <>
              <DrawerHeader>
                <CloseButton onClick={() => setDrawerOpen(false)} aria-label="Close panel">
                  <Box 
                    display='flex' 
                    alignItems='center' 
                    sx={{ 
                      display: { xs: 'none', md: 'block' },
                      height: '24px',
                    }}
                  >
                    <ArrowBackIcon />
                  </Box>
                  <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                    <CloseIcon />
                  </Box>
                </CloseButton>
                <Typography variant="h2" color="primary.darkest">
                  Southern Savo Green and Digital Transition Dashboard
                </Typography>
                <Box width={40} /> {/* Spacer to balance the close button */}
              </DrawerHeader>
              <DrawerContent>
                <Typography variant="lead" gutterBottom>
                  We are building public sector innovation capacity towards digital-driven NPA communities
                </Typography>
                <Typography variant="paragraph" sx={{ mb: 4 }}>
                  This dashboard visualizes the green and digital transition indicators for the Southern Savo region.
                  <br />
                  <br />
                  The indicators help monitor and understand the progress of municipalities in their journey towards
                  sustainable and digital future.
                </Typography>
                <LogoContainer>
                  <Box 
                    component="img"
                    src="/innocap_funder_logo.png"
                    alt="Innocap Funder Logo"
                  />
                  <Box 
                    component="img"
                    src="/university_of_helsinki_ruralia.png"
                    alt="University of Helsinki Ruralia Institute Logo"
                  />
                </LogoContainer>
              </DrawerContent>
            </>
          );
        case 'green':
          return (
            <>
              <DrawerHeader>
                <CloseButton onClick={() => setDrawerOpen(false)} aria-label="Close panel">
                  <Box 
                    display='flex' 
                    alignItems='center' 
                    sx={{ 
                      display: { xs: 'none', md: 'block' },
                      height: '24px',
                    }}
                  >
                    <ArrowBackIcon />
                  </Box>
                  <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                    <CloseIcon />
                  </Box>
                </CloseButton>
                <Typography variant="h2" color="primary.darkest">
                  Green Transition Indicators
                </Typography>
                <Box width={40} /> {/* Spacer to balance the close button */}
              </DrawerHeader>
              <DrawerContent>
                {error ? (
                  <Typography color="error">Error loading indicators</Typography>
                ) : (
                  Object.values(groupedIndicators || {}).map(({ group, indicators }) => (
                    <span key={group}>
                      <GroupTitle variant='h2'>
                        {group}
                      </GroupTitle>
                      <Box key={group}>
                        {indicators.map((indicator, index) => (
                          <IndicatorCard
                            key={`${indicator.id}-${index}`}
                            indicator={indicator}
                          />
                        ))}
                      </Box>
                    </span>
                  ))
                )}
              </DrawerContent>
            </>
          );
        case 'about':
          return (
            <>
              <DrawerHeader>
                <CloseButton onClick={() => setDrawerOpen(false)} aria-label="Close panel">
                  <Box 
                    display='flex' 
                    alignItems='center' 
                    sx={{ 
                      display: { xs: 'none', md: 'block' },
                      height: '24px',
                    }}
                  >
                    <ArrowBackIcon />
                  </Box>
                  <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                    <CloseIcon />
                  </Box>
                </CloseButton>
                <Typography variant="h2" color="primary.darkest">
                  About
                </Typography>
                <Box width={40} /> {/* Spacer to balance the close button */}
              </DrawerHeader>
              <DrawerContent>
                <Typography variant="lead" gutterBottom>
                  Learn how to use the platform and understand the indicators
                </Typography>
                <Typography variant="paragraph" sx={{ mb: 2 }}>
                  The dashboard provides an interactive way to explore and compare different indicators across municipalities in the Southern Savo region.
                </Typography>
                <GroupTitle variant='h2'>
                  Basic Navigation
                </GroupTitle>
                <Typography variant="paragraph" sx={{ mb: 2 }}>
                  • Click on municipalities to see detailed information
                  <br />
                  • Use the side navigation to switch between different indicator categories
                  <br />
                  • Explore the map to understand regional patterns
                </Typography>
                <GroupTitle variant='h2'>
                  Working with Indicators
                </GroupTitle>
                <Typography variant="paragraph" sx={{ mb: 2 }}>
                  • Select an indicator to view it on the map
                  <br />
                  • Pin an indicator to compare it with another
                </Typography>
                <GroupTitle variant='h2'>
                  AI Assistant
                </GroupTitle>
                <Typography variant="paragraph">
                  • An AI assistant is available to help answer your questions
                  <br />
                  • Please note that the assistant is in development phase and may have limited knowledge
                </Typography>
              </DrawerContent>
            </>
          );
        default:
          return null;
      }
    })();

    return content;
  };

  return (
    <>
      <StyledNav aria-label="Main navigation">
        <NavList role="menubar">
          <LogoSection>
            <LogoImage>
              <Image 
                src="/innocap_logo.svg" 
                alt="Innocap Logo"
                width={68} 
                height={68} 
              />
            </LogoImage>
            <Typography
              variant="label"
              color="primary.dark"
              textAlign="center"
            >
              Innocap Portal
            </Typography>
          </LogoSection>
          {menuItems.map((item) => (
            <NavItem
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              onKeyDown={(e) => handleItemKeyDown(e, item.id)}
              className={selectedItem === item.id ? 'selected' : ''}
              aria-expanded={selectedItem === item.id && drawerOpen}
              aria-haspopup="dialog"
              aria-controls={`drawer-${item.id}`}
              role="menuitem"
              tabIndex={0}
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
                aria-hidden="true"
              >
                {item.icon}
              </Box>
              <Typography
                variant="caption"
                component="span"
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

      <ContentDrawer 
        className={drawerOpen ? 'open' : ''} 
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        id={selectedItem ? `drawer-${selectedItem}` : undefined}
        aria-label={selectedItem ? `${selectedItem} panel` : undefined}
      >
        {renderDrawerContent()}
      </ContentDrawer>
    </>
  );
} 