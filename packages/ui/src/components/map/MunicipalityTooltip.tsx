import { Box, Typography } from '@mui/material';
import type { IndicatorData, MunicipalityLevelData } from '@repo/ui/types/indicators';
import styled from '@emotion/styled';
import { DraggablePopup } from './DraggablePopup';
import L from 'leaflet';

const TooltipContainer = styled.div(({ theme }) => `
  background-color: #fff;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${theme.spacing(1)};
  padding: ${theme.spacing(1.5)};
  border-radius: ${theme.shape.borderRadius}px;
`);

interface ColorIndicatorProps {
  color: string;
  opacity: number;
}

const ColorIndicator = styled.div<ColorIndicatorProps>(({ color, opacity, theme }) => `
  padding-top: ${theme.spacing(0.5)};
  width: 32px;
  height: 32px;
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
  min-width: 250px;
  max-width: 250px;
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
  index: number;
  popupRefs: React.MutableRefObject<(L.Popup | null)[]>;
  dragRefs: React.MutableRefObject<{ isDragging: boolean; startPos: L.Point | null; initialLatLng: L.LatLng | null }[]>;
  map: L.Map;
}

export function MunicipalityTooltip({
  name,
  data,
  color = '#ccc',
  opacity = 0.8,
  index,
  popupRefs,
  dragRefs,
  map
}: MunicipalityTooltipProps) {
  const isMunicipalityData = (data: IndicatorData | undefined): data is MunicipalityLevelData => {
    return data !== undefined && 'value' in data;
  };

  return (
    <DraggablePopup
      index={index}
      popupRefs={popupRefs}
      dragRefs={dragRefs}
      map={map}
    >
      <TooltipContainer>
        <LeftColumn>
          <ColorIndicator color={color} opacity={opacity} />
        </LeftColumn>
        <RightColumn>
          <Box display='flex' flexDirection='row' gap={0.4}>
            <Typography variant="lead">
              {name}
            </Typography>
            {isMunicipalityData(data) && (
              <Box display="flex" flexDirection="row" gap={0.5} alignItems="baseline">
                <Typography variant="lead">
                  {data.value}
                </Typography>
                {data.unit && (
                  <Typography
                    variant="lead"
                    noWrap
                    sx={{
                      maxWidth: '100px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {data.unit}
                  </Typography>
                )}
              </Box>
            )}

          </Box>
          {data?.descriptionFi && (
            <TooltipDescription variant="paragraph">
              {data.descriptionFi}
            </TooltipDescription>
          )}
        </RightColumn>
      </TooltipContainer>
    </DraggablePopup>
  );
} 