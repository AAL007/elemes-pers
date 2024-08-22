'use server'

import { createClient } from "../../../../utils/supabase/server";

const supabase = createClient()

const formatDate = (date: Date) => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// Administrator

const fetchingCourseNotMapped = async () => {
    const courses = await supabase.from('MsCourse').select('CourseId').eq('ActiveFlag', true)
    if(courses.error) {
        return {success: false, message: courses.error, data: []}
    }
    const departmentCourses = await supabase.from('DepartmentCourse').select().eq('ActiveFlag', true)
    if(departmentCourses.error) {return {success: false, message: departmentCourses.error, data: []}}
    const departmentCoursesIds = departmentCourses.data.map((e: any) => e.CourseId)
    const courseNotHaveBeenMapped = courses.data?.filter((s: any) => !departmentCoursesIds.includes(s.CourseId)).length
    return courseNotHaveBeenMapped
}

const fetchingFacultiesNotHaveDepartment= async () => {
    const faculties = await supabase.from('MsFaculty').select('FacultyId').eq('ActiveFlag', true)
    if(faculties.error) {
        return {success: false, message: faculties.error, data: []}
    }
    const Departments = await supabase.from('Department').select().eq('ActiveFlag', true)
    if(Departments.error) {return {success: false, message: Departments.error, data: []}}
    const departmentFacultyIds = Departments.data.map((e: any) => e.FacultyId)
    const facultiesNotHaveDepartment = faculties.data?.filter((s: any) => !departmentFacultyIds.includes(s.FacultyId)).length
    return facultiesNotHaveDepartment
}

const fetchingUpcomingAcademicPeriod = async () => {
    const academicPeriodRes = await supabase.from('MsAcademicPeriod').select().eq('ActiveFlag', true).gt('EffectiveStartDate', new Date().toISOString()).limit(1)
    if(academicPeriodRes.error) {
        return {success: false, message: academicPeriodRes.error, data: []}
    }
    return {success: true, message: 'Academic Period fetched successfully!', data: academicPeriodRes.data}
}

const fetchingStudentNotEnrolled = async () => {
    const studentRes = await supabase.from('MsStudent').select('StudentId').eq('ActiveFlag', true)
    if(studentRes.error) {
        return {success: false, message: studentRes.error, data: []}
    }
    const enrollmentRes = await supabase.from('Enrollment').select().eq('ActiveFlag', true)
    if(enrollmentRes.error) {return {success: false, message: enrollmentRes.error, data: []}}
    const enrolledStudentIds = enrollmentRes.data.map((e: any) => e.StudentId)
    const studentsNotEnrolled = studentRes.data?.filter((s: any) => !enrolledStudentIds.includes(s.StudentId)).length
    return studentsNotEnrolled
}

const fetchingClassNotEnrolled = async () => {
    const classRes = await supabase.from('Class').select('ClassId').eq('ActiveFlag', true)
    if(classRes.error) {
        return {success: false, message: classRes.error, data: []}
    }
    const enrollmentRes2 = await supabase.from('Enrollment').select().eq('ActiveFlag', true)
    if(enrollmentRes2.error) {return {success: false, message: enrollmentRes2.error, data: []}}
    const enrolledClassIds = enrollmentRes2.data.map((e: any) => e.ClassId)
    const classesNotEnrolled = classRes.data?.filter((c: any) => !enrolledClassIds.includes(c.ClassId)).length
    return classesNotEnrolled
}

export async function fetchAdministratorNotification(){
    let studentsNotEnrolled = await fetchingStudentNotEnrolled();
    let academicPeriodRes = await fetchingUpcomingAcademicPeriod();
    let classesNotEnrolled = await fetchingClassNotEnrolled();

    let data = [
        studentsNotEnrolled != 0 ? {message: `There are ${studentsNotEnrolled} students not enrolled in any class`, category: 'Student'} : '',
        classesNotEnrolled != 0 ? {message: `There are ${classesNotEnrolled} classes not enrolled by any student`, category: 'Class'} : '',
        {message: `The deadline to enroll students is ${new Date(academicPeriodRes.data[0].EffectiveStartDate).toISOString().slice(0, 10)}`, category: 'Enrollment'}
    ]
    
    return {success: true, message: 'Notifications fetched successfully!', data: data}
}

