'use client'
import * as React from "react";
import { Grid, Box } from '@mui/material';
import "@/components/ui/component.css"
import PageContainer from '@/components/ui/container/page-container';
import { useEffect, useState } from "react";
import { Input } from '@nextui-org/react';
import { createStaff, createStudent, fetchDepartments, createLecturerCourse } from '@/app/api/user-management/manage-users';
import { fetchCourses } from "@/app/api/enrollment/manage-courses";
import { Button, DatePicker, Select, SelectItem} from "@nextui-org/react";
import { fetchRoles } from "@/app/api/user-management/manage-roles";;
import { generateGUID } from "../../../../../../utils/utils";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { loadUserFromStorage } from "@/lib/user-slice";
import { MsRole, MsStaff, MsStudent, SelectList, LecturerCourse } from "@/app/api/data-model";
import { parseAbsoluteToLocal } from "@internationalized/date";
// components

const AddRole = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const today = new Date().toISOString();
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userBirthDate, setUserBirthDate] = useState(parseAbsoluteToLocal(today));
  const [userAddress, setUserAddress] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [userStudyProgram, setUserStudyProgram] = useState<string>("");
  const [userPhoneNumber, setUserPhoneNumber] = useState<string>("");
  const [isLoading, setLoadingStatus] = useState<boolean>(false);
  const [touched, setTouched] = React.useState(false);
  const [touched2, setTouched2] = React.useState(false);
  const [touched3, setTouched3] = React.useState(false);
  const [touched4, setTouched4] = React.useState(false);
  const [courses, setCourse] = useState(new Set([]));
  const [gender, setGender] = useState<string>("");
  const [genderDDL, setGenderDDL] = useState<SelectList[]>([
    { key: "M", label: "Male" },
    { key: "F", label: "Female" }
  ]);
  const staffRoleCategoryId = process.env.NEXT_PUBLIC_ROLE_CATEGORY_STAFF_ID || "";
  const studentRoleId = process.env.NEXT_PUBLIC_STUDENT_ROLE_ID || "";
  const lecturerRoleId = process.env.NEXT_PUBLIC_LECTURER_ROLE_ID || "";
  const isGenderValid = gender!== ""
  const isRoleValid = userRole !== ""
  const isCourseValid = courses.size !== 0
  const isStudyProgramValid = userStudyProgram !== ""
  const isPhoneNumberValid = userPhoneNumber == "" ? false : userPhoneNumber.match(/^[0-9]+$/) ? false : true
  const validateEmail = (userEmail:string) => userEmail.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i)
  const isEmailValid = userEmail == "" ? false : validateEmail(userEmail) ? false : true

  const handleSelectionChange = (e: any) => {
    setCourse(new Set(e.target.value.split(",")));
  };

  const convertDate = (date: any) => {
    const { year, month, day } = date;
    const newDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    // const offset = 7 * 60 * 60 * 1000;
    newDate.setTime(newDate.getTime())
    console.log(newDate)
    return newDate;
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let selectedRoleCategoryId = roles.find((role) => role.RoleId == userRole)?.RoleCategoryId
    const birthDate = convertDate(userBirthDate);
    if(selectedRoleCategoryId == staffRoleCategoryId){
        let staff: MsStaff = {
            StaffId: generateGUID(),
            StaffName: userName,
            StaffEmail: userEmail,
            PhoneNumber: userPhoneNumber,
            BirthDate: birthDate,
            Address: userAddress,
            RoleId: userRole,
            Gender: gender,
            ProfilePictureUrl: null,
            CreatedBy: userData.name,
            CreatedDate: new Date().toISOString(),
            UpdatedBy: null,
            UpdatedDate: new Date(0).toISOString(),
            ActiveFlag: true,
        }

        createStaff(staff).then((res) => {
            if(res.statusCode == 200){
                if(userRole == lecturerRoleId){
                    const coursesArray = Array.from(courses).filter(item => item !== "")
                    for(let i = 0; i < coursesArray.length; i++){
                        let lecturerCourse: LecturerCourse = {
                            StaffId: staff.StaffId,
                            CourseId: coursesArray[i],
                            CreatedDate: new Date().toISOString(),
                            CreatedBy: userData.name,
                            UpdatedDate: new Date(0).toISOString(),
                            UpdatedBy: null,
                            ActiveFlag: true
                        }
                        createLecturerCourse(lecturerCourse).then((res2) => {
                            if(res2.statusCode != 200){
                                alert(res2.message)
                                setLoadingStatus(false)
                                return;
                            }
                        })
                    }
                }
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
            PhoneNumber: userPhoneNumber,
            BirthDate: birthDate,
            Address: userAddress,
            AcadYear: new Date().getFullYear().toString(),
            RoleId: userRole,
            Gender: gender,
            ProfilePictureUrl: null,
            LearningStyleId: null,
            DepartmentId: userStudyProgram,
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

  const [departmentDropdownList, setDepartmentDropdownList] = React.useState<SelectList[]>([])
  const [roleDropdownList, setRoleDropdownList] = React.useState<SelectList[]>([])
  const [roles, setRoles] = React.useState<MsRole[]>([])
  const [courseDropdownList, setCourseDropdownList] = React.useState<SelectList[]>([])
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
        setRoleDropdownList(res)
        setRoles(object.data || [])
    });
    fetchDepartments().then((object: any) => {
        const res = object.data.map((z: any) => {
            return{
                key: z.DepartmentId,
                label: z.DepartmentName,
            }
        })
        setDepartmentDropdownList(res)
    })
    fetchCourses().then((object: any) => {
        const res = object.data.map((z: any) => {
            return{
                key: z.CourseId,
                label: z.CourseName
            }
        })
        setCourseDropdownList(res)
    })
  }, [dispatch]);

  return (
    <PageContainer title="Add User" description="Add User">
      <Box component="div">
        <div>
          <form className='ml-6' onSubmit={handleSubmit}>
            <h2 style={{ fontSize: "22px", marginBottom: "20px", fontWeight: "600"}}>Add Details</h2>
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
                <Grid item xs={6} sm={6} className="mb-2">
                    <Input
                        autoFocus
                        label="User Phone Number"
                        className="w-full sm:max-w-[80%]"
                        labelPlacement='inside'
                        placeholder="Enter user phone number"
                        variant="bordered"
                        onChange={(e) => {setUserPhoneNumber(e.target.value)}}
                        value={userPhoneNumber}
                        isInvalid={isPhoneNumberValid}
                        errorMessage="Please enter a valid phone number"
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={6} lg={6} className="mb-2">
                    <DatePicker
                        isRequired
                        label="User Birth Date"
                        className="w-full sm:max-w-[80%]"
                        variant="bordered"
                        granularity="day"
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
                      label= "Gender"
                      variant="bordered"
                      placeholder="Select user gender"
                      errorMessage={isGenderValid || !touched4 ? "" : "You need to select a gender"}
                      isInvalid={isGenderValid || !touched4 ? false: true}
                      selectedKeys={[gender]}
                      className="w-full sm:max-w-[80%]"
                      onChange={(e) => {setGender(e.target.value)}}
                      onClose={() => setTouched4(true)}
                      value={gender}
                    >
                      {genderDDL.map((gender: SelectList) => (
                        <SelectItem key={gender.key}>
                          {gender.label}
                        </SelectItem>
                      ))}
                    </Select>
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
                      onChange={(e) => {setUserRole(e.target.value); console.log(e.target.value)}}
                      onClose={() => setTouched(true)}
                      value={userRole}
                    >
                      {roleDropdownList.map((roles: SelectList) => (
                        <SelectItem key={roles.key}>
                          {roles.label}
                        </SelectItem>
                      ))}
                    </Select>
                </Grid>
                {(userRole == studentRoleId) && (
                    <>
                        <Grid item xs={6} sm={6} md={6} lg={6} className="mb-2">
                            <Select
                            required
                            label= "Study Program"
                            variant="bordered"
                            placeholder="Select student study program"
                            errorMessage={ isStudyProgramValid || !touched2 ? "" : "You need to select a study program"}
                            isInvalid={ isStudyProgramValid || !touched2 ? false: true}
                            selectedKeys={[userStudyProgram]}
                            className="w-full sm:max-w-[80%]"
                            onChange={(e) => {setUserStudyProgram(e.target.value)}}
                            onClose={() => setTouched2(true)}
                            value={userStudyProgram}
                            >
                            {departmentDropdownList.map((major: SelectList) => (
                                <SelectItem key={major.key}>
                                {major.label}
                                </SelectItem>
                            ))}
                            </Select>
                        </Grid>
                    </>
                )}
                {(userRole == lecturerRoleId) && (
                    <>
                        <Grid item xs={6} sm={6} md={6} lg={6} className="mb-2">
                            <Select
                                required
                                label= "Course"
                                selectionMode="multiple"
                                variant="bordered"
                                placeholder="Select course"
                                errorMessage={ isCourseValid || !touched3 ? "" : "You need to select a course"}
                                isInvalid={ isCourseValid || !touched3 ? false: true}
                                selectedKeys={courses}
                                className="w-full sm:max-w-[80%]"
                                onChange={handleSelectionChange}
                                onClose={() => setTouched3(true)}
                                >
                                {courseDropdownList.map((course: SelectList) => (
                                    <SelectItem key={course.key}>
                                    {course.label}
                                    </SelectItem>
                                ))}
                            </Select>
                        </Grid>
                    </>
                )}
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