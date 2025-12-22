import styled from '@emotion/styled';
import { Typography, Box, Tooltip, ToggleButtonGroup, ToggleButton } from '@mui/material';
import Co2 from '@mui/icons-material/Co2';
import Recycling from '@mui/icons-material/Recycling';
import DirectionsBus from '@mui/icons-material/DirectionsBus';
import TerrainIcon from '@mui/icons-material/Terrain';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BarChartIcon from '@mui/icons-material/BarChart';
import MapsHomeWork from '@mui/icons-material/MapsHomeWork';
import ForestIcon from '@mui/icons-material/Forest';
import Home from '@mui/icons-material/Home';
import SolarPower from '@mui/icons-material/SolarPower';
import WaterDrop from '@mui/icons-material/WaterDrop';
import EnergySavingsLeaf from '@mui/icons-material/EnergySavingsLeaf';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import Agriculture from '@mui/icons-material/Agriculture';
import Thermostat from '@mui/icons-material/Thermostat';
import Water from '@mui/icons-material/Water';
import AirIcon from '@mui/icons-material/Air';
import { useIndicator } from '@/contexts/IndicatorContext';
import { IndicatorType, type Indicator } from '@repo/ui/types/indicators';
import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useData } from '@/contexts/DataContext';
import ElectricalServices from '@mui/icons-material/ElectricalServices';
import Groups from '@mui/icons-material/Groups';
import LocalGasStation from '@mui/icons-material/LocalGasStation';
import EvStation from '@mui/icons-material/EvStation';
import DryCleaning from '@mui/icons-material/DryCleaning';
import ShoppingBag from '@mui/icons-material/ShoppingBag';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { trackEvent } from '@/utils/analytics';
import { useTheme } from '@emotion/react';

interface IndicatorCardProps {
  indicator: Indicator;
}

const CardWrapper = styled.div(({ theme }) => `
  background: ${theme.palette.background.paper};
  border: 1px solid ${theme.palette.divider};
  border-radius: ${theme.shape.borderRadius}px;
  padding: ${theme.spacing(1, 2)};
  margin-bottom: ${theme.spacing(1)};
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

const PinButton = styled.div(({ theme }) => `
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0;
  border-radius: ${theme.shape.borderRadius}px;
  margin-left: -1;
  width: 100%;
  color: ${theme.palette.primary.darkest};
  transition: color 0.2s ease;

  &:hover {
    color: #dd7c00;
    
    .pin-icon, ${PinText} {
      color: #dd7c00;
    }
  }
  
  &.pinned {
    color: #dd7c00;
    
    .pin-icon {
      position: relative;
      top: -1px;
      transform: rotate(-45deg);
    }
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    .MuiTypography-root {
      color: ${theme.palette.text.disabled};
    }
  }
`);

const PinButtonContent = styled.button(({ theme }) => `
  display: flex;
  align-items: center;
  gap: ${theme.spacing(1)};
  background: none;
  border: none;
  padding: 0;
  margin: ${theme.spacing(2, 1, 3, 0)};
  cursor: pointer;
  color: inherit;
  text-align: left;
  
  &:focus-visible {
    outline: none;
    padding: ${theme.spacing(0, 1)};
    margin: ${theme.spacing(2, 0, 3, -1)};
    box-shadow: 0 0 0 1px ${theme.palette.primary.main};
    border-radius: ${theme.shape.borderRadius}px;
    background-color: ${theme.palette.action.hover};
  }
  
  .pin-icon {
    transition: transform 0.2s ease-in-out;
  }

  &:disabled {
    cursor: not-allowed;
  }
`);

const PinText = styled(Typography)`
  font-size: 0.75rem;
  color: inherit;
  transition: font-weight 0.1s ease-in-out;

  &.pinned {
    font-weight: 800;
  }
`;

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
  'Forest': ForestIcon,
  'Home': Home,
  'SolarPower': SolarPower,
  'EnergySavingsLeaf': EnergySavingsLeaf,
  'WindPower': AirIcon,
  'Water': Water,
  'Thermostat': Thermostat,
  'Agriculture': Agriculture,
  'ShoppingBag': ShoppingBag,
  'WaterDrop': WaterDrop,
  'Co2': Co2,
  'Recycling': Recycling,
  'Groups': Groups,
  'ElectricalServices': ElectricalServices,
  'DryCleaning': DryCleaning,
  'LocalGasStation': LocalGasStation,
  'EvStation': EvStation,
  'HomeIcon': Home,  // Fallback for HomeIcon
} as const;

type IconName = keyof typeof iconComponents;

const lightenColor = (color: string, amount: number = 0.3): string => {
  // Remove the '#' and split into RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Lighten each component
  const lightR = Math.min(Math.round(r + (255 - r) * amount), 255);
  const lightG = Math.min(Math.round(g + (255 - g) * amount), 255);
  const lightB = Math.min(Math.round(b + (255 - b) * amount), 255);

  // Convert back to hex
  return `#${lightR.toString(16).padStart(2, '0')}${lightG.toString(16).padStart(2, '0')}${lightB.toString(16).padStart(2, '0')}`;
};

