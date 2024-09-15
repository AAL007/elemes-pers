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
import { fetchTotalActiveUser, fetchTotalActiveClass, fetchStudentsEnrolled, fetchAdministratorRecentActivities, fetchActiveClassStudents, fetchActiveAssignmentClass, fetchLecturerRecentActivity } from '@/app/api/home/dashboard';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { loadUserFromStorage } from "@/lib/user-slice";
import AdministratorBarChart from '@/components/ui/dashboard/administrator-bar-chart';
import LecturerBarChart from '@/components/ui/dashboard/lecturer-bar-chart';
import StudentBarChart from '@/components/ui/dashboard/student-bar-chart';
import Loading from './loading';

const Dashboard = () => {
  const [countsActiveUser, setCountsActiveUser] = useState<number[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [totalActiveUsers, setTotalActiveUsers] = useState<number>(0);
  const [countsActiveClass, setCountsActiveClass] = useState<number[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [totalActiveClasses, setTotalActiveClasses] = useState<number>(0);
  const [administratorNotification, setAdministratorNotification] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);

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
  
          setAdministratorNotification(res.data);
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
  
          setAdministratorNotification(res.data)
        }

        await fetchingActiveClassStudents();
        await fetchingActiveAssignmentClass();
        await fetchingLecturerRecentActivity();
      } else if(userData.role == "Student"){

      }
 
      setIsLoading(false);
    };

    initialize();
  }, [dispatch, userData.name]);

  if (isLoading || !userData.role) {
    return <Loading />;
  }

  return (
    <PageContainer title="Dashboard" description="Landing Page">
      <Box component="div">
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            {userData.role === "Administrator" ? (
              <AdministratorBarChart title='Students Enrolled' />
            ) : userData.role === "Lecturer" ? (
              <LecturerBarChart title='Average Students Score' userId={userData.id} />
            ) : (
              <StudentBarChart title='Students Score' />
            )}
          </Grid>
          <Grid item xs={12} lg={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <DonutChart label={roles} data={countsActiveUser} numberOfData={totalActiveUsers} title={userData.role == "Administrator" ? "Total Active Users" : userData.role == "Lecturer" ? "Total Active Student" : ""} />
              </Grid>
              <Grid item xs={12}>
                <DonutChart label={classes} data={countsActiveClass} numberOfData={totalActiveClasses} title={userData.role == "Administrator" ? 'Total Active Classes' : userData.role == "Lecturer" ? "Total Active Assignment" : ""} />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} lg={4}>
            <RecentActivities data={administratorNotification} />
          </Grid>
          <Grid item xs={12} lg={8}>
            {userData.role === "Administrator" ? (
              <AdministratorToDoList />
            ) : userData.role === "Lecturer" ? (
              <LecturerToDoList />
            ) : (
              <></>
            )}
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Dashboard;