import styled from '@emotion/styled';
import { Typography, Box } from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import HomeIcon from '@mui/icons-material/Home';
import { useIndicator } from '@/contexts/IndicatorContext';
import type { Indicator } from '@repo/ui/types/indicators';

interface IndicatorCardProps {
  indicator: Indicator;
}

const CardWrapper = styled.div(({ theme }) => `
  background: ${theme.palette.background.paper};
  border: 1px solid ${theme.palette.divider};
  border-radius: ${theme.shape.borderRadius}px;
  padding: ${theme.spacing(2)};
  margin-bottom: ${theme.spacing(2)};
  transition: all 0.2s ease-in-out;

  &:hover {
    border: 1px solid ${theme.palette.secondary.main};
  }
  &.selected {
    border: 2px solid ${theme.palette.secondary.main};
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
  align-items: center;
  gap: ${theme.spacing(1)};
`);

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
`;

const iconComponents = {
  HomeIcon,
  DirectionsBusIcon,
  MapsHomeWorkIcon,
} as const;

type IconName = keyof typeof iconComponents;

const GradientIcon = ({ iconName }: { iconName: string }) => {
  const IconComponent = iconComponents[iconName as IconName];
  
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

export function IndicatorCard({ indicator }: IndicatorCardProps) {
  const { selectedIndicator, setSelectedIndicator } = useIndicator();
  const isSelected = selectedIndicator?.id === indicator?.id;

  const handleClick = () => {
    setSelectedIndicator(isSelected ? null : indicator);
  };

  if (!indicator) return null;

  return (
    <CardWrapper onClick={handleClick} className={isSelected ? 'selected' : ''}>
      <CardHeader>
        <TitleSection>
          <Typography variant="h2">
            {indicator?.indicatorNameEn}
          </Typography>
          <IconWrapper>
            <GradientIcon iconName={indicator?.iconName} />
          </IconWrapper>
        </TitleSection>
      </CardHeader>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {indicator?.indicatorNameFi}
        </Typography>
      </Box>
    </CardWrapper>
  );
} 