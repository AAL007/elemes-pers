'use server'

import { createClient } from "../../../../utils/supabase/server"

const supabase = createClient()

export async function fetchCourseList(studentId: string, academicPeriodId: string) {
    const { data, error } = await supabase.rpc('fetch_course_list', {student_id: studentId, academic_period_id: academicPeriodId})
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data fetched successfully!'}
}

export async function fetchLecturerCourseList(staffId: string, academicPeriodId: string) {
    const { data, error } = await supabase.rpc('fetch_lecturer_course_list', {staff_id: staffId, academic_period_id: academicPeriodId})
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data fetched successfully!'}
}