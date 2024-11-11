import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import styled from '@emotion/styled';
import { BarChartData } from '../../types/indicators';

interface BarChartPopupProps {
  data: BarChartData;
}

const PopupContainer = styled(Box)(({ theme }) => `
  background: ${theme.palette.background.paper};
  border-radius: ${theme.shape.borderRadius}px;
  padding: ${theme.spacing(2)};
  width: 450px;
  max-width: 90vw;
`);

const ChartContainer = styled(Box)`
  width: 100%;
  height: 300px;
  margin: 0 -16px;
  padding: 8px 0;
`;

export function BarChartPopup({ data }: BarChartPopupProps) {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.values[index],
    nameFi: data.labelsFi[index]
  }));

  return (
    <PopupContainer>
      <Typography variant="h6" gutterBottom>
        {data.municipalityName}
      </Typography>
      <ChartContainer>
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 10,
              bottom: 20
            }}
          >
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{
                value: data.unit,
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip
              formatter={(value: number) => [`${value} ${data.unit}`, data.indicatorNameEn]}
            />
            <Bar
              dataKey="value"
              fill="#8884d8"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </PopupContainer>
  );
} 