'use server'

import { createClient } from "../../../../utils/supabase/server";
import { MsAssessment } from "../data-model";

const supabase = createClient();

export async function fetchActivePeriod() {
    const { data, error } = await supabase.rpc("fetch_active_academic_period").limit(1)
    if(error){
        return {success: false, message: error.message, data: []}
    }
    return {success: true, message: 'Academic Period fetched successfully!', data: data}
}

export async function fetchLecturerClassCourse(userId: string, academicPeriodId: string) {
    const { data, error } = await supabase.rpc("fetch_lecturer_class_course", {user_id: userId, academic_period_id: academicPeriodId})
    if(error){
        return {success: false, message: error.message, data: []}
    }
    return {success: true, message: 'Class fetched successfully!', data: data}
}

export async function fetchAssessment(courseId: string, classId: string, academicPeriodId: string) {
    const { data, error } = await supabase.rpc('fetch_assessment', {course_id: courseId, class_id: classId, academic_period_id: academicPeriodId})
    if(error){
        return {success: false, message: error.message, data: []}
    }
    return {success: true, message: 'Assessment fetched successfully!', data: data}
}

export async function fetchTotalSession(courseId: string){
    const { data, error } = await supabase.from('MsCourse').select('NumOfSession, TotalCredits').eq('CourseId', courseId)
    if(error){
        return {success: false, message: error.message, data: []}
    }
    return {success: true, message: 'Data fetched successfully!', data: data}
}

export async function createAssessment(item: MsAssessment){
    const res = await supabase.from('CourseDetail').select().eq('CourseId', item.CourseId).eq('SessionNumber', item.SessionNumber).limit(1).single()
    item.SessionId = res.data.SessionId
    const { data, error } = await supabase.from('MsAssessment').insert(item)
    if(error){
        return {success: false, message: error.message, data: []}
    }
    return {success: true, message: 'Data inserted successfully!', data: data}
}

export async function updateAssessment(item: MsAssessment){
    const res = await supabase.from('CourseDetail').select().eq('CourseId', item.CourseId).eq('SessionNumber', item.SessionNumber).limit(1).single()
    item.SessionId = res.data.SessionId
    const { data, error } = await supabase.from('MsAssessment').update(item).eq('AssessmentId', item.AssessmentId)
    if(error){
        return {success: false, message: error.message, data: []}
    }
    return {success: true, message: 'Data updated successfully!', data: data}
}

export async function deleteAssessment(assessmentId: string){
    const { data, error } = await supabase.from('MsAssessment').delete().eq('AssessmentId', assessmentId)
    if(error){
        return {success: false, message: error.message, data: []}
    }
    return {success: true, message: 'Data deleted successfully!', data: data}
}

