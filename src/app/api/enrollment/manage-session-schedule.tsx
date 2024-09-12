'use server'

import { createClient } from "../../../../utils/supabase/server"
import { SessionSchedule } from "../data-model"

const supabase = createClient()

export async function fetchCourse() {
    const { data, error } = await supabase.from('MsCourse').select('CourseId, CourseName').eq('ActiveFlag', true)
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data fetched successfully!'}
}

export async function fetchSessionSchedule(classId: string, courseId: string){
    const { data, error } = await supabase.rpc('fetch_session_schedule', {class_id: classId, course_id: courseId})
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data fetched successfully!'}
}

export async function fetchCourseDetail(courseId: string){
    const { data, error } = await supabase.from('CourseDetail').select().eq('CourseId', courseId).order('SessionNumber', {ascending: true})
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data fetched successfully!'}
}

export async function createsessionSchedule(item: SessionSchedule){
    const { data, error } = await supabase.from('SessionSchedule').insert(item)
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data inserted successfully!'}
}

export async function updateSessionSchedule(item: SessionSchedule){
    const { data, error } = await supabase.from('SessionSchedule').update(item).eq('SessionId', item.SessionId).eq('ClassId', item.ClassId)
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data updated successfully!'}
}

export async function deleteSessionSchedule(sessionId: string, classId: string){
    const { data, error } = await supabase.from('SessionSchedule').delete().eq('SessionId', sessionId).eq('ClassId', classId)
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data deleted successfully!'}
}