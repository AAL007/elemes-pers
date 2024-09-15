import React, { useEffect } from 'react';
import { Select, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardCard from './dashboard-card';
import dynamic from "next/dynamic";
import { fetchLecturerBarChart, fetchStudentsEnrolled } from '@/app/api/home/dashboard';
import { dropdown } from '@nextui-org/react';
import { fetchActivePeriod, fetchLecturerClassCourse, fetchAssessment } from '@/app/api/assignment/assignment-management';
import { SelectList } from '@/app/api/data-model';
import { set } from 'lodash';
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface BarChartProps {
    title: string;
    userId: string;
}

const LecturerBarChart : React.FC<BarChartProps> = ({title, userId}) => {
    // select 
    const [classesDDL, setClassesDDL] = React.useState<string[]>([]);
    const [classes, setClasses] = React.useState<SelectList[]>([]);
    const [coursesDDL, setCoursesDDL] = React.useState<string[]>([]);
    const [courses, setCourses] = React.useState<SelectList[]>([]);
    const [classValue, setClassValue] = React.useState<string>("");
    const [courseValue, setCourseValue] = React.useState<string>("");
    const [academicPeriod, setAcademicPeriod] = React.useState<string>("");
    const [chartLabels, setChartLabels] = React.useState<string[]>([]);
    const [averageScores, setAverageScores] = React.useState<number[]>([]);
    const [categories, setCategories] = React.useState<string[]>([]);
    const [isDataBeingFetched, setIsDataBeingFetched] = React.useState<boolean>(false);

    const fetchData = async () => {
        setIsDataBeingFetched(true);
        let academicPeriodRes = await fetchActivePeriod();
        if(!academicPeriodRes.success){
            alert(academicPeriodRes.message);
            return;
        }
        let academicPeriodId = academicPeriodRes.data[0].Key;
        await setAcademicPeriod(academicPeriodId);

        console.log(academicPeriodId)

        fetchLecturerClassCourse(userId, academicPeriodId).then((object: any) => {
            const classes = object.data.map((z: any) => {
              return {
                key: z.ClassKey,
                label: z.ClassValue,
              }
            })
            const classesDDL = object.data.map((z: any) => z.ClassValue);
            setClassesDDL(classesDDL);
            setClasses(classes);
            setClassValue(classesDDL[0] ?? "");
            const courses = object.data.reduce((acc: any[], z: any) => {
              const key = z.CourseKey;
              if (!acc.some(course => course.key === key)) {
                acc.push({
                  key: z.CourseKey,
                  label: z.CourseValue,
                });
              }
              return acc;
            }, []);
            const coursesDDL = courses.map((z: any) => z.label);
            setCoursesDDL(coursesDDL);
            setCourses(courses);
            setCourseValue(coursesDDL[0] ?? "");
          })
    }

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let courseId = courses.find(x => x.label === courseValue)?.key ?? "";
        let classId = classes.find(x => x.label === classValue)?.key ?? "";
        fetchLecturerBarChart(courseId, classId, academicPeriod).then((object: any) => {
            const chartLabels = object.data.map((z: any) => {
                return `${title} from ${z.studentCount} ${z.studentCount > 1 ? "students" : "student"}`
            })
            const averageScores = object.data.map((z: any) => {
              return z.averageScore
            })
            const categories = object.data.map((z: any) => {
              return z.assessmentName
            })
            setChartLabels(chartLabels);
            setAverageScores(averageScores);
            setCategories(categories);
            setIsDataBeingFetched(false)
        })
    }, [classValue, courseValue])

    const handleChangeClassId = (event: any) => {
        setClassValue(event.target.value);
    };

    const handleChangeCourseId = (event: any) => {
        setCourseValue(event.target.value);
    }

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
            data: averageScores,
        },
    ];

    return (

        <DashboardCard title={title} action={
            <>
                <Select
                    labelId="classes"
                    id="classes"
                    value={classValue}
                    size="small"
                    onChange={handleChangeClassId}
                >
                    {classesDDL.map((x: string) => {
                        return <MenuItem value={x}>{x}</MenuItem>
                    })}
                </Select>
                <Select
                    labelId="courses"
                    id="courses"
                    value={courseValue}
                    size="small"
                    onChange={handleChangeCourseId}
                >
                    {coursesDDL.map((x: string) => {
                        return <MenuItem value={x}>{x}</MenuItem>
                    })}
                </Select>
            </>
        }>
            <Chart
                loading={averageScores.length == 0}
                options={optionscolumnchart}
                series={seriescolumnchart}
                type="bar"
                height={370} width={"100%"}
            />
        </DashboardCard>
    );
};

export default LecturerBarChart;
