'use server'

import { createClient } from "../../../../utils/supabase/server"

const supabase = createClient();

export async function updateUserPassword(newPassword: string){
    const { data, error } = await supabase.auth.updateUser({
        password: newPassword
    })
}

export async function updateUserEmail(newEmail: string){
    const { data, error } = await supabase.auth.updateUser({
        email: newEmail
    })
}