'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  List,
  Box,
  Typography,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Link,
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
import { openPreferences } from '@/utils/cookieConsent';
import SettingsIcon from '@mui/icons-material/Settings';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { Trans } from 'react-i18next';
import React from 'react';

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
  color: ${theme.palette.text.primary};
  -webkit-tap-highlight-color: transparent;
  -webkit-appearance: none;
  appearance: none;

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
    height: calc(100dvh - ${NAV_HEIGHT}px);
    max-height: calc(100dvh - ${NAV_HEIGHT}px);
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
  gap: ${theme.spacing(1)};
  padding-top: ${theme.spacing(2)};
  margin-bottom: ${theme.spacing(2)};

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

const LanguageSelector = styled(ToggleButtonGroup)(({ theme }) => `
  width: 100%;
  gap: ${theme.spacing(2)};
  .MuiToggleButton-root {
    flex: 1;
    text-transform: none;
    border-radius: ${theme.shape.borderRadius}px;
    color: ${theme.palette.text.primary};
    border-color: ${theme.palette.divider};
    
    &.Mui-selected {
      background-color: ${theme.palette.primary.main};
      color: ${theme.palette.primary.contrastText};
      &:hover {
        background-color: ${theme.palette.primary.dark};
      }
    }
  }
`);

const StyledLink = styled(Link)(({ theme }) => `
  font-size: 14px;
  letter-spacing: 0.14px;
  font-weight: 500;
  color: ${theme.palette.primary.main};
  &:hover {
    font-weight: 600;
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
  text?: string;
  icon: React.ReactNode;
  id?: string;
  label?: string;
  onClick?: () => void;
}

export function SideNav() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const { indicators, error } = useData();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const drawerRef = useRef<HTMLDivElement>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  const menuItems: MenuItem[] = [
    {
      text: t('navigation.welcome'),
      icon: <HomeIcon />,
      id: 'welcome'
    },
    {
      text: t('navigation.green'),
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
      text: t('navigation.about'),
      icon: (
        <Box
          component="img"
          src="/icons/information-variant-box.svg"
          sx={{
            width: 24,
            height: 24,
            filter: selectedItem === 'information' ? 'brightness(0) invert(1)' : 'none'
          }}
        />
      ),
      id: 'information'
    },
    {
      text: t('navigation.settings'),
      icon: <SettingsIcon />,
      id: 'settings'
    }
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

  const handleItemClick = useCallback((itemId: string | undefined) => {
    if (!itemId) {
      return;
    }
    if (selectedItem === itemId) {
      setDrawerOpen(!drawerOpen);
    } else {
      setSelectedItem(itemId);
      setDrawerOpen(true);
    }
  }, [selectedItem, drawerOpen]);

  const handleItemKeyDown = useCallback((event: React.KeyboardEvent, itemId: string | undefined) => {
    if (!itemId) {
      return;
    }
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
                  {t('welcome.title')}
                </Typography>
                <Box width={40} />
              </DrawerHeader>
              <DrawerContent>
                <GroupTitle variant='h2'>
                  {t('welcome.subtitle')}
                </GroupTitle>
                <Typography variant="paragraph" sx={{ mb: 3 }}>
                  {t('welcome.content.intro.text')}
                  <br />
                  <br />
                  {t('welcome.content.purpose.text')}
                  <br />
                  <br />
                  <Trans
                    i18nKey="welcome.content.about.text"
                    components={{
                      innocapLink: (
                        <StyledLink 
                          href={t('welcome.content.about.links.innocapHref')} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          color="primary"
                        />
                      ),
                      hidseLink: (
                        <StyledLink 
                          href={t('welcome.content.about.links.hidseHref')} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          color="primary"
                        />
                      ),
                      ruraliaLink: (
                        <StyledLink 
                          href={t('welcome.content.about.links.ruraliaHref')} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          color="primary"
                        />
                      ),
                      mindhiveLink: (
                        <StyledLink 
                          href={t('welcome.content.about.links.mindhiveHref')} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          color="primary"
                        />
                      )
                    }}
                    values={{
                      innocap: t('welcome.content.about.links.innocap'),
                      innocapText: t('welcome.content.about.innocapText'),
                      hidse: t('welcome.content.about.links.hidse'),
                      ruralia: t('welcome.content.about.links.ruralia'),
                      mindhive: t('welcome.content.about.links.mindhive')
                    }}
                  />
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
                  {t('indicators.title')}
                </Typography>
                <Box width={40} />
              </DrawerHeader>
              <DrawerContent>
                {error ? (
                  <Typography color="error">Error loading indicators</Typography>
                ) : (
                  Object.values(groupedIndicators || {}).map(({ group, groupFI, indicators }) => (
                    <span key={group}>
                      <GroupTitle variant='h2'>
                        {currentLanguage === 'fi' ? groupFI : group}
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
        case 'information':
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
                  {t('information.title')}
                </Typography>
                <Box width={40} />
              </DrawerHeader>
              <DrawerContent>
                <Typography variant="paragraph" sx={{ mb: 3 }}>
                  {t('information.description')}
                </Typography>

                <GroupTitle variant='h2'>
                  {t('information.sections.navigation.title')}
                </GroupTitle>
                <Typography variant="paragraph" sx={{ mb: 3 }}>
                  {(t('information.sections.navigation.items', { returnObjects: true }) as string[]).map((item: string) => (
                    <React.Fragment key={item}>
                      • {item}
                      <br />
                    </React.Fragment>
                  ))}
                </Typography>

                <GroupTitle variant='h2'>
                  {t('information.sections.indicators.title')}
                </GroupTitle>
                <Typography variant="paragraph" sx={{ mb: 3 }}>
                  {(t('information.sections.indicators.items', { returnObjects: true }) as string[]).map((item: string) => (
                    <React.Fragment key={item}>
                      • {item}
                      <br />
                    </React.Fragment>
                  ))}
                </Typography>

                <GroupTitle variant='h2'>
                  {t('information.sections.ai.title')}
                </GroupTitle>
                <Typography variant="paragraph" sx={{ mb: 3 }}>
                  {(t('information.sections.ai.items', { returnObjects: true }) as string[]).map((item: string) => (
                    <React.Fragment key={item}>
                      • {item}
                      <br />
                    </React.Fragment>
                  ))}
                </Typography>
                <GroupTitle variant='h2'>
                  {t('information.sections.terms.title')}
                </GroupTitle>
                <Box sx={{ mb: 3 }}>
                  • <StyledLink href={t('information.sections.terms.termsLink')} target="_blank" rel="noopener noreferrer">
                  {t('information.sections.terms.terms')}
                  </StyledLink>
                  <br />
                  • <StyledLink href={t('information.sections.terms.privacyLink')} target="_blank" rel="noopener noreferrer">
                    {t('information.sections.terms.privacy')}
                  </StyledLink>
                </Box>
              </DrawerContent>
            </>
          );
        case 'settings':
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
                  {t('settings.title')}
                </Typography>
                <Box width={40} />
              </DrawerHeader>
              <DrawerContent>
                <GroupTitle variant='h2'>
                  {t('settings.privacy.title')}
                </GroupTitle>
                <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column'}}>
                  <Typography variant="paragraph" sx={{ mb: 2 }}>
                    {t('settings.privacy.description')}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={openPreferences}
                    startIcon={<SettingsIcon />}
                    sx={{ width: '100%' }}
                  >
                    {t('settings.privacy.cookiePreferences')}
                  </Button>
                </Box>

                <GroupTitle variant='h2'>
                  {t('settings.language.title')}
                </GroupTitle>
                <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column'}}>
                  <Typography variant="paragraph" sx={{ mb: 2 }}>
                    {t('settings.language.select')}
                  </Typography>
                  <LanguageSelector
                    value={currentLanguage}
                    exclusive
                    onChange={(_, value) => value && changeLanguage(value)}
                    aria-label={t('settings.language.select')}
                  >
                    <ToggleButton value="en">English</ToggleButton>
                    <ToggleButton value="fi">Suomi</ToggleButton>
                  </LanguageSelector>
                </Box>
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
              variant="paragraph"
              fontWeight={600}
              color="primary.dark"
              textAlign="center"
            >
              {t('global.name')}
            </Typography>
          </LogoSection>
          {menuItems.map((item) => {
            // Pre-compute aria attributes to avoid duplicates
            const ariaAttrs = item.id ? {
              'aria-expanded': selectedItem === item.id && drawerOpen,
              'aria-haspopup': "dialog" as const,
              'aria-controls': `drawer-${item.id}`
            } : {};

            return (
              <NavItem
                key={item.id || item.label}
                onClick={item.onClick || (() => handleItemClick(item.id))}
                onKeyDown={(e) => handleItemKeyDown(e, item.id)}
                className={item.id && selectedItem === item.id ? 'selected' : ''}
                role="menuitem"
                tabIndex={0}
                {...ariaAttrs}
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
            );
          })}
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