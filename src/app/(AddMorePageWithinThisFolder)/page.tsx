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


  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const [administratorNotification, setAdministratorNotification] = React.useState<any[]>([]);

  useEffect(() => {
    dispatch(loadUserFromStorage())
  
    const fetchActiveUser = async () => {
      const res = await fetchTotalActiveUser();
      if(!res.success){
        alert(res.message);
        return;
      }

      let roles = res.data.map((x: any) => {return x.RoleName});
      let counts = res.data.map((x: any) => {return x.Count});
      let totalActiveUsers = counts.reduce((a: number, b: number) => a + b, 0); 

      setCountsActiveUser(counts);
      setRoles(roles);
      setTotalActiveUsers(totalActiveUsers);
    }

    const fetchActiveClass = async () => {
      const res = await fetchTotalActiveClass();
      if(!res.success){
        alert(res.message);
        return;
      }

      let classes = res.data.map((x: any) => {return x.Status})
      let counts = res.data.map((x: any) => {return x.Total});
      let totalActiveClasses = counts.reduce((a: number, b: number) => a + b, 0); 

      setCountsActiveClass(counts);
      setClasses(classes);
      setTotalActiveClasses(totalActiveClasses);
    }

    const fetchRecentActivities = async () => {
      const res = await fetchAdministratorRecentActivities(userData.name);
      if(!res.success){
        alert(res.message);
        return;
      }

      // console.log(res.data);

      setAdministratorNotification(res.data);
    }

    fetchActiveUser();
    fetchActiveClass();
    fetchRecentActivities();
  }, [dispatch])

  return (
    <PageContainer title="Dashboard" description="Landing Page">
      <Box component="div">
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <BarChart title='Students Enrolled'/>
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
