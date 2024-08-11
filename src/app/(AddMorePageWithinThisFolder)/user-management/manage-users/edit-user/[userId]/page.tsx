'use client'
import { Grid, Box } from '@mui/material';
import PageContainer from '@/components/ui/container/page-container';
import "@/components/ui/component.css"
import * as React from "react";
import { useEffect, useState } from "react";
import { 
    Input,
    Select,
    SelectItem,
    Button,
    DatePicker
} from '@nextui-org/react';
import { MsStaff, MsStudent, updateStaff, updateStudent, fetchStaff, fetchStudent} from '@/app/api/user-management/manage-users';
import { parseDate } from '@internationalized/date';
import { SelectList, fetchRoles } from '@/app/api/user-management/manage-roles';
import { RootState } from '@/lib/store';
import { useDispatch, useSelector } from 'react-redux';
import { loadUserFromStorage } from '@/lib/user-slice';

// components

var defaultStaff: MsStaff = {
    StaffId: "",
    StaffName: "",
    StaffEmail: "",
    BirthDate: new Date(0).toISOString(),
    Address: "",
    RoleId: "",    
    CreatedBy: "",
    CreatedDate: new Date().toISOString(),
    UpdatedBy: null,
    UpdatedDate: new Date(0).toISOString(),
    ActiveFlag: false,
  }

  var defaultStudent: MsStudent = {
    StudentId: "",
    StudentName: "",
    StudentEmail: "",
    BirthDate: new Date(0).toISOString(),
    Address: "",
    AcadYear: "",
    RoleId: "",
    LearningStyleId: "",
    CreatedBy: "",
    CreatedDate: new Date().toISOString(),
    UpdatedBy: null,
    UpdatedDate: new Date(0).toISOString(),
    ActiveFlag: false,
  }

const EditRole = ({params} : {params : {userId: string}}) => {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const [staff, setStaff] = useState<MsStaff>(defaultStaff);
  const [student, setStudent] = useState<MsStudent>(defaultStudent);
  const today = new Date().toISOString().split('T')[0];
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userBirthDate, setUserBirthDate] = useState(parseDate(today));
  const [userAddress, setUserAddress] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [isLoading, setLoadingStatus] = useState<boolean>(false);
  const [touched, setTouched] = React.useState(false);

  const isRoleValid = userRole !== ""
  const validateEmail = (userEmail:string) => userEmail.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i)
  const isEmailValid = userEmail == "" ? false : validateEmail(userEmail) ? false : true

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('test')
    const birthDate = (new Date(userBirthDate.year, userBirthDate.month - 1, userBirthDate.day)).toISOString()
    console.log(birthDate)
    if(isStaff){
        let updateStaffData: MsStaff = {
            StaffId: staff?.StaffId,
            StaffName: userName,
            StaffEmail: userEmail,
            BirthDate: birthDate,
            Address: userAddress,
            RoleId: userRole,
            CreatedBy: staff.CreatedBy,
            CreatedDate: staff.CreatedDate,
            UpdatedBy: userData.name,
            UpdatedDate: new Date().toISOString(),
            ActiveFlag: staff.ActiveFlag,
        }
        updateStaff(updateStaffData).then((res) => {
            if(res.statusCode == 200){
                setLoadingStatus(false)
                window.location.href = `/user-management/manage-users`
            }else{
                alert(res.message)
                setLoadingStatus(false)
            }
        })
    }else{
        let updateStudentData: MsStudent = {
            StudentId: student?.StudentId,
            StudentName: userName,
            StudentEmail: userEmail,
            BirthDate: birthDate,
            Address: userAddress,
            AcadYear: student?.AcadYear,
            RoleId: userRole,
            LearningStyleId: student?.LearningStyleId,
            CreatedBy: userData.name,
            CreatedDate: student.CreatedDate,
            UpdatedBy: "Alfonsus Adrian",
            UpdatedDate: new Date().toISOString(),
            ActiveFlag: student?.ActiveFlag,
        }
        updateStudent(updateStudentData).then((res) => {
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
    });
    fetchStaff(params.userId).then((res) => {
        if(res.statusCode != 200){
            fetchStudent(params.userId).then((res) => {
                if(res.statusCode != 200){
                    alert(res.message)
                }else{
                    setUserName(res.data.StudentName)
                    setUserEmail(res.data.StudentEmail)
                    setUserAddress(res.data.Address)
                    setUserRole(res.data.RoleId)
                    setUserBirthDate(parseDate(res.data.BirthDate.split('T')[0]))
                    setIsStaff(false)
                    setStudent(res.data)
                }
            })
        }else{
            setUserName(res.data.StaffName)
            setUserEmail(res.data.StaffEmail)
            setUserAddress(res.data.Address)
            setUserRole(res.data.RoleId)
            setUserBirthDate(parseDate(res.data.BirthDate.split('T')[0]))
            setIsStaff(true)
            setStaff(res.data)
        }
    })
  }, [dispatch]);

  return (
    <PageContainer title="Edit Role" description="Edit Role">
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
                        Edit User
                    </Button>
                </Grid>
            </Grid>
          </form>
        </div>
      </Box>
    </PageContainer>
  )
}

export default EditRole;
