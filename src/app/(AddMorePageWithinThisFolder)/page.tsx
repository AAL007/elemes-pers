'use client'
import { Grid, Box } from '@mui/material';
import PageContainer from '@/components/ui/container/page-container';
// components
import SalesOverview from '@/components/ui/dashboard/sales-overview';
import YearlyBreakup from '@/components/ui/dashboard/yearly-breakup';
import RecentTransactions from '@/components/ui/dashboard/recent-transactions';
import ProductPerformance from '@/components/ui/dashboard/product-performance';
import MonthlyEarnings from '@/components/ui/dashboard/monthly-earning';

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