const GradientIcon = ({ iconName, color = '#083553' }: { iconName: string; color?: string }) => {
  const cleanIconName = iconName.replace(/Icon$/, '') as IconName;
  const IconComponent = iconComponents[cleanIconName] || iconComponents.Home;

  // Removetabs and extra spaces
  const cleanColor = color.trim().replace(/\t/g, '');
  const startColor = lightenColor(cleanColor);
  const endColor = cleanColor;

  return (
    <>
      <svg width={0} height={0}>
        <linearGradient id={`gradient-${cleanColor}`} x1={0} y1={0} x2={0} y2={1}>
          <stop offset={0} stopColor={startColor} />
          <stop offset={1} stopColor={endColor} />
        </linearGradient>
      </svg>
      <IconComponent sx={{ fill: `url(#gradient-${cleanColor})` }} />
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
  margin-bottom: ${theme.spacing(1)};
  background: ${theme.palette.background.paper};
  border-radius: 24px;
  padding: ${theme.spacing(0)};
  width: fit-content;
  border: 1px solid ${theme.palette.divider};
  
  
  .MuiToggleButton-root {
    border: none;
    border-radius: 20px;
    padding: ${theme.spacing(0.6, 1.7)};
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

export const IndicatorCard = ({ indicator }: IndicatorCardProps): React.ReactNode => {
  const {
    selectedIndicator,
    setSelectedIndicator,
    isPinned,
    togglePin,
    setPinnedIndicatorYear,
  } = useIndicator();
  const { municipalityData, barChartData } = useData();
  const sourceRef = useRef<HTMLDivElement>(null);
  const [isTextTruncated, setIsTextTruncated] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const { t } = useTranslation();
  // currentLanguage is used in JSX for conditional rendering
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const { currentLanguage } = useLanguage();

  const theme = useTheme();

  const isSelected = useMemo(() =>
    selectedIndicator?.id === indicator?.id,
    [selectedIndicator?.id, indicator?.id]
  );

  const pinned: boolean = useMemo(() =>
    isPinned(indicator),
    [isPinned, indicator]
  );

  const isPinningDisabled = false;

  const years = useMemo(() => {
    if (!indicator) return [];
    if (indicator.indicatorType !== IndicatorType.MunicipalityLevel &&
      indicator.indicatorType !== IndicatorType.BarChart) return [];

    //Data source based on indicator type
    const data = indicator.indicatorType === IndicatorType.MunicipalityLevel
      ? municipalityData
      : barChartData;

    const uniqueYears = new Set(
      data
        ?.filter(d => d.id === indicator.id)
        .map(d => d.year.toString())
    );

    const availableYears = Array.from(uniqueYears)
      .sort((a, b) => parseInt(b) - parseInt(a));  // Sort descending

    return availableYears;
  }, [indicator, municipalityData, barChartData]);

  useEffect(() => {
    if (isSelected && years.length > 0) {
      // If no year is selected yet, set the default year
      if (!selectedYear) {
        const defaultYear = years[0];
        setSelectedYear(defaultYear);
        if (!pinned) {
          setSelectedIndicator({
            ...indicator,
            selectedYear: parseInt(defaultYear)
          });
        }
      } else {
        // Maintain the currently selected year
        if (!pinned) {
          setSelectedIndicator({
            ...indicator,
            selectedYear: parseInt(selectedYear)
          });
        }
      }
    }
  }, [isSelected, years, selectedYear, indicator, setSelectedIndicator, pinned]);

  const handleClick = useCallback(() => {
    if (pinned) {
      return;
    }
    setSelectedIndicator(isSelected ? null : indicator);
    trackEvent({
      category: 'Indicator',
      action: 'select',
      label: `${indicator.id} - ${indicator.indicatorNameFi}`
    });
  }, [isSelected, indicator, setSelectedIndicator, pinned]);

  const handlePinClick = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    togglePin(indicator);
  }, [togglePin, indicator]);

  const handleYearChange = useCallback((
    event: React.MouseEvent<HTMLElement> | null,
    newYear: string | null
  ) => {
    setSelectedYear(newYear);

    // For pinned indicators, only update the pinned year
    if (pinned) {
      const yearValue = newYear ? parseInt(newYear) : undefined;
      setPinnedIndicatorYear(yearValue);

      // If this indicator is also selected, update its year too
      if (isSelected) {
        setSelectedIndicator({
          ...indicator,
          selectedYear: yearValue
        });
      }
      return;
    }

    // For non-pinned indicators
    if (isSelected) {
      setSelectedIndicator(null);
      setTimeout(() => {
        setSelectedIndicator({
          ...indicator,
          selectedYear: newYear ? parseInt(newYear) : undefined
        });
      }, 0);
    }
  }, [isSelected, pinned, indicator, setSelectedIndicator, setPinnedIndicatorYear]);

  // Separate keyboard handler that calls handleYearChange
  const handleYearKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>, year: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleYearChange(null, year);
    }
  }, [handleYearChange]);

  useEffect(() => {
    const element = sourceRef.current;
    if (element) {
      setIsTextTruncated(element.scrollWidth > element.clientWidth);
    }
  }, [indicator?.sourceEn, indicator?.sourceFi]);

  if (!indicator) return null;
  return (
    <CardWrapper
      onClick={handleClick}
      className={isSelected ? 'selected' : ''}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${currentLanguage === 'fi' ? indicator.indicatorNameFi : indicator.indicatorNameEn} indicator card`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <CardHeader theme={theme}>
        <TitleSection>
          <Box display='flex' alignItems='center' gap={1}>
            <IndicatorTypeIcon iconName={indicator.indicatorTypeIcon} />
            <Typography variant='paragraph' color='text.secondary'>
              {indicator.category === 'Green' ? t('indicators.greenTransition') : ''}
            </Typography>
            <IconWrapper>
              <GradientIcon color={indicator?.color || '#083553'} iconName={indicator?.iconName || 'HomeIcon'} />
            </IconWrapper>
          </Box>
          <TitleRow>
            <Typography variant="h6" component="span">
              {currentLanguage === 'fi' ? indicator.indicatorNameFi : indicator.indicatorNameEn}
            </Typography>
          </TitleRow>
        </TitleSection>
      </CardHeader>
      {isTextTruncated ? (
        <Tooltip
          title={currentLanguage === 'fi' ? indicator.sourceFi : indicator.sourceEn}
          placement="right"
        >
          <SourceTextWrapper>
            <SourceText ref={sourceRef} variant='paragraph'>
              {currentLanguage === 'fi' ? indicator.sourceFi : indicator.sourceEn}
            </SourceText>
          </SourceTextWrapper>
        </Tooltip>
      ) : (
        <SourceTextWrapper>
          <SourceText ref={sourceRef} variant='paragraph'>
            {currentLanguage === 'fi' ? indicator.sourceFi : indicator.sourceEn}
          </SourceText>
        </SourceTextWrapper>
      )}
      <Box>
        <PinButton className={`${pinned ? 'pinned' : ''} ${isPinningDisabled ? 'disabled' : ''}`}>
          <PinButtonContent
            onClick={handlePinClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handlePinClick(e);
              }
            }}
            disabled={isPinningDisabled}
            aria-label={pinned ? t('indicators.unpinFromMap') : t('indicators.pinToMap')}
            style={{
              color: pinned ? 'var(--mui-palette-primary-main)' : 'var(--mui-palette-primary-darkest)',
            }}
            tabIndex={0}
          >
            <span className="pin-icon" aria-hidden="true">
              {pinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
            </span>
            <PinText className={pinned ? 'pinned' : ''}>
              {pinned
                ? t('indicators.unpinFromMap')
                : isPinningDisabled
                  ? t('indicators.maxPinsReached')
                  : t('indicators.pinToMap')
              }
            </PinText>
          </PinButtonContent>
        </PinButton>
        {(indicator.indicatorType === IndicatorType.MunicipalityLevel ||
          indicator.indicatorType === IndicatorType.BarChart) && years.length > 0 && (
            <YearSelector
              value={selectedYear}
              exclusive
              onChange={handleYearChange}
              aria-label={t('indicators.selectYear', {
                indicator: currentLanguage === 'fi' ? indicator.indicatorNameFi : indicator.indicatorNameEn
              })}
            >
              {years.map((year) => (
                <ToggleButton
                  key={year}
                  value={year}
                  onKeyDown={(e) => handleYearKeyDown(e, year)}
                  aria-label={t('indicators.yearButton', { year })}
                >
                  {year}
                </ToggleButton>
              ))}
            </YearSelector>
          )}
      </Box>
    </CardWrapper>
  );
} 
