'use client'
import { Grid, Box } from '@mui/material';
import PageContainer from '@/components/ui/container/PageContainer';
// components
import SalesOverview from '@/components/ui/dashboard/SalesOverview';
import YearlyBreakup from '@/components/ui/dashboard/YearlyBreakup';
import RecentTransactions from '@/components/ui/dashboard/RecentTransactions';
import ProductPerformance from '@/components/ui/dashboard/ProductPerformance';
import MonthlyEarnings from '@/components/ui/dashboard/MonthlyEarnings';

const Dashboard = () => {
  return (
    <PageContainer title="Dashboard" description="Landing Page">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <SalesOverview />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <YearlyBreakup />
              </Grid>
              <Grid item xs={12}>
                <MonthlyEarnings />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} lg={4}>
            <RecentTransactions />
          </Grid>
          <Grid item xs={12} lg={8}>
            <ProductPerformance />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  )
}

export default Dashboard;