export async function fetchToDoList(){
    let studentsNotEnrolled = await fetchingStudentNotEnrolled();
    let academicPeriodRes = await fetchingUpcomingAcademicPeriod();
    let classesNotEnrolled = await fetchingClassNotEnrolled();
    let facultiesNotHaveDepartment = await fetchingFacultiesNotHaveDepartment();
    let courseNotHaveBeenMapped = await fetchingCourseNotMapped();

    let data = [
        studentsNotEnrolled != 0 ? {message: `Students that have not been enrolled`, quantity: studentsNotEnrolled, deadline: new Date(academicPeriodRes.data[0].EffectiveStartDate).toISOString().slice(0, 10)} : "",
        classesNotEnrolled != 0 ? {message: `Classes that have not been enrolled`, quantity: classesNotEnrolled, deadline: new Date(academicPeriodRes.data[0].EffectiveStartDate).toISOString().slice(0, 10)} : "",
        facultiesNotHaveDepartment != 0 ? {message: `Faculties that have not been assigned to any department`, quantity: facultiesNotHaveDepartment, deadline: new Date(academicPeriodRes.data[0].EffectiveStartDate).toISOString().slice(0, 10)} : "",
        courseNotHaveBeenMapped != 0 ? {message: `Courses that have not been mapped to any department`, quantity: courseNotHaveBeenMapped, deadline: new Date(academicPeriodRes.data[0].EffectiveStartDate).toISOString().slice(0, 10)} : ""
    ]
    
    return {success: true, message: 'Notifications fetched successfully!', data: data}
}

