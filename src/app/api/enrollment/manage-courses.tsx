'use server'

import { createClient } from "../../../../utils/supabase/server"
import { MsCourse } from "../../api/data-model"

const supabase = createClient()

export async function createCourse(course: MsCourse) {
    if(course.CourseName == "") {
        let object = {
            data: [],
            statusCode: 400,
            message: 'Course name cannot be empty!',
            type: 'name'
        }
        return object
    }
    if(course.NumOfSession == 0){
        let object = {
            data: [],
            statusCode: 400,
            message: 'Number of session cannot be 0!',
            type: 'session'
        }
        return object
    }
    if(course.TotalCredits == 0){
        let object = {
            data: [],
            statusCode: 400,
            message: 'Total credits cannot be 0!',
            type: 'credits'
        }
        return object
    }
    const { data, error } = await supabase.from('MsCourse').select().eq('CourseName', course.CourseName).single()
    if(error){
        const { data, error } = await supabase.from('MsCourse').insert(course)
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
            message: 'Course created successfully!'
        }
        return object;
    }
    let object = {
        data: [],
        statusCode: 400,
        message: 'Course that you inputed is already exist!'
    }
    return object
}

export async function updateCourse(course: MsCourse) {
    if(course.CourseName == ""){
        let object = {
            data: [],
            statusCode: 400,
            message: 'Course name cannot be empty!',
            type: 'name'
        }
        return object;
    }
    if(course.NumOfSession == 0){
        let object = {
            data: [],
            statusCode: 400,
            message: 'Number of session cannot be 0!',
            type: 'session'
        }
        return object;
    }
    if(course.TotalCredits == 0){
        let object = {
            data: [],
            statusCode: 400,
            message: 'Total credits cannot be 0!',
            type: 'credits'
        }
        return object;
    }
    const { data, error } = await supabase.from('MsCourse').select().eq('CourseName', course.CourseName).neq('CourseId', course.CourseId).single()
    if(error){
        const { data, error } = await supabase.from('MsCourse').update(course).eq('CourseId', course.CourseId)
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
            message: 'Course updated successfully!'
        }
        return object; 
    }

    let object = {
        data: [],
        statusCode: 400,
        message: 'Course that you inputed is already exist!'
    }
    return object;
}

export async function deleteCourse(courseId: string) {
    const { data, error } = await supabase.from('MsCourse').delete().eq('CourseId', courseId)
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
        message: 'Course deleted successfully!'
    }
    return object;
}
  
export async function fetchCourses() {
    const { data, error } = await supabase.from('MsCourse').select()
    if (error){
        console.log('error', error); 
        let object = {
            data: [],
            statusCode: 400,
            message: error.message
        }
        return object;
    };
    
    let object = {
        data: data,
        statusCode: 200,
        message: 'Courses fetched successfully!'
    }
    return object;
}
