import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Text } from 'recharts';
import styled from '@emotion/styled';
import { BarChartData } from '../../types/indicators';
import { DraggablePopup } from './DraggablePopup';
import L from 'leaflet';
import { useState } from 'react';

interface BarChartPopupProps {
  data: BarChartData;
  index: number;
  popupRefs: React.MutableRefObject<(L.Popup | null)[]>;
  dragRefs: React.MutableRefObject<{ isDragging: boolean; startPos: L.Point | null; initialLatLng: L.LatLng | null }[]>;
  color?: string;
  map: L.Map;
}

const PopupContainer = styled(Box)(({ theme }) => `
  background: ${theme.palette.background.paper};
  border-radius: ${theme.shape.borderRadius}px;
  padding: ${theme.spacing(4)};
  width: 450px;
  max-width: 90vw;

  @media (max-width: 600px) {
    padding: ${theme.spacing(2)};
    width: 100%;
    max-width: calc(100vw - 48px);
    min-width: 330px;
  }
`);

const ChartContainer = styled(Box)(({ theme }) => `
  width: 100%;
  height: 260px;
  padding: 8px 0;

  @media (max-width: 600px) {
    height: 250px;
    padding: 4px
    min-width: 280px;
  }

  .recharts-wrapper {
    @media (max-width: 600px) {
      font-size: 11px;
    }
  }

  .recharts-tooltip-wrapper {
    @media (max-width: 600px) {
      font-size: 12px;
    }
  }
`);

const Title = styled(Typography)(({ theme }) => `
  @media (max-width: 600px) {
    font-size: 1rem;
    margin-bottom: ${theme.spacing(1)};
  }
`);

const CustomXAxisTick = ({ x, y, payload, isMobile }: any) => {
  if (payload && payload.value) {
    return (
      <Text
        x={x}
        y={y}
        fontSize={11}
        width={150}
        textAnchor="end"
        verticalAnchor="start"
        angle={-50}
        style={{ whiteSpace: 'nowrap' }}
      >
        {payload.value}
      </Text>
    );
  }
  return null;
};

export function BarChartPopup({
  data,
  index,
  popupRefs,
  dragRefs,
  map,
  color = '#8884d8'
}: BarChartPopupProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.values[index],
    nameFi: data.labelsFi[index]
  }));

  return (
    <DraggablePopup
      index={index}
      popupRefs={popupRefs}
      dragRefs={dragRefs}
      map={map}
    >
      <PopupContainer>
        <Title
          variant="h6"
          gutterBottom
          color='primary.darkest'
        >
          {data.municipalityName}
        </Title>
        <ChartContainer>
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              margin={isMobile ? {
                top: 5,
                right: 5,
                left: 5,
                bottom: 20
              } : {
                top: 10,
                right: 10,
                left: 10,
                bottom: 20
              }}
            >
              <XAxis
                dataKey="name"
                tick={<CustomXAxisTick isMobile={isMobile} />}
                tickFormatter={(value) => value.replace(/\s+/g, ' ')}
                interval={0}
                height={isMobile ? 70 : 80}
                tickMargin={isMobile ? 5 : 10}
              />
              <YAxis
                tick={{ fontSize: isMobile ? 10 : 11 }}
                width={isMobile ? 30 : 45}
                label={{
                  value: data.unit,
                  angle: -90,
                  position: 'insideLeft',
                  style: {
                    textAnchor: 'middle',
                    fontSize: isMobile ? 11 : 12
                  },
                  offset: isMobile ? -1 : -5
                }}
              />
              <Tooltip
                cursor={false}
                formatter={(value: number) => [`${value} ${data.unit}`, data.indicatorNameEn]}
                contentStyle={isMobile ? {
                  fontSize: '10px',
                  padding: '4px 8px'
                } : undefined}
              />
              <Bar
                dataKey="value"
                fill={color}
                radius={[4, 4, 0, 0]}
                maxBarSize={isMobile ? 30 : 40}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </PopupContainer>
    </DraggablePopup>
  );
} 