import { Box, Typography } from '@mui/material';
import type { IndicatorData } from '@repo/ui/types/indicators';
import styled from '@emotion/styled';

const TooltipContainer = styled.div(({ theme }) => `
  background-color: #fff;
  min-width: 200px;
  border-radius: ${theme.shape.borderRadius}px;
  box-shadow: ${theme.shadows[3]};
`);

interface MunicipalityTooltipProps {
  name: string;
  data?: IndicatorData;
}

export function MunicipalityTooltip({ name, data }: MunicipalityTooltipProps) {
  return (
    <TooltipContainer>
      <Box>
        <Typography variant="subtitle1" fontWeight="bold" color="text.secondary" gutterBottom>
          {name}
        </Typography>
        {data?.value !== undefined && (
          <Typography variant="body1" fontWeight="medium">
            {data.value} {data.unit || ''}
          </Typography>
        )}
        {data?.descriptionFi && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {data.descriptionFi}
          </Typography>
        )}
      </Box>
    </TooltipContainer>
  );
} 