'use server'

import { createClient } from "../../../../utils/supabase/server"
import { CourseDetail } from "../data-model"

const supabase = createClient()

export async function fetchCourse() {
    const { data, error } = await supabase.from('MsCourse').select('CourseId, CourseName').eq('ActiveFlag', true)
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

export async function createCourseDetail(item: CourseDetail){
    let msCourse = await supabase.from('MsCourse').select('NumOfSession, TotalCredits').eq('CourseId', item.CourseId)
    if(msCourse.error){
        return {success: false, data: [], message: msCourse.error.message}
    }
    let maximumSession = msCourse.data[0].NumOfSession * msCourse.data[0].TotalCredits
    if(item.SessionNumber > maximumSession){
        return {success: false, data: [], message: 'Session number cannot be more than total credits multiplied by number of session!'}
    }
    const { data, error } = await supabase.from('CourseDetail').insert(item)
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data inserted successfully!'}
}

export async function updateCourseDetail(item: CourseDetail){
    const { data, error } = await supabase.from('CourseDetail').update(item).eq('SessionId', item.SessionId)
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data updated successfully!'}
}

export async function deleteCourseDetail(sessionId: string){
    const { data, error } = await supabase.from('CourseDetail').delete().eq('SessionId', sessionId)
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data deleted successfully!'}
}