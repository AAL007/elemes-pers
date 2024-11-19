import React, { useEffect } from 'react';
import { Select, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardCard from './dashboard-card';
import dynamic from "next/dynamic";
import { fetchStudentsEnrolled } from '@/app/api/home/dashboard';
import { fetchStudentCourses, fetchStudentScoreByCourse } from '@/app/api/home/dashboard';
import { SelectList } from '@/app/api/data-model';
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface BarChartProps {
    title: string;
    userId: string;
    setCourseId: (courseId: string) => void;
}

const StudentBarChart : React.FC<BarChartProps> = ({title, userId, setCourseId}) => {
    const [courses, setCourses] = React.useState<SelectList[]>([]);
    const [courseDDL, setCourseDDL] = React.useState<string[]>([]);
    const [courseValue, setCourseValue] = React.useState<string>("");
    const [categories, setCategories] = React.useState<string[]>([]);
    const [isDataBeingFetched, setIsDataBeingFetched] = React.useState<boolean>(false);
    const [scores, setScores] = React.useState<number[]>([]);

    const fetchingStudentCourses = async () => {
        const res = await fetchStudentCourses(userId)
        if (!res.success) {
            alert(res.message);
            return;
        }
        const courses = res.data.map((z: any) => {
            return {
                key: z.courseId,
                label: z.courseName,
            }
        })
        setCourses(courses);
        setCourseDDL(courses.map((z: any) => z.label));
        setCourseValue(courses[0].label ?? "");
        setCourseId(courses[0].key ?? "");
    }

    const handleCourseChange = (e: any) => {
        const courseId = courses.find((x: any) => x.label == e.target.value)?.key;
        setCourseId(courseId ?? "");
        setCourseValue(e.target.value);
    }

    const fetchingStudentScoreByCourse = async () => {
        const courseId = courses.find((x: any) => x.label == courseValue)?.key;
        const res = await fetchStudentScoreByCourse(userId, courseId ?? "")
        if (!res.success) {
            alert(res.message);
            return;
        }
        const sessionNumber = res.data.map((z: any) => `Session ${z.sessionNumber}`);
        const score = res.data.map((z: any) => z.score);
        setCategories(sessionNumber);
        setScores(score);
    }

    useEffect(() => {
        setIsDataBeingFetched(true);
        fetchingStudentCourses();
        setIsDataBeingFetched(false);
    }, []);

    useEffect(() => {
        if(courseValue == "") return;
        setIsDataBeingFetched(true);
        fetchingStudentCourses();
        fetchingStudentScoreByCourse();
        setIsDataBeingFetched(false);
    }, [courseValue])

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
            min: 0, 
            max: 100
        },
        xaxis: {
            categories: categories,
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
            data: scores,
        },
        // {
        //     name: 'Expense this month',
        //     data: [280, 250, 325, 215, 250, 310, 280, 250],
        // },
    ];

    return (

        <DashboardCard contentPadding='30px' title={title} action={
            <Select
                labelId="courses"
                id="courses"
                value={courseValue}
                size="small"
                onChange={(e) => handleCourseChange(e)}
            >
                {courseDDL.map((x: string) => {
                    return <MenuItem value={x}>{x}</MenuItem>
                })}
            </Select>
        }>
            <Chart
                loading={scores.length == 0}
                options={optionscolumnchart}
                series={seriescolumnchart}
                type="bar"
                height={415} width={"100%"}
            />
        </DashboardCard>
    );
};

export default StudentBarChart;
