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
import { Avatar } from '@files-ui/react'
import { updateStaff, updateStudent, fetchStaff, fetchStudent, createLecturerCourse, deleteLecturerCourse, fetchLecturerCoursesByStaffId} from '@/app/api/user-management/manage-users';
import { DateValue, now, parseAbsoluteToLocal } from '@internationalized/date';
import { RootState } from '@/lib/store';
import { useDispatch, useSelector } from 'react-redux';
import { loadUserFromStorage } from '@/lib/user-slice';
import { MsStaff, MsStudent, SelectList, LecturerCourse } from '@/app/api/data-model';
import { fetchDepartments } from '@/app/api/user-management/manage-users';
import { fetchCourses } from '@/app/api/enrollment/manage-courses';
import { updateUserEmail } from '@/app/api/edit-profile/edit-profile';
import { uploadFileToAzureBlobStorage, replaceFileInAzureBlobStorage } from '@/app/api/azure-helper';
import { fetchLearningStyle } from '@/app/api/enrollment/manage-course-detail';
import { set } from 'lodash';

// components

var defaultStaff: MsStaff = {
    StaffId: "",
    StaffName: "",
    StaffEmail: "",
    PhoneNumber: "",
    BirthDate: new Date(0).toISOString(),
    Address: "",
    RoleId: "",
    Gender: "",
    ProfilePictureUrl: null,    
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
    PhoneNumber: "",
    BirthDate: new Date(0).toISOString(),
    Address: "",
    AcadYear: "",
    RoleId: "",
    Gender: "",
    ProfilePictureUrl: null,
    LearningStyleId: "",
    DepartmentId: "",
    CreatedBy: "",
    CreatedDate: new Date().toISOString(),
    UpdatedBy: null,
    UpdatedDate: new Date(0).toISOString(),
    ActiveFlag: false,
  }

