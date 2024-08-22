'use client'

import { createClient } from "../../../../utils/supabase/client"
import { MsFaculty } from "../../api/data-model"

const supabase = createClient()

export async function createFaculty(faculty: MsFaculty) {
    if(faculty.FacultyName == "") {
        let object = {
            data: [],
            statusCode: 400,
            message: 'Faculty name cannot be empty!'
        }
        return object
    }
    const { data, error } = await supabase.from('MsFaculty').select().eq('FacultyName', faculty.FacultyName).single()
    if(error){
        const { data, error } = await supabase.from('MsFaculty').insert(faculty)
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
            message: 'Faculty created successfully!'
        }
        return object;
    }
    let object = {
        data: [],
        statusCode: 400,
        message: 'Faculty that you inputed is already exist!'
    }
    return object
}

export async function updateFaculty(faculty: MsFaculty) {
    if(faculty.FacultyName == ""){
        let object = {
            data: [],
            statusCode: 400,
            message: 'Faculty name cannot be empty!'
        }
        return object;
    }
    const { data, error } = await supabase.from('MsFaculty').select().eq('FacultyName', faculty.FacultyName).neq('FacultyId', faculty.FacultyId).single()
    if(error){
        const { data, error } = await supabase.from('MsFaculty').update(faculty).eq('FacultyId', faculty.FacultyId)
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
            message: 'Faculty updated successfully!'
        }
        return object; 
    }

    let object = {
        data: [],
        statusCode: 400,
        message: 'Faculty that you inputed is already exist!'
    }
    return object;
}

export async function deleteFaculty(facultyId: string) {
    const { data, error } = await supabase.from('MsFaculty').delete().eq('FacultyId', facultyId)
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
        message: 'Faculty deleted successfully!'
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
