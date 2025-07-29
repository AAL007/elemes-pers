'use client'
import * as React from "react";
import { useEffect } from "react";
import "@/components/ui/component.css"
import PageContainer from "@/components/ui/container/page-container";
import { Box, Grid } from "@mui/material";
import { Card, CardHeader, CardBody, CardFooter, Progress, Image, Button } from "@nextui-org/react";
import { fetchCourseList, fetchLecturerCourseList } from "@/app/api/course/course-list";
import { Select, SelectItem } from "@nextui-org/react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import Loading from "../../loading";

const dropdownList = [
    {key: "2024-10", value: "2024 Odd Period"},
    {key: "2024-20", value: "2024 Even Period"},
    {key: "2025-10", value: "2025 Odd Period"},
    {key: "2025-20", value: "2025 Even Period"},
    {key: "2026-10", value: "2026 Odd Period"},
]

type CourseResponse = {
    id: string;
    classId: string;
    className: string;
    courseName: string;
    courseImage: string;
    progress: number;
}

const courseList = () => {
    const userData = useSelector((state: RootState) => state.user);
    const [touched, setTouched] = React.useState(false);
    const [academicPeriod, setAcademicPeriod] = React.useState(dropdownList[0].key);
    const [courseList, setCourseList] = React.useState<CourseResponse[]>([]);
    const [loading, setLoading] = React.useState(true);

    const handleRedirect = (courseId: string, classId: string) => {
        window.location.href = userData.role == "Student" ? `/course/${courseId}/${classId}` : `/course/lecturer-course/${courseId}/${classId}`;
    }

    const fetchCourseLists = async () => {
        setCourseList([]);
        const res = userData.role == "Student"  ? await fetchCourseList(userData.id, academicPeriod) : await fetchLecturerCourseList(userData.id, academicPeriod);
        if(!res.success){
            alert(res.message);
            setLoading(false);
            return;
        }

        const courseList = res.data.map((z: any, index: number) => {
            return {
                id: z.courseId,
                classId: z.classId,
                className: z.className,
                courseName: z.courseName,
                courseImage: z.courseImage,
                progress: z.progress
            }
        })
        setCourseList(courseList);
        setLoading(false);
    }
    
    useEffect(() => {
        setLoading(true);
        fetchCourseLists();
    }, [academicPeriod])

    return (
        <PageContainer title="Course List" description="LIst of course enrolled by student">
            <Box component="div">
                <Select
                    required
                    label="Academic Period"
                    variant="bordered"
                    placeholder="Select Academic Period"
                    errorMessage={(touched && (academicPeriod == "")) ? "Please select academic period" : ""}
                    isInvalid={((academicPeriod == "") && touched) ? true: false}
                    className={`lg:w-1/3 xl:w-1/3 2xl:w-1/3 w-1/2 mb-5`}
                    selectedKeys={[academicPeriod]}
                    onClick={async() => {}}
                    onChange={(e) => {setAcademicPeriod(e.target.value)}}
                    onClose={() => setTouched(true)}
                    value={academicPeriod}
                >
                    {dropdownList.map((item) => (
                        <SelectItem key={item.key}>{item.value}</SelectItem>
                    ))}
                </Select>
                {(courseList.length == 0 && !loading) ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '75vh' }}>
                        <h1 className="text-center text-lg">No course available</h1>
                    </div>
                ) : (courseList.length == 0 && loading) ? (
                    <>
                        <Loading />
                    </>
                ) : (
                    <Grid container spacing={3}>
                        {courseList.map((course) => (
                            <Grid item xs={12} lg={4} key={course.id}>
                                <Card shadow="sm" key={course.id}>
                                    <CardBody className="overflow-visible p-0">
                                        <Image shadow="sm" radius="none" className="w-full object-cover h-[300px]" src={course.courseImage} alt="course-img"/>
                                    </CardBody>
                                    {userData.role == "Student" && (
                                        <div className="relative w-full">
                                            <Progress size="sm" className="w-full absolute top-0" value={course.progress} />
                                        </div>
                                    )}
                                    <CardFooter className="flex flex-col px-4 py-4 items-center text-small">
                                        <div className="flex w-full mt-3 justify-start">
                                            <h5 className="font-semibold" style={{ fontSize: '16px' }}>{course.className}</h5>
                                        </div>
                                        <div className="flex w-full mt-2 justify-start">
                                            <h1 className="font-bold" style={{ fontSize: "24px" }}>{course.courseName}</h1>
                                        </div>
                                        <div className="flex w-full mb-2 justify-center mt-5">
                                            <Button onClick={() => handleRedirect(course.id, course.classId)} size="md" radius="sm" className="w-full bg-blue-100 text-blue-600">{course.progress > 0 ? 'Continue' : 'Start'}</Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}    
            </Box>
        </PageContainer>
    )
}

export default courseList;