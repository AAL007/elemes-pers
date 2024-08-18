'use client'

import { createClient } from "../../../../utils/supabase/client"
import { Enrollment } from "../../api/data-model"

const supabase = createClient()

export async function createEnrollment(enroll: Enrollment) {
    const { data, error } = await supabase.from('Enrollment').insert(enroll)
    if (error){
        console.log('error', error);
        let object = {
            data: [],
            statusCode: 400,
            message: error.message
        }
        return object;
    }
    let object = {
        data: data,
        statusCode: 200,
        message: 'Enrollment created successfully!'
    }
    return object;
}

export async function deleteEnrollment(classId: string, StudentId: string) {
    const { data, error } = await supabase.from('Enrollment').delete().eq('ClassId', classId).eq('StudentId', StudentId).single()
    if (error){
        console.log('error', error);
        let object = {
            data: [],
            statusCode: 400,
            message: error.message
        }
        return object;
    }
    let object = {
        data: data,
        statusCode: 200,
        message: 'Enrollment removed successfully!'
    }
    return object;
}

export async function fetchEnrollment(classId: string){
    const { data, error } = await supabase.from('Enrollment').select().eq('ClassId', classId)
    if (error){
        console.log('error', error);
        let object = {
            data: [],
            statusCode: 400,
            message: error.message
        }
        return object;
    }
    let object = {
        data: data,
        statusCode: 200,
        message: 'Enrollment fetched successfully!'
    }
    return object;
}

export async function fetchStudentsByDepartmentId(departmentId: string){
    const { data, error } = await supabase.from('MsStudent').select().eq('DepartmentId', departmentId)
    if (error){
        console.log('error', error);
        let object = {
            data: [],
            statusCode: 400,
            message: error.message
        }
        return object;
    }
    let object = {
        data: data,
        statusCode: 200,
        message: 'Students fetched successfully!'
    }
    return object;
}
