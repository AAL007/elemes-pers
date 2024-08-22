'use client'
import { Grid, Box } from '@mui/material';
import PageContainer from '@/components/ui/container/page-container';
// components
import BarChart from '@/components/ui/dashboard/bar-chart';
import DonutChart from '@/components/ui/dashboard/donut-chart';
import RecentActivities from '@/components/ui/dashboard/recent-activities';
import ToDoList from '@/components/ui/dashboard/to-do-list';
// import AreaChart from '@/components/ui/dashboard/area-chart';
import React from 'react';
import { useEffect } from 'react';
import { fetchTotalActiveUser, fetchTotalActiveClass, fetchStudentsEnrolled, fetchAdministratorRecentActivities } from '@/app/api/home/dashboard';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { loadUserFromStorage } from "@/lib/user-slice";
import { set } from 'lodash';

const Dashboard = () => {
  const [countsActiveUser, setCountsActiveUser] = React.useState<number[]>([]);
  const [roles, setRoles] = React.useState<string[]>([]);
  const [totalActiveUsers, setTotalActiveUsers] = React.useState<number>(0);
  const [countsActiveClass, setCountsActiveClass] = React.useState<number[]>([]);
  const [classes, setClasses] = React.useState<string[]>([]);
  const [totalActiveClasses, setTotalActiveClasses] = React.useState<number>(0);
  const [totalEnrolledStudents, setTotalEnrolledstudents] = React.useState<number[]>([]);
  const [dateCategories, setDateCategories] = React.useState<string[]>([]);
  const [monthDDL, setMonthDDL] = React.useState<string[]>([]);
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const [administratorNotification, setAdministratorNotification] = React.useState<any[]>([]);

  useEffect(() => {
    dispatch(loadUserFromStorage())
    const fetchTotalEnrolledStudents = async () => {
      const res = await fetchStudentsEnrolled();
      if(!res.success){
        alert(res.message);
      }

      const groupedData = res.data.reduce((acc: { [key: string]: any[] }, enrollment) => {
          const date = new Date(enrollment.CreatedDate)
          const formattedDate = date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
          if (!acc[formattedDate]) {
              acc[formattedDate] = [];
          }
          acc[formattedDate].push(enrollment);
          return acc;
      }, {});

      let dates = Object.keys(groupedData);
      let counts = dates.map((x: string) => (groupedData as { [key: string]: any[] })[x].length);

      const months = dates.map(date => {
          const [month, dates, year] = date.split('/');
          const numMonth = parseInt(month, 10);
          const monthName = numMonth === 1 ? 'January' : numMonth === 2 ? 'February' : numMonth === 3 ? 'March' : numMonth === 4 ? 'April' : numMonth === 5 ? 'May' : numMonth === 6 ? 'June' : numMonth === 7 ? 'July' : numMonth === 8 ? 'August' : numMonth === 9 ? 'September' : numMonth === 10 ? 'October' : numMonth === 11 ? 'November' : 'December';
          return `${monthName} ${year}`;
      });

      const distinctMonths = Array.from(new Set(months));
      
      setTotalEnrolledstudents(counts);
      setDateCategories(dates);
      setMonthDDL(distinctMonths);
    }

    const fetchActiveUser = async () => {
      const res = await fetchTotalActiveUser();
      if(!res.success){
        alert(res.message);
        return;
      }

      const groupedData = res.data.reduce((acc: { [key: string]: any[] }, activeUser) => {
        const roleName = activeUser.roleName;
        if (!acc[roleName]) {
            acc[roleName] = [];
        }
        acc[roleName].push(activeUser);
        return acc;
      }, {});

      let roles = Object.keys(groupedData);
      let counts = roles.map((x: string) => (groupedData as { [key: string]: any[] })[x].length);
      let totalActiveUsers = counts.reduce((a, b) => a + b, 0); 

      setCountsActiveUser(counts);
      setRoles(roles);
      setTotalActiveUsers(totalActiveUsers);
    }

    const fetchActiveClass = async () => {
      const res = await fetchTotalActiveClass();
      if(!res.success){
        // console.log(res.message);
        alert(res.message);
        return;
      }

      const groupedData = res.data.reduce((acc: { [key: string]: any[] }, activeClass) => {
        const activeFlag = activeClass.ActiveFlag ? "Active" : "Inactive";
        if (!acc[activeFlag]) {
            acc[activeFlag] = [];
        }
        acc[activeFlag].push(activeClass);
        return acc;
      }, {});

      let classes = Object.keys(groupedData);
      let counts = classes.map((x: string) => (groupedData as { [key: string]: any[] })[x].length);
      let totalActiveClasses = counts.reduce((a, b) => a + b, 0); 

      setCountsActiveClass(counts);
      setClasses(classes);
      setTotalActiveClasses(totalActiveClasses);
    }

    const fetchRecentActivities = async () => {
      const res = await fetchAdministratorRecentActivities(userData.name);
      if(!res.success){
        // console.log(res.message);
        alert(res.message);
        return;
      }

      // console.log(res.data);

      setAdministratorNotification(res.data);
    }

    fetchTotalEnrolledStudents();
    fetchActiveUser();
    fetchActiveClass();
    fetchRecentActivities();
  }, [dispatch])

  return (
    <PageContainer title="Dashboard" description="Landing Page">
      <Box component="div">
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <BarChart categories={dateCategories} data={totalEnrolledStudents} dropdownList={monthDDL} title='Students Enrolled'/>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <DonutChart label={roles} data={countsActiveUser} numberOfData={totalActiveUsers} title='Total Active Users'/>
              </Grid>
              <Grid item xs={12}>
                <DonutChart label={classes} data={countsActiveClass} numberOfData={totalActiveClasses} title='Total Active Classes'/>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} lg={4}>
            <RecentActivities data={administratorNotification}/>
          </Grid>
          <Grid item xs={12} lg={8}>
            <ToDoList />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  )
}

export default Dashboard;
