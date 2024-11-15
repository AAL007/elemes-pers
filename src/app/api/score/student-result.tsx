'use server'

import { createClient } from "../../../../utils/supabase/server"
import { Score } from "../data-model"

const supabase = createClient()

export async function fetchStudentsAnswer(assessmentId: string){
    const { data, error } = await supabase.rpc('fetch_students_answer', {assessment_id: assessmentId})
    if(error){
        return {success: false, message: error.message, data: []}
    }
    return {success: true, message: 'Data fetched successfully!', data: data}
}

// export async function fetchStudentScore(assessmentId: string){
//     const { data, error } = await supabase.from('Score').select().eq('AssessmentId', assessmentId)
//     if(error){
//         return {success: false, message: error.message, data: []}
//     }
//     return {success: true, message: 'Data fetched successfully!', data: data}
// }