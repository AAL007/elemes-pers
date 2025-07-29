import React, { useEffect } from 'react';
import { Select, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardCard from './dashboard-card';
import dynamic from "next/dynamic";
import { fetchStudentsEnrolled } from '@/app/api/home/dashboard';
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface BarChartProps {
    title: string;
}

const AdministratorBarChart : React.FC<BarChartProps> = ({title}) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const monthNames = [
        "January", "February", "March", "April", "May", "June", "July",
        "August", "September", "October", "November", "December"
    ];
    const generateMonthDDL = () => {
        const distinctMonths: string[] = [];
  
        for (let year = currentYear - 2; year <= currentYear; year++) {
          for (let month = 0; month < 12; month++) {
            const monthName = `${monthNames[month]} ${year}`;
            distinctMonths.push(monthName);
          }
        }

        let currentMonthName = `${monthNames[currentMonth]} ${currentYear}`;
        // console.log(currentMonthName)
        setMonth(currentMonthName);
        setMonthDDL(distinctMonths);
    }

    const fetchData = async () => {
        setIsDataBeingFetched(true);
        let month_input = monthNames.findIndex(x => x == month.split(" ")[0]) + 1
        let year_input = parseInt(month.split(" ")[1])

        const res = await fetchStudentsEnrolled(month_input, year_input);
        if (!res.success) {
            // console.log(res.message);
            alert(res.message);
            return;
        }
        // console.log(res.data)
        let totalEnrolledStudents = res.data.map((z: any) => {
            return z.StudentCount
        })
        let dateCategories = res.data.map((z: any) => {
            return z.EnrolledDate
        })
        setTotalEnrolledstudents(totalEnrolledStudents);
        setDateCategories(dateCategories);
        setIsDataBeingFetched(false);
    }

    const [dropdownList, setMonthDDL] = React.useState<string[]>([]);
    const [month, setMonth] = React.useState(`${monthNames[currentMonth]} ${currentYear}`);
    const [totalEnrolledStudents, setTotalEnrolledstudents] = React.useState<number[]>([]);
    const [dateCategories, setDateCategories] = React.useState<string[]>([]);
    const [isDataBeingFetched, setIsDataBeingFetched] = React.useState<boolean>(false);

    useEffect(() => {
        generateMonthDDL();
        fetchData();
    }, []);

    useEffect(() => {
        fetchData();
    }, [month])

    const handleChange = (event: any) => {
        setMonth(event.target.value);
    };

    // chart color
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const secondary = theme.palette.secondary.main;

    // chart
    const optionscolumnchart: any = {
        chart: {
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
            type: 'bar',
            fontFamily: "'Plus Jakarta Sans', sans-serif;",
            foreColor: '#adb0bb',
            toolbar: {
                show: true,
            },
            height: 370,
        },
        noData: {  
            text: isDataBeingFetched ? "Loading...":"No Data present in the graph!",  
            align: 'center',  
            verticalAlign: 'middle',  
            offsetX: 0,  
            offsetY: 0,  
            style: {  
              color: "#000000",  
              fontSize: '14px',  
              fontFamily: "Helvetica"  
            }  
        },
        colors: [primary, secondary],
        plotOptions: {
            bar: {
                horizontal: false,
                barHeight: '60%',
                columnWidth: '42%',
                borderRadius: [6],
                borderRadiusApplication: 'end',
                borderRadiusWhenStacked: 'all',
            },
        },

        stroke: {
            show: true,
            width: 5,
            lineCap: "butt",
            colors: ["transparent"],
          },
        dataLabels: {
            enabled: false,
        },
        legend: {
            show: false,
        },
        grid: {
            borderColor: 'rgba(0,0,0,0.1)',
            strokeDashArray: 3,
            xaxis: {
                lines: {
                    show: false,
                },
            },
        },
        yaxis: {
            tickAmount: 4,
        },
        xaxis: {
            categories: dateCategories,
            axisBorder: {
                show: false,
            },
        },
        tooltip: {
            theme: 'dark',
            fillSeriesColor: false,
        },
    };
    const seriescolumnchart: any = [
        {
            name: title,
            data: totalEnrolledStudents,
        },
    ];

    return (

        <DashboardCard contentPadding='30px' title={title} action={
            <Select
                labelId="month-dd"
                id="month-dd"
                value={month}
                size="small"
                onChange={handleChange}
            >
                {dropdownList.map((x: string) => {
                    return <MenuItem value={x}>{x}</MenuItem>
                })}
            </Select>
        }>
            <Chart
                loading={totalEnrolledStudents.length == 0}
                options={optionscolumnchart}
                series={seriescolumnchart}
                type="bar"
                height={370} width={"100%"}
            />
        </DashboardCard>
    );
};

export default AdministratorBarChart;
