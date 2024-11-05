import { Box, Typography } from '@mui/material';
import type { IndicatorData } from '@repo/ui/types/indicators';
import styled from '@emotion/styled';

const TooltipContainer = styled.div(({ theme }) => `
  background-color: #fff;
  display: flex;
  flex-direction: row;
  gap: ${theme.spacing(2)};
  padding: ${theme.spacing(1.5)};
  border-radius: ${theme.shape.borderRadius}px;
`);

interface ColorIndicatorProps {
  color: string;
  opacity: number;
}

const ColorIndicator = styled.div<ColorIndicatorProps>(({ color, opacity, theme }) => `
  padding-top: ${theme.spacing(0.5)};
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid ${color};
  background-color: ${color};
  opacity: ${opacity};
`);

const LeftColumn = styled.div(({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(0.5)};
`);

const RightColumn = styled.div(({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(0.5)};
`);

const TooltipDescription = styled(Typography)(({ theme }) => `
  min-width: 220px;
  max-width: 220px;
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  color: ${theme.palette.grey[600]};
`);

interface MunicipalityTooltipProps {
  name: string;
  data?: IndicatorData;
  color?: string;
  opacity?: number;
}

export function MunicipalityTooltip({ 
  name, 
  data, 
  color = '#ccc',
  opacity = 0.8 
}: MunicipalityTooltipProps) {
  return (
    <TooltipContainer>
      <LeftColumn>
        <ColorIndicator color={color} opacity={opacity} />
      </LeftColumn>
      <RightColumn>
        <Box display='flex' flexDirection='row' gap={0.5}>
          <Typography variant="label" fontWeight='medium'>
            {name}
          </Typography>
          {data?.value !== undefined && (
            <Typography variant="label" fontWeight='medium'>
              {data.value} {data.unit || ''}
            </Typography>
          )}
        </Box>
        {data?.descriptionFi && (
          <TooltipDescription variant="paragraph">
            {data.descriptionFi}
          </TooltipDescription>
        )}
      </RightColumn>
    </TooltipContainer>
  );
} 