'use server'

import { createClient } from "../../../../utils/supabase/server";

const supabase = createClient()

const formatDate = (date: Date) => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// Administrator
export async function fetchAdministratorNotification(){
    const res = await supabase.rpc('fetch_administrator_notification')
    if(res.error){
        return {success: false, message: res.error.message, data: []}
    }

    const deadline = await supabase.rpc('fetch_administrative_deadline')
    if(deadline.error){
        return {success: false, message: deadline.error.message, data: []}
    }

    let deadlineRes = {Message: `The deadline to enroll students is ${deadline.data[0].EnrollmentDeadline}`, Entity: 'Enrollment'}
    let data = [...res.data, deadlineRes]
    data = data.filter((x: any) => x.Message != "")
    
    return {success: true, message: 'Notifications fetched successfully!', data: data}
}

export async function fetchToDoList(){
    const res = await supabase.rpc('fetch_to_do_list')
    const deadline = await supabase.rpc('fetch_administrative_deadline')
    if(deadline.error){
        return {success: false, message: deadline.error.message, data: []}
    }
    if(res.error){
        return {success: false, message: res.error.message, data: []}
    }

    let data = res.data.filter((x: any) => x.Message != "")
    
    return {success: true, message: 'Notifications fetched successfully!', data: data, deadline: deadline.data}
}

export async function fetchAdministratorRecentActivities(userName: string) {
    const res = await supabase.rpc('fetch_administrator_recent_activity', {user_name: userName}).limit(100)
    if(res.error){
        return {success: false, message: res.error.message, data: []}
    }

    let data = res.data.map((z: any) => {
        return {
            activity: z.Operation,
            message: `${z.Entity} ${z.Object} has been ${z.Operation}`,
            time: z.Time
        }
    })

    return {success: true, message: 'Notifications fetched successfully!', data: data}
}

export async function fetchStudentsEnrolled(month: number, year: number) {
    const enrolledRes = await supabase.rpc('fetch_students_enrolled', {month_input: month, year_input: year}).limit(31)
    if(enrolledRes.error) {
        return {success: false, message: enrolledRes.error.message, data: []}
    }

    return {success: true, message: 'Students fetched successfully!', data: enrolledRes.data}
}

export async function fetchTotalActiveClass() {
    const totalActiveClasses = await supabase.rpc('fetch_active_class')
    if(totalActiveClasses.error) {
        return {success: false, message: totalActiveClasses.error.message, data: []}
    }

    return {success: true, message: 'Classes fetched successfully!', data: totalActiveClasses.data}
}

export async function fetchTotalActiveUser() {
    const res = await supabase.rpc('fetch_active_users')
    if(res.error){
        return {success: false, message: res.error.message, data: []}
    }

    return {success: true, message: 'Users fetched successfully!', data: res.data}
}

// Student

export async function fetchStudentNotification() {

}

// Lecturer
export async function fetchLecturerBarChart(courseId: string, classId: string, academicPeriodId: string) {
    const { data, error } = await supabase.rpc('fetch_lecturer_bar_chart', {course_id: courseId, class_id: classId, academic_period_id: academicPeriodId})
    if(error){
        return {success: false, message: error.message, data: []}
    }
    return {success: true, message: 'Data fetched successfully!', data: data}
}

export async function fetchActiveClassStudents(lecturerId: string){
    const res = await supabase.rpc('fetch_active_class_students', {lecturer_id: lecturerId})
    if(res.error){
        return {success: false, message: res.error.message, data: []}
    }

    return {success: true, message: 'Data fetched successfully!', data: res.data}
}

export async function fetchActiveAssignmentClass(lecturerId: string){
    const res = await supabase.rpc('fetch_active_assignment_class', {lecturer_id: lecturerId})
    if(res.error){
        return {success: false, message: res.error.message, data: []}
    }

    return {success: true, message: 'Data fetched successfully!', data: res.data}
}

export async function fetchLecturerRecentActivity(userName: string, userId: string){
    const res = await supabase.rpc('fetch_lecturer_recent_activity', {user_name: userName, user_id: userId})
    if(res.error){
        return {success: false, message: res.error.message, data: []}
    }

    let data = res.data.map((z: any) => {
        return {
            activity: z.Operation,
            message: `${z.Entity} ${z.Object} has been ${z.Operation}`,
            time: z.Time
        }
    })

    return {success: true, message: 'Notifications fetched successfully!', data: data}
}

export async function fetchLecturerToDoList(userId: string){
    let res = await supabase.rpc('fetch_lecturer_to_do_list', {user_id: userId})
    if(res.error){
        return {success: false, message: res.error.message, data: []}
    }
    return {success: true, message: 'Notifications fetched successfully!', data: res.data}
}

export async function fetchLecturerNotification(lecturerId: string) {
    let res = await supabase.rpc('fetch_lecturer_notification', {lecturer_id: lecturerId})
    if(res.error){
        return {success: false, message: res.error.message, data: []}
    }
    return {success: true, message: 'Notifications fetched successfully!', data: res.data}
}

