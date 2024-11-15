'use server'

import { createClient } from "../../../../utils/supabase/server"
import { MsAssessment, MsQuestion, MsOption } from "../data-model"

const supabase = createClient()

export async function fetchAssessmentById(assessmentId: string){
    const { data, error } = await supabase.from('MsAssessment').select().eq('AssessmentId', assessmentId).limit(1)
    if(error){
        return {success: false, message: error.message, data: []}
    }
    return {success: true, message: 'Data fetched successfully!', data: data}
}

export async function createQuestion(object: MsQuestion){
    const { data, error } = await supabase.from('MsQuestion').insert([object])
    if(error){
        return {success: false, message: error.message, data: []}
    }
    return {success: true, message: 'Data created successfully!', data: data}
}

export async function updateQuestion(object: MsQuestion){
    const { data, error } = await supabase.from('MsQuestion').upsert(object)
    if(error){
        return {success: false, message: error.message, data: []}
    }
    return {success: true, message: 'Data updated successfully!', data: data}
}

export async function createOption(object: MsOption){
    const { data, error } = await supabase.from('MsOption').insert(object)
    if(error){
        return {success: false, message: error.message, data: []}
    }
    return {success: true, message: 'Data created successfully!', data: data}
}

export async function updateOption(object: MsOption){
    const { data, error } = await supabase.from('MsOption').upsert(object)
    if(error){
        return {success: false, message: error.message, data: []}
    }
    return {success: true, message: 'Data updated successfully!', data: data}
}

export async function fetchQuestionAnswer(assessmentId: string){
    const { data, error } = await supabase.rpc('fetch_question_answer', {assessment_id: assessmentId})
    if(error){
        return {success: false, message: error.message, data: []}
    }
    return {success: true, message: 'Data fetched successfully!', data: data}
}
