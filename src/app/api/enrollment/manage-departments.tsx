'use server'

import { createClient } from "../../../../utils/supabase/server"
import { MsFaculty, MsDepartment, MsCourse, DepartmentCourse } from "../../api/data-model"

const supabase = createClient()

export async function createDepartment(department: MsDepartment) {
    if(department.DepartmentName == "") {
        let object = {
            data: [],
            statusCode: 400,
            message: 'Department name cannot be empty!'
        }
        return object
    }
    const { data, error } = await supabase.from('Department').select().eq('DepartmentName', department.DepartmentName).single()
    if(error){
        const { data, error } = await supabase.from('Department').insert(department)
        if (error){
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
            message: 'Department created successfully!'
        }
        return object;
    }
    let object = {
        data: [],
        statusCode: 409,
        message: 'Department that you inputed is already exist in the database!'
    }
    return object
}

export async function updateDepartment(department: MsDepartment) {
    if(department.DepartmentName == ""){
        let object = {
            data: [],
            statusCode: 400,
            message: 'Department name cannot be empty!'
        }
        return object;
    }
    const { data, error } = await supabase.from('Department').select().eq('DepartmentName', department.DepartmentName).single()
    if(error){
        const { data, error } = await supabase.from('Department').update(department).eq('DepartmentId', department.DepartmentId)
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
            message: 'Department updated successfully!'
        }
        return object; 
    }

    let object = {
        data: [],
        statusCode: 409,
        message: 'Department that you inputed is already exist in the database!'
    }
    return object;
}

export async function deleteDepartment(departmentId: string) {
    const { data, error } = await supabase.from('Department').delete().eq('DepartmentId', departmentId)
    if(error){
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
        message: 'Department deleted successfully!'
    }
    return object;
}
  
export async function fetchFaculties() {
    const { data, error } = await supabase.from('MsFaculty').select()
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
        message: 'Faculties fetched successfully!'
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

export async function fetchDepartment(departmentId: string) {
    const { data, error } = await supabase.from('Department').select().eq('DepartmentId', departmentId).single()
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
        message: 'Department fetched successfully!'
    }
    return object;
}

export async function fetchDepartmentCourses(departmentId: string) {
    const { data, error } = await supabase.from('DepartmentCourse').select().eq('DepartmentId', departmentId)
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
        message: 'Department courses fetched successfully!'
    }
    return object;
}

export async function fetchDepartments(facultyId: string) {
    const { data, error } = await supabase.from('Department').select().eq('FacultyId', facultyId)
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
        message: 'Departments fetched successfully!'
    }
    return object;
}

export async function createDepartmentCourse(departmentCourse: DepartmentCourse) {
    const { data, error } = await supabase.from('DepartmentCourse').select().eq('DepartmentId', departmentCourse.DepartmentId).eq('CourseId', departmentCourse.CourseId).single()
    if(error){
        const { data, error } = await supabase.from('DepartmentCourse').insert(departmentCourse)
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
            message: 'Department course created successfully!'
        }
        return object;
    }
    let object = {
        data: [],
        statusCode: 409,
        message: 'Department course that you inputed is already exist in the database!'
    }
    return object
}

export async function deleteDepartmentCourse(departmentId: string, courseId: string) {
    const { data, error } = await supabase.from('DepartmentCourse').delete().eq('DepartmentId', departmentId).eq('CourseId', courseId)
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
        message: 'Department course deleted successfully!'
    }
    return object;
}