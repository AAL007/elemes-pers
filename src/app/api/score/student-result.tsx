'use server'

import { createClient } from "../../../../utils/supabase/server"

const supabase = createClient()

export async function fetchStudentsAnswer(assessmentId: string){
    const { data, error } = await supabase.rpc('fetch_students_answer', {assessment_id: assessmentId})
    if(error){
        return {success: false, message: error.message, data: []}
    }
    return {success: true, message: 'Data fetched successfully!', data: data}
}