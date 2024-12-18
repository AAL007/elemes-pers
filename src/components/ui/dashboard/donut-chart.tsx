
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useTheme } from '@mui/material/styles';
import { Grid, Stack, Typography, Avatar } from '@mui/material';
import { IconArrowUpLeft } from '@tabler/icons-react';
import { fetchTotalActiveUser } from "@/app/api/home/dashboard";
import React from "react";
import DashboardCard from "./dashboard-card";
import { useEffect } from "react";

interface DonutChartProps{
  label: string[];
  data: number[];
  numberOfData: number;
  title: string;
}

const DonutChart: React.FC<DonutChartProps> = ({label, data, numberOfData, title}) => {
  // chart color
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const primarylight = '#93b4f9';
  const successlight = theme.palette.success.light;
  const [colors, setColors] = React.useState<any[]>([primary, primarylight, '#bbcffb', '#d6e2fc', '#ebf1ff']);

  // chart
  const optionscolumnchart: any = {
    chart: {
      type: 'donut',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
            enabled: true,
            delay: 150
        },
        dynamicAnimation: {
            enabled: true,
            speed: 350
        }
      },
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: {
        show: false,
      },
      height: 160,
    },
    labels: label,
    colors: colors,
    plotOptions: {
      pie: {
        startAngle: 0,
        endAngle: 360,
        donut: {
          size: '75%',
          background: 'transparent',
        },
      },
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
      fillSeriesColor: false,
    },
    stroke: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    responsive: [
      {
        breakpoint: 991,
        options: {
          chart: {
            width: 120,
          },
        },
      },
    ],
  };
  const seriescolumnchart: any = data;

  return (
    <DashboardCard contentPadding="30px" title={title}>
      <Grid container spacing={3}>
        {/* column */}
        <Grid item xs={7} sm={7}>
          <Typography variant="h3" mt={3.5} fontWeight="700">
            {numberOfData} {title.split(' ')[title.split(' ').length - 1] == 'Attendances' ? 'Sessions' : title.split(' ')[title.split(' ').length - 1]}
          </Typography>
          {/* <Stack direction="row" spacing={1} mt={1} alignItems="center">
            <Avatar sx={{ bgcolor: successlight, width: 27, height: 27 }}>
              <IconArrowUpLeft width={20} color="#39B69A" />
            </Avatar>
            <Typography variant="subtitle2" fontWeight="600">
              +9%
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              last year
            </Typography>
          </Stack> */}
          <Stack spacing={3} mt={7} direction="row">
            {label.map((role, index) => {
              return(
                <Stack key={index} direction="row" spacing={1} alignItems="center">
                  <Avatar
                    sx={{ width: 9, height: 9, bgcolor: colors[index], svg: { display: 'none' } }}
                  ></Avatar>
                  <Typography variant="subtitle2" color="textSecondary">
                    {role}
                  </Typography>
                </Stack>
              )
            })}
          </Stack>
        </Grid>
        {/* column */}
        <Grid item xs={5} sm={5}>
          <Chart
            options={optionscolumnchart}
            series={seriescolumnchart}
            type="donut"
            height={150} width={"120%"}
          />
        </Grid>
      </Grid>
    </DashboardCard>
  );
};

export default DonutChart;
