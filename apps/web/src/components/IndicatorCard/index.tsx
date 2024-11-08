import styled from '@emotion/styled';
import { Typography, Box, IconButton, Tooltip, ToggleButtonGroup, ToggleButton } from '@mui/material';
import DirectionsBus from '@mui/icons-material/DirectionsBus';
import TerrainIcon from '@mui/icons-material/Terrain';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BarChartIcon from '@mui/icons-material/BarChart';
import MapsHomeWork from '@mui/icons-material/MapsHomeWork';
import Home from '@mui/icons-material/Home';
import SolarPower from '@mui/icons-material/SolarPower';
import WaterDrop from '@mui/icons-material/WaterDrop';
import EnergySavingsLeaf from '@mui/icons-material/EnergySavingsLeaf';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { useIndicator } from '@/contexts/IndicatorContext';
import type { Indicator } from '@repo/ui/types/indicators';
import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useData } from '@/contexts/DataContext';

interface IndicatorCardProps {
  indicator: Indicator;
}

const CardWrapper = styled.div(({ theme }) => `
  background: ${theme.palette.background.paper};
  border: 1px solid ${theme.palette.divider};
  border-radius: ${theme.shape.borderRadius}px;
  padding: ${theme.spacing(3)};
  margin-bottom: ${theme.spacing(2)};
  transition: all 0.2s ease-in-out;

  &:hover {
    border: 1px solid ${theme.palette.secondary.main};
  }
  &.selected {
    border: 2px solid ${theme.palette.secondary.main};
    box-shadow: rgba(230, 137, 57, 0.24) 0px 3px 8px;
  }
`);

const CardHeader = styled.div(({ theme }) => `
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing(1)};
`);

const TitleSection = styled.div(({ theme }) => `
  display: flex;
  flex-direction: column;
  flex: 1;
  color: ${theme.palette.primary.darkest};
`);

const TitleRow = styled.div(({ theme }) => `
  display: flex;
  flex-direction: row;
  flex: 1;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${theme.spacing(1)};
`);

const IconWrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: flex-end;
  width: 32px;
  height: 32px;
`;

const PinButton = styled(IconButton)(({ theme }) => `
  display: flex;
  justify-self: flex-start;
  justify-content: flex-start;
  align-items: center;
  gap: ${theme.spacing(1)};
  padding: 0;
  border-radius: ${theme.shape.borderRadius}px;
  margin-left: -1;
  width: 100%;
  
  &:hover {
    background-color: transparent;
  }
  
  .pin-icon {
    transition: transform 0.2s ease-in-out;
  }

  .MuiSvgIcon-root[data-testid="PushPinOutlinedIcon"] {
    margin-left: -5px !important;
    margin-right: 5px !important;
  }
  
  &.pinned .pin-icon {
    transform: rotate(-45deg);
    color: ${theme.palette.primary.main};

  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      background-color: transparent;
    }

    .MuiTypography-root {
      color: ${theme.palette.text.disabled};
    }
  }
`);

const PinText = styled(Typography)(({ theme }) => `
  font-size: 0.75rem;
  color: ${theme.palette.primary.darkest};
  margin: ${theme.spacing(2, 0, 3, 0)};
`);

const SourceTextWrapper = styled.div`
  width: 100%;
`;

const SourceText = styled(Typography)(({ theme }) => `
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  width: 100%;
  color: ${theme.palette.text.secondary};
`);

const iconComponents = {
  'DirectionsBus': DirectionsBus,
  'MapsHomeWork': MapsHomeWork,
  'Home': Home,
  'SolarPower': SolarPower,
  'WaterDrop': WaterDrop,
  'EnergySavingsLeaf': EnergySavingsLeaf,
  'HomeIcon': Home  // Fallback for HomeIcon
} as const;

type IconName = keyof typeof iconComponents;

const GradientIcon = ({ iconName }: { iconName: string }) => {  
  // Remove 'Icon' suffix if it exists
  const cleanIconName = iconName.replace(/Icon$/, '') as IconName;
  const IconComponent = iconComponents[cleanIconName] || iconComponents.Home;
  
  if (!IconComponent) {
    console.warn(`Icon not found for name: ${iconName}, using Home icon as fallback`);
    return <Home sx={{ fill: "url(#primaryGradient)" }} />;
  }
  
  return (
    <>
      <svg width={0} height={0}>
        <linearGradient id="primaryGradient" x1={0} y1={0} x2={0} y2={1}>
          <stop offset={0} stopColor="#0A81B2" />
          <stop offset={1} stopColor="#083553" />
        </linearGradient>
      </svg>
      <IconComponent sx={{ fill: "url(#primaryGradient)" }} />
    </>
  );
};

const indicatorTypeIcons = {
  'Terrain': TerrainIcon,
  'LocationOn': LocationOnIcon,
  'BarChart': BarChartIcon,
} as const;

type IndicatorIconName = keyof typeof indicatorTypeIcons;

const IconContainer = styled.div(({ theme }) => `
  display: flex;
  align-items: center;
  gap: ${theme.spacing(1)};
  color: ${theme.palette.primary.darkest};

  .MuiSvgIcon-root[data-testid="LocationOnIcon"] {
    margin-left: -4px;
    margin-right: 4px;
  }
