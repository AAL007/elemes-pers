'use client'
import * as React from "react";
import { Grid, Box } from '@mui/material';
import "@/components/ui/component.css"
import PageContainer from '@/components/ui/container/page-container';
import { useEffect, useState } from "react";
import { Input } from '@nextui-org/react';
import { MsStaff, MsStudent, createStaff, createStudent} from '@/app/api/user-management/manage-users';
import { Button, DatePicker, Select, SelectItem} from "@nextui-org/react";
import { fetchRoles, MsRole, SelectList } from "@/app/api/user-management/manage-roles";
import { parseDate } from "@internationalized/date";
import { generateGUID } from "../../../../../../utils/boilerplate-function";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { loadUserFromStorage } from "@/lib/user-slice";
// components

const AddRole = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const today = new Date().toISOString().split('T')[0];
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userBirthDate, setUserBirthDate] = useState(parseDate(today));
  const [userAddress, setUserAddress] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [isLoading, setLoadingStatus] = useState<boolean>(false);
  const [touched, setTouched] = React.useState(false);

  const isRoleValid = userRole !== ""
  const validateEmail = (userEmail:string) => userEmail.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i)
  const isEmailValid = userEmail == "" ? false : validateEmail(userEmail) ? false : true

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let selectedRoleCategoryId = roles.find((role) => role.RoleId == userRole)?.RoleCategoryId
    const birthDate = (new Date(userBirthDate.year, userBirthDate.month - 1, userBirthDate.day)).toISOString()
    if(selectedRoleCategoryId == "22e35ce5-3407-4b11-af22-acb995548a0d"){
        let staff: MsStaff = {
            StaffId: generateGUID(),
            StaffName: userName,
            StaffEmail: userEmail,
            BirthDate: birthDate,
            Address: userAddress,
            RoleId: userRole,
            CreatedBy: userData.name,
            CreatedDate: new Date().toISOString(),
            UpdatedBy: null,
            UpdatedDate: new Date(0).toISOString(),
            ActiveFlag: true,
        }
        createStaff(staff).then((res) => {
            if(res.statusCode == 200){
                setLoadingStatus(false)
                window.location.href = `/user-management/manage-users`
            }else{
                alert(res.message)
                setLoadingStatus(false)
            }
        })
    }else{
        let student: MsStudent = {
            StudentId: generateGUID(),
            StudentName: userName,
            StudentEmail: userEmail,
            BirthDate: birthDate,
            Address: userAddress,
            AcadYear: new Date().getFullYear().toString(),
            RoleId: userRole,
            LearningStyleId: "98ef05c8-121a-4821-a54b-9d3ac92f7292",
            CreatedBy: userData.name,
            CreatedDate: new Date().toISOString(),
            UpdatedBy: null,
            UpdatedDate: new Date(0).toISOString(),
            ActiveFlag: true,
        }
        createStudent(student).then((res) => {
            if(res.statusCode == 200){
                setLoadingStatus(false)
                window.location.href = `/user-management/manage-users`
            }else{
                alert(res.message)
                setLoadingStatus(false)
            }
        })
    }
  }

  const [dropdownList, setDropdownList] = React.useState<SelectList[]>([])
  const [roles, setRoles] = React.useState<MsRole[]>([])
  useEffect(() => {
    dispatch(loadUserFromStorage())
    fetchRoles().then((object: any) => {
        const res = object.data.map((z: any) => {
            return{
                key: z.RoleId,
                label: z.RoleName,
                roleCategoryId: z.RoleCategoryId
            }
        })
        setDropdownList(res)
        setRoles(object.data || [])
    });
  }, [dispatch]);

  return (
    <PageContainer title="Add Role" description="Add Role">
      <Box component="div">
        <div>
          <form className='ml-6' onSubmit={handleSubmit}>
            <h2 style={{ fontSize: "22px", marginBottom: "20px", fontWeight: "600"}}>General Details</h2>
            <Grid container spacing={2} className="mt-0.5">
                <Grid item xs={6} sm={6} md={6} lg={6} className="mb-2">
                    <Input
                        autoFocus
                        label="User Name"
                        className="w-full sm:max-w-[80%]"
                        labelPlacement='inside'
                        placeholder="Enter user name"
                        variant="bordered"
                        onChange={(e) => {setUserName(e.target.value)}}
                        value={userName}
                    />
                </Grid>
                <Grid item xs={6} sm={6} className="mb-2">
                    <Input
                        autoFocus
                        label="User Email"
                        className="w-full sm:max-w-[80%]"
                        labelPlacement='inside'
                        placeholder="Enter user email"
                        variant="bordered"
                        onChange={(e) => {setUserEmail(e.target.value)}}
                        value={userEmail}
                        isInvalid={isEmailValid}
                        errorMessage="Please enter a valid email"
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={6} lg={6} className="mb-2">
                    <DatePicker
                        isRequired
                        label="User Birth Date"
                        className="w-full sm:max-w-[80%]"
                        labelPlacement="inside"
                        onChange={setUserBirthDate}
                        showMonthAndYearPickers
                        value={userBirthDate}
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={6} lg={6} className="mb-2">
                    <Input
                        required
                        autoFocus
                        label="User Address"
                        className="w-full sm:max-w-[80%]"
                        labelPlacement='inside'
                        placeholder="Enter user address"
                        variant="bordered"
                        onChange={(e) => {setUserAddress(e.target.value)}}
                        value={userAddress}
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={6} lg={6} className="mb-2">
                    <Select
                      required
                      label= "User Role"
                      variant="bordered"
                      placeholder="Select user role"
                      errorMessage={isRoleValid || !touched ? "" : "You need to select a role category"}
                      isInvalid={isRoleValid || !touched ? false: true}
                      selectedKeys={[userRole]}
                      className="w-full sm:max-w-[80%]"
                      onChange={(e) => {setUserRole(e.target.value)}}
                      onClose={() => setTouched(true)}
                      value={userRole}
                    >
                      {dropdownList.map((roles) => (
                        <SelectItem key={roles.key}>
                          {roles.label}
                        </SelectItem>
                      ))}
                    </Select>
                </Grid>
                <Grid item xs={6} sm={6} md={6} lg={6} className="mb-2">
                </Grid>
                <Grid item xs={9} sm={9} md={9} lg={9} className="mt-4">
                </Grid>
                <Grid item xs={3} sm={3} md={3} lg={3} className="mt-4">
                    <Button color="primary" variant="solid" className="w-full sm:max-w-[60%] h-14" isLoading={isLoading} onClick={(e: any) => {
                        setLoadingStatus(true)
                        handleSubmit(e)
                    }}>
                        Add User
                    </Button>
                </Grid>
            </Grid>
          </form>
        </div>
      </Box>
    </PageContainer>
  )
}

export default AddRole;