export async function fetchAdministratorRecentActivities(userName: string) {
    const now = new Date()
    const today = formatDate(now)

    const classActivity = await supabase.from('Class').select().or(`CreatedBy.eq.${userName}, UpdatedBy.eq.${userName}`)
    if(classActivity.error) {
        return {success: false, message: classActivity.error, data: []}
    }

    console.log(classActivity.data)
    let returnObj = classActivity.data
        .filter((c: any) => {
            const createdDate = new Date(c.CreatedDate).toISOString().split('T')[0];
            const updatedDate = c.UpdatedDate ? new Date(c.UpdatedDate).toISOString().split('T')[0] : null;
            return createdDate === today || updatedDate === today;
        })    
        .map((c: any) => {
            const date = new Date(c.UpdatedBy == null ? c.CreatedDate : c.UpdatedDate);
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const time = `${hours}:${minutes}`;
            return {
                activity: (c.UpdatedBy == null && c.ActiveFlag) ? 'Create' : (c.UpdatedBy != null && c.ActiveFlag) ? 'Update' : 'Delete',
                message: `Class ${c.ClassName} has been ${(c.UpdatedBy == null && c.ActiveFlag) ? 'created' : (c.UpdatedBy != null && c.ActiveFlag) ? 'updated' : 'deleted'}`,
                time: time
            }
        })

    const roleActivity = await supabase.from('MsRole').select().or(`CreatedBy.eq.${userName}, UpdatedBy.eq.${userName}`)
    if(roleActivity.error) {
        return {success: false, message: roleActivity.error, data: []}
    }

    returnObj = returnObj.concat(roleActivity.data
        .filter((c: any) => {
            const createdDate = new Date(c.CreatedDate).toISOString().split('T')[0];
            const updatedDate = c.UpdatedDate ? new Date(c.UpdatedDate).toISOString().split('T')[0] : null;
            return createdDate === today || updatedDate === today;
        })
        .map((r: any) => {
        const date = new Date(r.UpdatedBy == null ? r.CreatedDate : r.UpdatedDate);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const time = `${hours}:${minutes}`;
        return {
            activity: (r.UpdatedBy == null && r.ActiveFlag) ? 'Create' : (r.UpdatedBy != null && r.ActiveFlag) ? 'Update' : 'Delete',
            message: `Role ${r.RoleName} has been ${r.UpdatedBy == null && r.ActiveFlag ? 'created' : r.UpdatedBy != null && r.ActiveFlag ? 'updated' : 'deleted'}`,
            time: time
        }
    }))

    const courseActivity = await supabase.from('MsCourse').select().or(`CreatedBy.eq.${userName}, UpdatedBy.eq.${userName}`)
    if(courseActivity.error) {
        return {success: false, message: courseActivity.error, data: []}
    }

    returnObj = returnObj.concat(courseActivity.data
        .filter((c: any) => {
            const createdDate = new Date(c.CreatedDate).toISOString().split('T')[0];
            const updatedDate = c.UpdatedDate ? new Date(c.UpdatedDate).toISOString().split('T')[0] : null;
            return createdDate === today || updatedDate === today;
        })
        .map((c: any) => {
        const date = new Date(c.UpdatedBy == null ? c.CreatedDate : c.UpdatedDate);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const time = `${hours}:${minutes}`;
        return {
            activity: (c.UpdatedBy == null && c.ActiveFlag) ? 'Create' : (c.UpdatedBy != null && c.ActiveFlag) ? 'Update' : 'Delete',
            message: `Course ${c.CourseName} has been ${c.UpdatedBy == null && c.ActiveFlag ? 'created' : c.UpdatedBy != null && c.ActiveFlag ? 'updated' : 'deleted'}`,
            time: time
        }
    }))

    const staffActivity = await supabase.from('MsStaff').select().or(`CreatedBy.eq.${userName}, UpdatedBy.eq.${userName}`)
    if(staffActivity.error) {
        return {success: false, message: staffActivity.error, data: []}
    }

    returnObj = returnObj.concat(staffActivity.data
        .filter((c: any) => {
            const createdDate = new Date(c.CreatedDate).toISOString().split('T')[0];
            const updatedDate = c.UpdatedDate ? new Date(c.UpdatedDate).toISOString().split('T')[0] : null;
            return createdDate === today || updatedDate === today;
        })
        .map((s: any) => {
        const date = new Date(s.UpdatedBy == null ? s.CreatedDate : s.UpdatedDate);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const time = `${hours}:${minutes}`;
        return {
            activity: (s.UpdatedBy == null && s.ActiveFlag) ? 'Create' : (s.UpdatedBy != null && s.ActiveFlag) ? 'Update' : 'Delete',
            message: `Staff ${s.StaffName} has been ${s.UpdatedBy == null && s.ActiveFlag ? 'created' : s.UpdatedBy != null && s.ActiveFlag ? 'updated' : 'deleted'}`,
            time: time
        }
    }))

    const studentActivity = await supabase.from('MsStudent').select().or(`CreatedBy.eq.${userName}, UpdatedBy.eq.${userName}`)
    if(studentActivity.error) {
        return {success: false, message: studentActivity.error, data: []}
    }

    returnObj = returnObj.concat(studentActivity.data
        .filter((c: any) => {
            const createdDate = new Date(c.CreatedDate).toISOString().split('T')[0];
            const updatedDate = c.UpdatedDate ? new Date(c.UpdatedDate).toISOString().split('T')[0] : null;
            return createdDate === today || updatedDate === today;
        })
        .map((s: any) => {
        const date = new Date(s.UpdatedBy == null ? s.CreatedDate : s.UpdatedDate);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const time = `${hours}:${minutes}`;
        return {
            activity: (s.UpdatedBy == null && s.ActiveFlag) ? 'Create' : (s.UpdatedBy != null && s.ActiveFlag) ? 'Update' : 'Delete',
            message: `Student ${s.StudentName} has been ${s.UpdatedBy == null && s.ActiveFlag ? 'created' : s.UpdatedBy != null && s.ActiveFlag ? 'updated' : 'deleted'}`,
            time: time
        }
    }))

    const enrollmentActivity = await supabase.from('Enrollment').select().or(`CreatedBy.eq.${userName}, UpdatedBy.eq.${userName}`)
    if(enrollmentActivity.error) {
        return {success: false, message: enrollmentActivity.error, data: []}
    }

    returnObj = returnObj.concat(enrollmentActivity.data
        .filter((c: any) => {
            const createdDate = new Date(c.CreatedDate).toISOString().split('T')[0];
            const updatedDate = c.UpdatedDate ? new Date(c.UpdatedDate).toISOString().split('T')[0] : null;
            return createdDate === today || updatedDate === today;
        })
        .map((e: any) => {
        const date = new Date(e.UpdatedBy == null ? e.CreatedDate : e.UpdatedDate);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const time = `${hours}:${minutes}`;
        return {
            activity: (e.UpdatedBy == null && e.ActiveFlag) ? 'Create' : (e.UpdatedBy != null && e.ActiveFlag) ? 'Update' : 'Delete',
            message: `Enrollment ${e.StudentId} has been ${e.UpdatedBy == null && e.ActiveFlag ? 'created' : e.UpdatedBy != null && e.ActiveFlag ? 'updated' : 'deleted'}`,
            time: time
        }
    }))

    const departmentActivity = await supabase.from('Department').select().or(`CreatedBy.eq.${userName}, UpdatedBy.eq.${userName}`)
    if(departmentActivity.error) {
        return {success: false, message: departmentActivity.error, data: []}
    }

    returnObj = returnObj.concat(departmentActivity.data
        .filter((c: any) => {
            const createdDate = new Date(c.CreatedDate).toISOString().split('T')[0];
            const updatedDate = c.UpdatedDate ? new Date(c.UpdatedDate).toISOString().split('T')[0] : null;
            return createdDate === today || updatedDate === today;
        })
        .map((d: any) => {
        const date = new Date(d.UpdatedBy == null ? d.CreatedDate : d.UpdatedDate);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const time = `${hours}:${minutes}`;
        return {
            activity: (d.UpdatedBy == null && d.ActiveFlag) ? 'Create' : (d.updatedBy != null && d.ActiveFlag) ? 'Update' : 'Delete',
            message: `Department ${d.DepartmentName} has been ${d.UpdatedBy == null && d.ActiveFlag ? 'created' : d.UpdatedBy != null && d.ActiveFlag ? 'updated' : 'deleted'}`,
            time: time
        }
    }))

    return {success: true, message: 'Notifications fetched successfully!', data: returnObj}
}

