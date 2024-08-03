'use client'

import { createClient } from "../../../../utils/supabase/client"
import { generatePassword } from "../../../../utils/boilerplate-function";

export type MsStaff = {
    StaffId: string;
    StaffName: string;
    StaffEmail: string;
    BirthDate: any;
    Address: string;
    RoleId: string;    
    CreatedBy: string;
    CreatedDate: any;
    UpdatedBy: string | null;
    UpdatedDate: any;
    ActiveFlag: boolean;
}

export type MsStudent = {
    StudentId: string;
    StudentName: string;
    StudentEmail: string;
    BirthDate: any;
    Address: string;
    AcadYear: string;
    RoleId: string;
    LearningStyleId: string;
    CreatedBy: string;
    CreatedDate: any;
    UpdatedBy: string | null;
    UpdatedDate: any;
    ActiveFlag: boolean;
}

export type UserList = {
    UserId: string;
    UserName: string;
    UserEmail: string;
    UserRole: string;
    CreatedBy: string;
    UpdatedBy: string;
    ActiveFlag: boolean;
    IsStaff: boolean;
}

const supabase = createClient()

async function signUpUser (email: string, birthDate: any){
    const password = generatePassword(birthDate);
    const { data, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password
    })

    if(authError){
        return {data: [], statusCode: 400, message: authError.message}
    }

    return {data, statusCode: 200, message: 'User created successfully!'}
}

export async function createStudent(student: MsStudent){
    const { data, error } = await supabase.from('MsStudent').select().eq('StudentEmail', student.StudentEmail).neq('StudentId', student.StudentId).single()
    if(error){
        const { data, error } = await supabase.from('MsStudent').insert(student)
        if (error){
            let object = {
                data: [],
                statusCode: 400,
                message: error.message
            }
            return object;
        }
        const signUp = await signUpUser(student.StudentEmail, student.BirthDate)
        if(signUp.statusCode == 400){
            let object = {
                data: [],
                statusCode: 400,
                message: signUp.message
            }
            return object;
        }
        let object = {
            data: data,
            statusCode: 200,
            message: 'Student added successfully!'
        }
        return object;
    }
    let object = {
        data: [],
        statusCode: 400,
        message: 'This student is already exist!'
    }
    return object
}

export async function createStaff(staff: MsStaff){
    const { data, error } = await supabase.from('MsStaff').select().eq('StaffEmail', staff.StaffEmail).neq('StaffId', staff.StaffId).single()
    if(error){
        const { data, error } = await supabase.from('MsStaff').insert(staff)
        if (error){
            let object = {
                data: [],
                statusCode: 400,
                message: error.message
            }
            return object;
        }
        const signUp = await signUpUser(staff.StaffEmail, staff.BirthDate)
        if(signUp.statusCode == 400){
            let object = {
                data: [],
                statusCode: 400,
                message: signUp.message
            }
            return object;
        }
        let object = {
            data: data,
            statusCode: 200,
            message: 'Staff added successfully!'
        }
        return object;
    }
    let object = {
        data: [],
        statusCode: 400,
        message: 'This staff is already exist!'
    }
    return object
}

export async function updateStudent(student: MsStudent) {
    const { data, error } = await supabase.from('MsStudent').update(student).eq('StudentId', student.StudentId)
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
        message: 'Student updated successfully!'
    }
    return object; 
}

export async function updateStaff(staff: MsStaff) {
    const { data, error } = await supabase.from('MsStaff').update(staff).eq('StaffId', staff.StaffId)
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
        message: 'Staff updated successfully!'
    }
    return object; 
}

export async function deleteStudent(studentId: string) {
    const { data, error } = await supabase.from('MsStudent').delete().eq('StudentId', studentId)
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
        message: 'Student deleted successfully!'
    }
    return object;
}

export async function deleteStaff(staffId: string) {
    const { data, error } = await supabase.from('MsStaff').delete().eq('StaffId', staffId)
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
        message: 'Staff deleted successfully!'
    }
    return object;
}

export async function fetchStudents() {
    const { data, error } = await supabase.from('MsStudent').select()
    if (error){
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
        message: 'Students fetched successfully!'
    }
    return object;
}

export async function fetchStaffs() {
    const { data, error } = await supabase.from('MsStaff').select()
    if (error){
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
        message: 'Staffs fetched successfully!'
    }
    return object;
}

export async function fetchStudent (studentId: string) {
    const { data, error } = await supabase.from('MsStudent').select().eq('StudentId', studentId).single()
    if (error){
        return {data, statusCode: 400, message: 'Failed'};
    }

    return {data, statusCode: 200, message: 'Success'};
}

export async function fetchStaff (staffId: string) {
    const { data, error } = await supabase.from('MsStaff').select().eq('StaffId', staffId).single()
    if (error){
        return {data, statusCode: 400, message: 'Failed'};
    }
    return {data, statusCode: 200, message: 'Success'};
}
