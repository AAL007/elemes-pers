'use client'
import { Grid, Box } from '@mui/material';
import PageContainer from '@/components/ui/container/page-container';
// components
import BarChart from '@/components/ui/dashboard/administrator-bar-chart';
import DonutChart from '@/components/ui/dashboard/donut-chart';
import RecentActivities from '@/components/ui/dashboard/recent-activities';
import AdministratorToDoList from '@/components/ui/dashboard/administrator-to-do-list';
import LecturerToDoList from '@/components/ui/dashboard/lecturer-to-do-list';
// import AreaChart from '@/components/ui/dashboard/area-chart';
import React, { useEffect, useState } from 'react';
import { 
  fetchTotalActiveUser, 
  fetchTotalActiveClass, 
  fetchCompletedCourse,
  fetchAttendanceStatus,
  fetchStudentsEnrolled, 
  fetchStudentRecentActivity,
  fetchAdministratorRecentActivities, 
  fetchActiveClassStudents, 
  fetchActiveAssignmentClass, 
  fetchLecturerRecentActivity,
  fetchLearningStyle, 
} from '@/app/api/home/dashboard';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { loadUserFromStorage } from "@/lib/user-slice";
import AdministratorBarChart from '@/components/ui/dashboard/administrator-bar-chart';
import LecturerBarChart from '@/components/ui/dashboard/lecturer-bar-chart';
import StudentBarChart from '@/components/ui/dashboard/student-bar-chart';
import Loading from './loading';
import LearningStyleQuestionnaire from '@/components/ui/learning-style-questionnaire';

