'use client'
import { Grid, Box } from '@mui/material';
import PageContainer from '@/components/ui/container/PageContainer';
// components
import { Select, SelectSection, SelectItem, Spinner } from '@nextui-org/react';
import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell
  } from "@nextui-org/table";


const ManageRoles = () => {
  return (
    <PageContainer title="Manage Roles" description="Add, Update, Read, and Delete Roles">
      <Box>
      <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
   
              </Grid>
              <Grid item xs={12}>
         
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} lg={4}>
    
          </Grid>
          <Grid item xs={12} lg={8}>
  
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  )
}

export default ManageRoles;