const EditProfile = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const [staff, setStaff] = useState<MsStaff>(defaultStaff);
  const [student, setStudent] = useState<MsStudent>(defaultStudent);
  const today = new Date().toISOString();
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userBirthDate, setUserBirthDate] = useState(parseAbsoluteToLocal(today));
  const [userAddress, setUserAddress] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [userPhoneNumber, setUserPhoneNumber] = useState<string>("");
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [isLoading, setLoadingStatus] = useState<boolean>(false);
  const [isUploadProfilePicture, setIsUploadProfilePicture] = useState<boolean>(false);
  const [touched2, setTouched2] = React.useState(false);
  const [touched4, setTouched4] = React.useState(false);
  const [courses, setCourse] = useState(new Set<string>([]));
  const [initialLecturerCourse, setInitialLecturerCourse] = React.useState<string[]>([])
  const [gender, setGender] = useState<string>("");
  const [departmentDropdownList, setDepartmentDropdownList] = React.useState<SelectList[]>([])
  const [courseDropdownList, setCourseDropdownList] = React.useState<SelectList[]>([])
  const [learningStyleDropdownList, setLearningStyleDropdownList] = React.useState<SelectList[]>([])
  const [genderDDL, setGenderDDL] = useState<SelectList[]>([
    { key: "M", label: "Male" },
    { key: "F", label: "Female" }
  ]);

  const isLearningStyleValid = student.LearningStyleId !== ""
  const isGenderValid = gender!== ""
  const validateEmail = (userEmail:string) => userEmail.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i)
  const isPhoneNumberValid = userPhoneNumber == "" ? false : userPhoneNumber.match(/^[0-9]+$/) ? true : false
  const isEmailValid = userEmail == "" ? false : validateEmail(userEmail) ? true : false

  const convertDate = (date: any) => {
    return new Date(
      date.year,
      date.month - 1,
      date.day,
      date.hour,
      date.minute,
      date.second,
      date.millisecond
    ).toISOString();
  }

  const handleUploadPhoto = async (e: File) => {
    setIsUploadProfilePicture(true)
    let containerName = userData.roleCategory == "Staff" ? 'staff-data' : 'student-data'
    // console.log(containerName)
    // console.log(userData.roleCategory)
    if(profilePictureUrl == null){
        let blobUrl = await uploadFileToAzureBlobStorage( containerName, e, userData.id, `${userData.name}_profile_picture`)
        setProfilePictureUrl(blobUrl)
    }else{
        let blobUrl = await replaceFileInAzureBlobStorage(containerName, e, userData.id, `${userData.name}_profile_picture`)
        setProfilePictureUrl(blobUrl)
    }
    setIsUploadProfilePicture(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(userEmail == "" || userName == "" || userPhoneNumber == "" || userAddress == "" || gender == ""){
        alert("Please fill in all required fields")
        setLoadingStatus(false)
        return;
    }
    if(!isPhoneNumberValid) {
        alert("Please enter a valid phone number")
        setLoadingStatus(false)
        return;
    }
    if(!isEmailValid){
        alert("Please enter a valid email")
        setLoadingStatus(false)
        return;
    }
    if(userEmail != userData.email){
        await updateUserEmail(userEmail)
    }
    if(userData.role == "Administrator" || userData.role == "Lecturer"){
        const birthDate = convertDate(userBirthDate)
        let updateStaffData: MsStaff = {
            StaffId: staff?.StaffId,
            StaffName: userName,
            StaffEmail: userEmail,
            PhoneNumber: userPhoneNumber,
            BirthDate: birthDate,
            Address: userAddress,
            RoleId: userRole,
            Gender: gender,
            ProfilePictureUrl: profilePictureUrl,
            CreatedBy: staff.CreatedBy,
            CreatedDate: staff.CreatedDate,
            UpdatedBy: userData.name,
            UpdatedDate: new Date().toISOString(),
            ActiveFlag: staff.ActiveFlag,
        }
        await updateStaff(updateStaffData).then(async(res) => {
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
                        // console.log(removedCourse[i])
                        await deleteLecturerCourse(staff.StaffId, removedCourse[i]).then((res2) => {
                            if(res2.statusCode != 200){
                                alert(res2.message)
                                setLoadingStatus(false)
                                return;
                            }
                        })
                    }
                }
                localStorage.setItem('profilePicture', profilePictureUrl ?? "")
                setLoadingStatus(false)
                window.location.href = `/`
            }else{
                alert(res.message)
                setLoadingStatus(false)
            }
        })
    }else{
        if(userEmail != userData.email){
            await updateUserEmail(userEmail)
        }
        const birthDate = convertDate(userBirthDate)
        let updateStudentData: MsStudent = {
            StudentId: student?.StudentId,
            StudentName: userName,
            StudentEmail: userEmail,
            PhoneNumber: userPhoneNumber,
            BirthDate: birthDate,
            Address: userAddress,
            AcadYear: student?.AcadYear,
            RoleId: userRole,
            Gender: gender,
            ProfilePictureUrl: profilePictureUrl,
            LearningStyleId: student?.LearningStyleId,
            DepartmentId: student?.DepartmentId,
            CreatedBy: student.CreatedBy,
            CreatedDate: student.CreatedDate,
            UpdatedBy: userData.name,
            UpdatedDate: new Date().toISOString(),
            ActiveFlag: student?.ActiveFlag,
        }

        // console.log(updateStudentData)
        await updateStudent(updateStudentData).then((res) => {
            if(res.statusCode == 200){
                localStorage.setItem('profilePicture', profilePictureUrl ?? "")
                setLoadingStatus(false)
                window.location.href = `/`
            }else{
                alert(res.message)
                setLoadingStatus(false)
            }
        })
    }
  }

  useEffect(() => {
    dispatch(loadUserFromStorage())
    if(userData.role == "Administrator" || userData.role == "Lecturer"){
        fetchStaff(userData.id).then((res) => {
            if(res.statusCode != 200){
                alert(res.message)
            }else{
                setUserName(res.data.StaffName)
                setUserEmail(res.data.StaffEmail)
                setGender(res.data.Gender)
                setUserPhoneNumber(res.data.PhoneNumber)
                setUserAddress(res.data.Address)
                setUserRole(res.data.RoleId)
                setUserBirthDate(parseAbsoluteToLocal(res.data.BirthDate))
                setStaff(res.data)
                setProfilePictureUrl(res.data.ProfilePictureUrl)
                if(res.data.RoleId == "lec818d2-9047-4f39-888a-9848a0bcbbc1"){
                    fetchLecturerCoursesByStaffId(userData.id).then((res3) => {
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
    }else if(userData.role == "Student"){
        fetchStudent(userData.id).then((res) => {
            if(res.statusCode != 200){
                alert(res.message)
            }else{
                setUserName(res.data.StudentName)
                setUserEmail(res.data.StudentEmail)
                setGender(res.data.Gender)
                setUserPhoneNumber(res.data.PhoneNumber)
                setUserAddress(res.data.Address)
                setUserRole(res.data.RoleId)
                setProfilePictureUrl(res.data.ProfilePictureUrl)
                setUserBirthDate(parseAbsoluteToLocal(res.data.BirthDate))
                setStudent(res.data)
            }
        })
        fetchLearningStyle().then((object: any) => {
            const res = object.data.map((z: any) => {
                return{
                    key: z.LearningStyleId,
                    label: z.LearningStyleName,
                }
            })
            setLearningStyleDropdownList(res)
        })
    }
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
    <PageContainer title="Edit Profile" description="Edit Profile">
      <Box component="div">
        <div>
        <form className='ml-6' onSubmit={handleSubmit}>
            <h2 style={{ fontSize: "22px", marginBottom: "20px", fontWeight: "600"}}>Edit Profile</h2>
            <Grid container spacing={2} className="mt-0.5">
                <Grid item xs={12} sm={12} md={12} lg={12} className="mb-4" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Avatar 
                        src={profilePictureUrl ?? 'https://www.w3schools.com/howto/img_avatar.png'}
                        alt='profile picture'
                        onChange={(e: File) => {handleUploadPhoto(e)}}
                        changeLabel={"Edit Profile Picture"}
                        isLoading={isUploadProfilePicture}
                        smartImgFit={"center"}
                        accept='image/*'
                        variant="circle" 
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={6} lg={6} className="mb-2">
                    <Input
                        autoFocus
                        isRequired
                        label="User Name"
                        className="w-full sm:max-w-[80%]"
                        labelPlacement='inside'
                        placeholder="Enter user name"
                        errorMessage="Please do not leave this field empty"
                        isInvalid={userName == "" ? true : false}
                        variant="bordered"
                        onChange={(e) => {setUserName(e.target.value)}}
                        value={userName}
                    />
                </Grid>
                <Grid item xs={6} sm={6} className="mb-2">
                    <Input
                        isDisabled={true}
                        autoFocus
                        isRequired
                        label="User Email" 
                        className="w-full sm:max-w-[80%]"
                        labelPlacement='inside'
                        placeholder="Enter user email"
                        variant="bordered"
                        onChange={(e) => {setUserEmail(e.target.value)}}
                        value={userEmail}
                        isInvalid={!isEmailValid}
                        errorMessage="Please enter a valid email"
                    />
                </Grid>
                <Grid item xs={6} sm={6} className="mb-2">
                    <Input
                        autoFocus
                        isRequired
                        label="User Phone Number"
                        className="w-full sm:max-w-[80%]"
                        labelPlacement='inside'
                        placeholder="Enter user phone number"
                        variant="bordered"
                        onChange={(e) => {setUserPhoneNumber(e.target.value)}}
                        value={userPhoneNumber}
                        isInvalid={!isPhoneNumberValid}
                        errorMessage="Please enter a valid phone number"
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={6} lg={6} className="mb-2">
                    <DatePicker
                        isRequired
                        label="User Birth Date"
                        className="w-full sm:max-w-[80%]"
                        variant='bordered'
                        granularity='day'
                        labelPlacement="inside"
                        onChange={setUserBirthDate}
                        showMonthAndYearPickers
                        value={userBirthDate}
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={6} lg={6} className="mb-2">
                    <Input
                        isRequired
                        autoFocus
                        label="User Address"
                        className="w-full sm:max-w-[80%]"
                        labelPlacement='inside'
                        placeholder="Enter user address"
                        errorMessage="Please do not leave this field empty"
                        isInvalid={userAddress == "" ? true : false}
                        variant="bordered"
                        onChange={(e) => {setUserAddress(e.target.value)}}
                        value={userAddress}
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={6} lg={6} className="mb-2">
                    <Select
                      isRequired
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
                {(userRole == "stu01e3e-bb2b-4c63-a62c-8c7f01f0120c") && (
                    <>
                        <Grid item xs={6} sm={6} md={6} lg={6} className="mb-2">
                            <Select
                                isRequired
                                label= "Learning Style"
                                variant="bordered"
                                placeholder="Select your preferred learning style"
                                errorMessage={ isLearningStyleValid || !touched2 ? "" : "You need to select a learning style"}
                                isInvalid={ isLearningStyleValid || !touched2 ? false: true}
                                selectedKeys={[student.LearningStyleId ?? ""]}
                                className="w-full sm:max-w-[80%]"
                                onChange={(e) => {setStudent({...student, LearningStyleId: e.target.value})}}
                                onClose={() => setTouched2(true)}
                                value={student.LearningStyleId ?? ""}
                                >
                                {learningStyleDropdownList.map((major: SelectList) => (
                                    <SelectItem key={major.key}>
                                    {major.label}
                                    </SelectItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid item xs={6} sm={6} md={6} lg={6} className="mb-2">
                            <Input
                                isDisabled
                                label= "Study Program"
                                variant="bordered"
                                className="w-full sm:max-w-[80%]"
                                value={departmentDropdownList.find(x => x.key == student.DepartmentId)?.label}
                            />
                        </Grid>
                    </>
                )}
                {(userRole == "lec818d2-9047-4f39-888a-9848a0bcbbc1") && (
                    <>
                        <Grid item xs={6} sm={6} md={6} lg={6} className="mb-2">
                            <Select
                                required
                                isDisabled
                                label= "Course"
                                selectionMode="multiple"
                                variant="bordered"
                                placeholder="Select course"
                                selectedKeys={courses}
                                className="w-full sm:max-w-[80%]"
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

export default EditProfile;