export async function fetchStudentsEnrolled() {
    const enrolledRes = await supabase.from('Enrollment').select('StudentId, CreatedDate').eq('ActiveFlag', true)
    if(enrolledRes.error) {
        return {success: false, message: enrolledRes.error, data: []}
    }

    return {success: true, message: 'Students fetched successfully!', data: enrolledRes.data}
}

export async function fetchTotalActiveClass() {
    const totalActiveClasses = await supabase.from('Class').select('ClassId, ActiveFlag')
    if(totalActiveClasses.error) {
        return {success: false, message: totalActiveClasses.error, data: []}
    }

    return {success: true, message: 'Classes fetched successfully!', data: totalActiveClasses.data}
}

export async function fetchTotalActiveUser() {
    const res = await supabase.from('MsStaff').select('StaffId, RoleId, MsRole (RoleId, RoleName)').eq('ActiveFlag', true)
    if(res.error){
        return {success: false, message: res.error, data: []}
    }

    const res2 = await supabase.from('MsStudent').select('StudentId, RoleId, MsRole (RoleId, RoleName)').eq('ActiveFlag', true)
    if(res2.error){
        return {success: false, message: res2.error, data: []}
    }

    let returnObj = res.data.map((r: any) => {
        return {
            userId: r.StaffId,
            roleName: r.MsRole.RoleName
        }
    })

    returnObj = returnObj.concat(res2.data.map((r: any) => {
        return {
            userId: r.StudentId,
            roleName: r.MsRole.RoleName
        }
    })) 

    return {success: true, message: 'Users fetched successfully!', data: returnObj}
}

// Student

export async function fetchStudentNotification() {

}

// Lecturer

export async function fetchLecturerNotification() {

}

