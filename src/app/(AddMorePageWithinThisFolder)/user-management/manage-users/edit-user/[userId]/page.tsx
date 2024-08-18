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
import { updateStaff, updateStudent, fetchStaff, fetchStudent, createLecturerCourse, deleteLecturerCourse, fetchLecturerCoursesByStaffId} from '@/app/api/user-management/manage-users';
import { parseDate } from '@internationalized/date';
import { fetchRoles } from '@/app/api/user-management/manage-roles';
import { RootState } from '@/lib/store';
import { useDispatch, useSelector } from 'react-redux';
import { loadUserFromStorage } from '@/lib/user-slice';
import { MsStaff, MsStudent, SelectList, MsRole, LecturerCourse } from '@/app/api/data-model';
import { fetchDepartments } from '@/app/api/user-management/manage-users';
import { fetchCourses } from '@/app/api/enrollment/manage-courses';

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
    DepartmentId: "",
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
  const [touched2, setTouched2] = React.useState(false);
  const [touched3, setTouched3] = React.useState(false);
  const [courses, setCourse] = useState(new Set<string>([]));

  const isCourseValid = courses.size !== 0
  const isStudyProgramValid = student.DepartmentId !== ""

  const isRoleValid = userRole !== ""
  const validateEmail = (userEmail:string) => userEmail.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i)
  const isEmailValid = userEmail == "" ? false : validateEmail(userEmail) ? false : true

  const handleSelectionChange = (e: any) => {
    setCourse(new Set(e.target.value.split(",")));
  };

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
        updateStaff(updateStaffData).then(async(res) => {
            if(res.statusCode == 200){
                if(userRole == "lec818d2-9047-4f39-888a-9848a0bcbbc1"){
                    const coursesArray = Array.from(courses).filter(item => item !== "")
                    const addedCourse = coursesArray.filter(item => !initialLecturerCourse.includes(item))
                    const removedCourse = initialLecturerCourse.filter(item => !coursesArray.includes(item))
                    for(let i = 0; i < addedCourse.length; i++){
                        let lecturerCourse: LecturerCourse = {
                            StaffId: staff.StaffId,
                            CourseId: addedCourse[i],
                            CreatedDate: new Date().toISOString(),
                            CreatedBy: userData.name,
                            UpdatedDate: new Date(0).toISOString(),
                            UpdatedBy: null,
                            ActiveFlag: true
                        }
                        await createLecturerCourse(lecturerCourse).then((res2) => {
                            if(res2.statusCode != 200){
                                alert(res2.message)
                                setLoadingStatus(false)
                                return;
                            }
                        })
                    }
                    for(let i = 0; i < removedCourse.length; i++){
                        console.log(removedCourse[i])
                        await deleteLecturerCourse(staff.StaffId, removedCourse[i]).then((res2) => {
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
        let updateStudentData: MsStudent = {
            StudentId: student?.StudentId,
            StudentName: userName,
            StudentEmail: userEmail,
            BirthDate: birthDate,
            Address: userAddress,
            AcadYear: student?.AcadYear,
            RoleId: userRole,
            LearningStyleId: student?.LearningStyleId,
            DepartmentId: student?.DepartmentId,
            CreatedBy: student.CreatedBy,
            CreatedDate: student.CreatedDate,
            UpdatedBy: userData.name,
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

  const [departmentDropdownList, setDepartmentDropdownList] = React.useState<SelectList[]>([])
  const [roleDropdownList, setRoleDropdownList] = React.useState<SelectList[]>([])
  const [courseDropdownList, setCourseDropdownList] = React.useState<SelectList[]>([])
  const [initialLecturerCourse, setInitialLecturerCourse] = React.useState<string[]>([])
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
            if(res.data.RoleId == "lec818d2-9047-4f39-888a-9848a0bcbbc1"){
                fetchLecturerCoursesByStaffId(params.userId).then((res3) => {
                    if(res3.statusCode != 200){
                        alert(res3.message)
                    }else{
                        const courseIdList = res3.data.map((z: LecturerCourse) => z.CourseId)
                        setCourse(new Set(courseIdList))
                        setInitialLecturerCourse(courseIdList)
                    }
                })
            }
        }
    })
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
    <PageContainer title="Edit Role" description="Edit Role">
      <Box component="div">
        <div>
        <form className='ml-6' onSubmit={handleSubmit}>
            <h2 style={{ fontSize: "22px", marginBottom: "20px", fontWeight: "600"}}>Edit Details</h2>
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
                      {roleDropdownList.map((roles) => (
                        <SelectItem key={roles.key}>
                          {roles.label}
                        </SelectItem>
                      ))}
                    </Select>
                </Grid>
                {(userRole == "stu01e3e-bb2b-4c63-a62c-8c7f01f0120c") && (
                    <>
                        <Grid item xs={6} sm={6} md={6} lg={6} className="mb-2">
                            <Select
                            required
                            label= "Study Program"
                            variant="bordered"
                            placeholder="Select student study program"
                            errorMessage={ isStudyProgramValid || !touched2 ? "" : "You need to select a study program"}
                            isInvalid={ isStudyProgramValid || !touched2 ? false: true}
                            selectedKeys={[student.DepartmentId]}
                            className="w-full sm:max-w-[80%]"
                            onChange={(e) => {setStudent({...student, DepartmentId: e.target.value})}}
                            onClose={() => setTouched2(true)}
                            value={student.DepartmentId}
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
                {(userRole == "lec818d2-9047-4f39-888a-9848a0bcbbc1") && (
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