`);

const IndicatorTypeIcon = ({ iconName }: { iconName: string }) => {
  const IconComponent = indicatorTypeIcons[iconName as IndicatorIconName] || TerrainIcon;
  
  return (
    <IconContainer>
      <IconComponent />
    </IconContainer>
  );
};

const YearSelector = styled(ToggleButtonGroup)(({ theme }) => `
  margin-bottom: ${theme.spacing(2)};
  background: ${theme.palette.background.paper};
  border-radius: 24px;
  padding: ${theme.spacing(0.5)};
  width: fit-content;
  border: 1px solid ${theme.palette.divider};
  
  .MuiToggleButton-root {
    border: none;
    border-radius: 20px;
    padding: ${theme.spacing(0.5, 2)};
    text-transform: none;
    font-size: 0.75rem;
    color: ${theme.palette.text.secondary};
    
    &:hover {
      background: ${theme.palette.action.hover};
    }
    
    &.Mui-selected {
      background: ${theme.palette.primary.main};
      color: ${theme.palette.common.white};
      &:hover {
        background: ${theme.palette.primary.dark};
      }
    }
  }
`);

export function IndicatorCard({ indicator }: IndicatorCardProps) {
  const { 
    selectedYears, 
    setSelectedYear,
    selectedIndicator, 
    comparisonIndicator, 
    setSelectedIndicator, 
    isPinned, 
    togglePin 
  } = useIndicator();
  const { municipalityData } = useData();
  const sourceRef = useRef<HTMLDivElement>(null);
  const [isTextTruncated, setIsTextTruncated] = useState(false);

  const isSelected = useMemo(() => 
    selectedIndicator?.id === indicator?.id || comparisonIndicator?.id === indicator?.id,
    [selectedIndicator?.id, comparisonIndicator?.id, indicator?.id]
  );

  const pinned = useMemo(() => 
    isPinned(indicator),
    [isPinned, indicator]
  );

  const isPinningDisabled = useMemo(() => 
    !pinned && selectedIndicator && comparisonIndicator,
    [pinned, selectedIndicator, comparisonIndicator]
  );

  const years = useMemo(() => {
    if (!indicator) return [];
    const uniqueYears = new Set(
      municipalityData
        ?.filter(d => d.id === indicator.id)
        .map(d => d.year.toString())
    );
    return ['all', ...Array.from(uniqueYears)].sort();
  }, [indicator, municipalityData]);

  const handleClick = useCallback(() => {
    if (!pinned) {
      setSelectedIndicator(isSelected ? null : indicator);
    }
  }, [pinned, isSelected, indicator, setSelectedIndicator]);

  const handlePinClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPinningDisabled) {
      togglePin(indicator);
    }
  }, [isPinningDisabled, togglePin, indicator]);

  const handleYearChange = useCallback((
    _event: React.MouseEvent<HTMLElement>,
    newYear: string | null,
  ) => {
    if (newYear !== null && indicator) {
      setSelectedYear(indicator.id, newYear);
    }
  }, [indicator, setSelectedYear]);

  useEffect(() => {
    const element = sourceRef.current;
    if (element) {
      setIsTextTruncated(element.scrollWidth > element.clientWidth);
    }
  }, [indicator?.sourceEn]);

  const tooltipContent = useMemo(() => 
    indicator?.sourceEn || '',
    [indicator?.sourceEn]
  );

  if (!indicator) return null;

  return (
    <CardWrapper 
      onClick={handleClick} 
      className={isSelected ? 'selected' : ''}
    >
      <CardHeader>
        <TitleSection>
          <Box display='flex' alignItems='center' gap={1}>
            <IndicatorTypeIcon iconName={indicator.indicatorTypeIcon} />
            <Typography variant='paragraph' color='text.secondary'>Green transfer</Typography>
            <IconWrapper>
              <GradientIcon iconName={indicator?.iconName || 'HomeIcon'} />
            </IconWrapper>
          </Box>
          <TitleRow>
            <Typography variant="label">
              {indicator?.indicatorNameEn}
            </Typography>
          </TitleRow>
        </TitleSection>
      </CardHeader>
      {isTextTruncated ? (
        <Tooltip title={tooltipContent} placement="right">
          <SourceTextWrapper>
            <SourceText ref={sourceRef} variant='paragraph'>
              {indicator?.sourceEn}
            </SourceText>
          </SourceTextWrapper>
        </Tooltip>
      ) : (
        <SourceTextWrapper>
          <SourceText ref={sourceRef} variant='paragraph'>
            {indicator?.sourceEn}
          </SourceText>
        </SourceTextWrapper>
      )}
      <Box>
        <PinButton
          disableRipple
          onClick={handlePinClick}
          className={`${pinned ? 'pinned' : ''} ${isPinningDisabled ? 'disabled' : ''}`}
          sx={{
            color: pinned ? 'primary.main' : 'primary.darkest',
          }}
        >
          <span className="pin-icon">
            {pinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
          </span>
          <PinText>
            {pinned 
              ? 'Unpin from map' 
              : isPinningDisabled 
                ? 'Maximum pins reached' 
                : 'Pin to map'
            }
          </PinText>
        </PinButton>
        {pinned && (
          <YearSelector
            value={selectedYears[indicator.id] || 'all'}
            exclusive
            onChange={handleYearChange}
            aria-label="Select year"
          >
            {years.map((year) => (
              <ToggleButton key={year} value={year}>
                {year === 'all' ? 'All' : year}
              </ToggleButton>
            ))}
          </YearSelector>
        )}
{/*         <Typography variant="body2" color="text.secondary">
          {indicator?.indicatorNameFi}
        </Typography> */}
      </Box>
    </CardWrapper>
  );
} 
