'use client'

import { createClient } from "../../../../utils/supabase/client"
import { MsRole } from "../../api/data-model"

const supabase = createClient()

export async function createRole(role: MsRole) {
    if(role.RoleName == "") {
        let object = {
            data: [],
            statusCode: 400,
            message: 'Role Name cannot be empty!'
        }
        return object
    }
    const { data, error } = await supabase.from('MsRole').select().eq('RoleName', role.RoleName).neq('RoleId', role.RoleId).single()
    if(error){
        const { data, error } = await supabase.from('MsRole').insert(role)
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
            message: 'Role created successfully!'
        }
        return object;
    }
    let object = {
        data: [],
        statusCode: 400,
        message: 'Role Name that you inputed is already exist!'
    }
    return object
}

export async function updateRole(role: MsRole) {
    if(role.RoleName == ""){
        let object = {
            data: [],
            statusCode: 400,
            message: 'Role Name cannot be empty!'
        }
        return object;
    }
    const { data, error } = await supabase.from('MsRole').select().eq('RoleName', role.RoleName).neq('RoleId', role.RoleId).single()
    if(error){
        const { data, error } = await supabase.from('MsRole').update(role).eq('RoleId', role.RoleId)
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
            message: 'Role updated successfully!'
        }
        return object; 
    }

    let object = {
        data: [],
        statusCode: 400,
        message: 'Role Name that you inputed is already exist!'
    }
    return object;
}

export async function deleteRole(roleId: string) {
    const { data, error } = await supabase.from('MsRole').delete().eq('RoleId', roleId)
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
        message: 'Role deleted successfully!'
    }
    return object;
}
  
export async function fetchRoles() {
    const { data, error } = await supabase.from('MsRole').select()
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
        message: 'Roles fetched successfully!'
    }
    return object;
}

export async function fetchRoleCategories() {
    const { data, error } = await supabase.from('MsRoleCategory').select()
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
        message: 'Role Categories fetched successfully!'
    }
    return object
}

// export async function fetchRole(roleId: string) {
//     const { data, error } = await supabase.from('MsRole').select().eq('RoleId', roleId).single()
//     if (error){
//         console.log('error', error);
//         return {data, statusCode: 400, message: 'Failed'};
//     }

//     return {data, statusCode: 200, message: 'Success'};
// }
