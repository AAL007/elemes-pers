// 'use client'
// import { Grid, Box } from '@mui/material';
// import PageContainer from '@/components/ui/container/page-container';
// import * as React from "react";
// import { useEffect, useState } from "react";
// import { useParams } from 'react-router-dom';
// import { Role } from '../../../../../api/user-management/manage-roles';
// import { fetchRole } from '../../../../../api/user-management/manage-roles';
// import { Input } from '@nextui-org/react';
// // components

// const EditRole = ({params} : {params : {roleId: string}}) => {
//   const [role, setRole] = useState<Role | any>(null);

//   var defaultRole: Role = {
//     id: "",
//     name: "",
//     createdBy: "",
//     updatedBy: "",
//     status: ""
//   }

//   useEffect(() => {
//     fetchRole(params.roleId ?? "").then((data) => {
//       const mappedRole = {
//         id: data?.RoleId,
//         name: data?.RoleName,
//         createdBy: data?.CreatedBy,
//         updatedBy: data?.UpdatedBy ?? "N/A",
//         status: data?.ActiveFlag ? "active" : "inactive"
//       };
//       console.log(mappedRole);
//       setRole(mappedRole || defaultRole);
//     });
//   }, []);

//   return (
//     <PageContainer title="Edit Role" description="Edit Role">
//       <Box>
//         <div>
//           <form>
//             <Grid container spacing={3}>
//               <Grid item xs={12}>
//                 <Input
//                   label="Role Name"
//                   value={role?.name}
//                   onChange={(e) => {
//                     setRole({ ...role, name: e.target.value });
//                   }}
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <Input
//                   label="Created By"
//                   value={role?.createdBy}
//                   disabled
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <Input
//                   label="Updated By"
//                   value={role?.updatedBy}
//                   disabled
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <Input
//                   label="Status"
//                   value={role?.status}
//                   disabled
//                 />
//               </Grid>
//             </Grid>
//           </form>
//         </div>
//       </Box>
//     </PageContainer>
//   )
// }

// export default EditRole;
