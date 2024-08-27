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
    const { data, error } = await supabase.from('CourseDetail').update(item).eq('CourseId', item.CourseId).eq('SessionNumber', item.SessionNumber)
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data updated successfully!'}
}

export async function updateCourseDetailSessionNumber(courseId: string, sourceSessionNumber: number, destinationSessionNumber: number){
    const datas = await supabase.from('CourseDetail').select('*').eq('CourseId', courseId).in('SessionNumber', [`${sourceSessionNumber}`, `${destinationSessionNumber}`]).limit(2)
    if(datas.error){
        console.log(datas.error.message)
        return {success: false, data: [], message: datas.error.message}
    }
    const sourceData = datas.data.find(data => data.SessionNumber === sourceSessionNumber);
    const destinationData = datas.data.find(data => data.SessionNumber === destinationSessionNumber);
    const updateSourceData = await supabase.from('CourseDetail').update({SessionNumber: 0}).eq('CourseId', courseId).eq('SessionName', sourceData.SessionName)
    if(updateSourceData.error){
        console.log(updateSourceData.error.message)
        return {success: false, data: [], message: updateSourceData.error.message}
    }
    const updateDestinationData = await supabase.from('CourseDetail').update({SessionNumber: sourceSessionNumber}).eq('CourseId', courseId).eq('SessionName', destinationData.SessionName)
    if(updateDestinationData.error){
        console.log(updateDestinationData.error.message)
        return {success: false, data: [], message: updateDestinationData.error.message}
    }
    const updateSourceData2 = await supabase.from('CourseDetail').update({SessionNumber: destinationSessionNumber}).eq('CourseId', courseId).eq('SessionName', sourceData.SessionName)
    if(updateSourceData2.error){
        console.log(updateSourceData2.error.message)
        return {success: false, data: [], message: updateSourceData2.error.message}
    }
    return {success: true, data: [], message: 'Data updated successfully!'}
}

export async function deleteCourseDetail(courseId: string, sessionNumber: number){
    const { data, error } = await supabase.from('CourseDetail').delete().eq('CourseId', courseId).eq('SessionNumber', sessionNumber)
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data deleted successfully!'}
}