const Dashboard = () => {
  const [countsActiveUser, setCountsActiveUser] = useState<number[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [totalActiveUsers, setTotalActiveUsers] = useState<number>(0);
  const [countsActiveClass, setCountsActiveClass] = useState<number[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [totalActiveClasses, setTotalActiveClasses] = useState<number>(0);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLearningStyleNotExist, setIsLearningStyleNotExist] = useState(false);
  const [courseId, setCourseId] = useState<string>("");

  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);

  const fetchingAttendanceStatus = async () => {
    const res = await fetchAttendanceStatus(userData.id, courseId);
    if (!res.success) {
      alert(res.message);
      return;
    }
    let classes = ['Present', 'Absent', 'Not Started'];
    setClasses(classes)
    let countPresent = res.data.filter((x: any) => x.attendanceStatus == 'Present').length;
    let countAbsent = res.data.filter((x: any) => x.attendanceStatus == 'Absent').length;
    let countNotStarted = res.data.filter((x: any) => x.attendanceStatus == 'Not Started').length;
    setCountsActiveClass([countPresent, countAbsent, countNotStarted]);
    setTotalActiveClasses(res.data.length);
  }

  useEffect(() => {
    const initialize = async () => {
      dispatch(loadUserFromStorage());

      if(userData.role == "Administrator"){
        const fetchActiveUser = async () => {
          const res = await fetchTotalActiveUser();
          if (!res.success) {
            alert(res.message);
            return;
          }
  
          let roles = res.data.map((x: any) => x.RoleName);
          let counts = res.data.map((x: any) => x.Count);
          let totalActiveUsers = counts.reduce((a: number, b: number) => a + b, 0);
  
          setCountsActiveUser(counts);
          setRoles(roles);
          setTotalActiveUsers(totalActiveUsers);
        };
  
        const fetchActiveClass = async () => {
          const res = await fetchTotalActiveClass();
          if (!res.success) {
            alert(res.message);
            return;
          }
  
          let classes = res.data.map((x: any) => x.Status);
          let counts = res.data.map((x: any) => x.Total);
          let totalActiveClasses = counts.reduce((a: number, b: number) => a + b, 0);
  
          setCountsActiveClass(counts);
          setClasses(classes);
          setTotalActiveClasses(totalActiveClasses);
        };
  
        const fetchRecentActivities = async () => {
          const res = await fetchAdministratorRecentActivities(userData.name);
          if (!res.success) {
            alert(res.message);
            return;
          }
  
          setRecentActivities(res.data);
        };
  
        await fetchActiveUser();
        await fetchActiveClass();
        await fetchRecentActivities();
      } else if(userData.role == "Lecturer"){
        const fetchingActiveClassStudents = async () => {
          const res = await fetchActiveClassStudents(userData.id);
          if (!res.success) {
            alert(res.message);
            return;
          }
          let roles = res.data.map((x: any) => x.className);
          let counts = res.data.map((x: any) => x.studentCount);
          let totalActiveUsers = counts.reduce((a: number, b: number) => a + b, 0);

          setCountsActiveUser(counts);
          setRoles(roles);
          setTotalActiveUsers(totalActiveUsers);
        }

        const fetchingActiveAssignmentClass = async () => {
          const res = await fetchActiveAssignmentClass(userData.id);
          if (!res.success) {
            alert(res.message);
            return;
          }
          let classes = res.data.map((x: any) => x.className);
          let counts = res.data.map((x: any) => x.assignmentCount);
          let totalActiveClasses = counts.reduce((a: number, b: number) => a + b, 0);
  
          setCountsActiveClass(counts);
          setClasses(classes);
          setTotalActiveClasses(totalActiveClasses);
        }

        const fetchingLecturerRecentActivity = async () => {
          const res = await fetchLecturerRecentActivity(userData.name, userData.id);
          if (!res.success) {
            alert(res.message);
            return;
          }
  
          setRecentActivities(res.data)
        }

        await fetchingActiveClassStudents();
        await fetchingActiveAssignmentClass();
        await fetchingLecturerRecentActivity();
      } else if(userData.role == "Student"){
        const fetchingStudentLearningStyle = async () => {
          const res = await fetchLearningStyle(userData.id);
          if (!res.success) {
            alert(res.message);
            return;
          }

          if(res.data[0].LearningStyleId == null){
            setIsLearningStyleNotExist(true);
          }
        }

        const fetchingCompletedCourse = async () => {
          const res = await fetchCompletedCourse(userData.id);
          if (!res.success) {
            alert(res.message);
            return;
          }
          let roles = ['Completed', 'Incomplete', 'Not Started'];
          setRoles(roles)
          let countCompleted = res.data.filter((x: any) => x.courseStatus == 'Completed').length;
          let countIncomplete = res.data.filter((x: any) => x.courseStatus == 'Incomplete').length;
          let countNotStarted = res.data.filter((x: any) => x.courseStatus == 'Not Started').length;
          setCountsActiveUser([countCompleted, countIncomplete, countNotStarted]); 
          setTotalActiveUsers(res.data.length);
        }

        const fetchingStudentRecentActivity = async () => {
          const res = await fetchStudentRecentActivity(userData.id);
          if (!res.success) {
            alert(res.message);
            return;
          }

          setRecentActivities(res.data)
        }

        await fetchingStudentLearningStyle();
        await fetchingCompletedCourse();
        await fetchingAttendanceStatus();
        await fetchingStudentRecentActivity();
      }
 
      setIsLoading(false);
    };

    initialize();
  }, [dispatch, userData.name]);

  useEffect(() => {
    if(userData.role == "Student"){
      fetchingAttendanceStatus();
    }
  }, [courseId])

  if (isLoading || !userData.role) {
    return <Loading />;
  }

  return (
    <>
      <LearningStyleQuestionnaire isLearningStyleNotExist={true} userId={userData.id}/>
      <PageContainer title="Dashboard" description="Landing Page">
        <Box component="div" className={isLearningStyleNotExist ? 'overflow-hidden' : ''}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              {userData.role === "Administrator" ? (
                <AdministratorBarChart title='Students Enrolled' />
              ) : userData.role === "Lecturer" ? (
                <LecturerBarChart title='Average Students Score' userId={userData.id} />
              ) : (
                <StudentBarChart title={`Student's Score`} userId={userData.id} setCourseId={setCourseId} />
              )}
            </Grid>
            <Grid item xs={12} lg={4}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <DonutChart label={roles} data={countsActiveUser} numberOfData={totalActiveUsers} title={userData.role == "Administrator" ? "Total Active Users" : userData.role == "Lecturer" ? "Total Active Students" : "Completed Courses"} />
                </Grid>
                <Grid item xs={12}>
                  <DonutChart label={classes} data={countsActiveClass} numberOfData={totalActiveClasses} title={userData.role == "Administrator" ? 'Total Active Classes' : userData.role == "Lecturer" ? "Total Active Assignments" : "Total Attendance Logs"} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} lg={4}>
              <RecentActivities data={recentActivities} />
            </Grid>
            <Grid item xs={12} lg={8}>
              {userData.role === "Administrator" ? (
                <AdministratorToDoList />
              ) : userData.role === "Lecturer" ? (
                <LecturerToDoList userId={userData.id} userRole={userData.role}/>
              ) : (
                <LecturerToDoList userId={userData.id} userRole={userData.role}/>
              )}
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
    </>
  );
};

export default Dashboard;