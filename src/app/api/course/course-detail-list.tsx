'use server'

import { createClient } from "../../../../utils/supabase/server"
import { ForumPost, ForumThread, StudentActivityLog, StudentAttendanceLog, AssessmentAnswer, Score, StudentSessionLog } from "../data-model";

const supabase = createClient();

export async function fetchSessionList(studentId: string, courseId: string, learningStyleId: string) {
    const { data, error } = await supabase.rpc('fetch_session_list', {student_id: studentId, course_id: courseId, learning_style_id: learningStyleId})
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data fetched successfully!'}
}

export async function fetchSessionStatus(studentId: string, courseId: string, learningStyleId: string) {
    const { data, error } = await supabase.rpc('fetch_session_status', {student_id: studentId, course_id: courseId, learning_style_id: learningStyleId})
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data fetched successfully!'}
}

export async function fetchAttendanceList(studentId: string, courseId: string, classId: string) {
    const { data, error } = await supabase.rpc('fetch_attendance', {student_id: studentId, course_id: courseId, class_id: classId})
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data fetched successfully!'}
}

export async function fetchPeople(courseId: string, classId: string){
    const { data, error } = await supabase.rpc('fetch_people', {course_id: courseId, class_id: classId})
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data fetched successfully!'}
}

export async function isAssignmentCleared(studentId: string, assignmentId: string){
    const { data, error } = await supabase.from('Score').select('Score').eq('StudentId', studentId).eq('AssessmentId', assignmentId).limit(1).single()
    if(error){
        return {success: false, data: null, message: error.message}
    }
    return {success: true, data: data, message: 'Data fetched successfully!'}
}

export async function isActivityLogWithSameLearningStyleExist(sessionId: string, studentId: string, learningStyleId: string){
    const { data, error } = await supabase.from('StudentActivityLog').select('Rating').eq('SessionId', sessionId).eq('StudentId', studentId).eq('LearningStyleId', learningStyleId).order('CreatedDate', {ascending: true}).limit(1).single()
    if(error){
        return {success: false, data: null, message: error.message}
    }else{
        return {success: true, data: data, message: 'Data fetched successfully!'}
    }
}

export async function createOrUpdateSessionLog(object: StudentSessionLog){
    const res = await supabase.from('StudentSessionLog').select().eq('StudentId', object.StudentId).eq('SessionId', object.SessionId).limit(1).single()
    if(res.error){
        if(res.error.code = "PGRST116"){
            object.UpdatedDate = null;
            const { data, error } = await supabase.from('StudentSessionLog').insert(object)
            if(error){
                console.log(error)
                return {success: false, data: [], message: error.message}
            }
            return {success: true, data: data, message: 'Data created successfully!'}
        }
        return {success: false, data: [], message: res.error.message}
    }
    if(res.data){
        object.CreatedDate = res.data.CreatedDate;
        (object.IsContentClicked && !res.data.IsContentClicked) ? object.IsContentClicked = object.IsContentClicked : (!object.IsContentClicked && res.data.IsContentClicked) ? object.IsContentClicked = res.data.IsContentClicked : false;
        (object.IsAssignmentClicked && !res.data.IsAssignmentClicked) ? object.IsAssignmentClicked = object.IsAssignmentClicked : (!object.IsAssignmentClicked && res.data.IsAssignmentClicked) ? object.IsAssignmentClicked = res.data.IsAssignmentClicked : false;
        const { data, error } = await supabase.from('StudentSessionLog').update(object).eq('StudentId', object.StudentId).eq('SessionId', object.SessionId)
        if(error){
            return {success: false, data: [], message: error.message}
        }
        return {success: true, data: data, message: 'Data updated successfully!'}
    }
    return {success: false, data: [], message: 'Data not found and failed to be created!'}
}

export async function createAttendanceLog(object: StudentAttendanceLog){
    const { data, error } = await supabase.from('StudentAttendanceLog').insert(object)
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data created successfully!'}
}

export async function createActivityLog(object: StudentActivityLog){
    const { data, error } = await supabase.from('StudentActivityLog').insert(object)
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data created successfully!'}
}

export async function fetchDiscussions(sessionId: string){
    const { data, error } = await supabase.rpc('fetch_discussions', {session_id: sessionId})
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data fetched successfully!'}
}

export async function fetchDiscussion(forumId: string){
    const { data, error } = await supabase.rpc('fetch_discussion', {forum_id: forumId})
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data fetched successfully!'}
}

export async function createDiscussion(object: ForumPost){
    const { data, error } = await supabase.from('ForumPost').insert(object)
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data created successfully!'}
}

export async function updateDiscussion(object: ForumPost){
    const { data, error } = await supabase.from('ForumPost').update(object).eq('ForumId', object.ForumId)
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data updated successfully!'}
}

export async function deleteDiscussion(forumId: string){
    const { data, error } = await supabase.from('ForumPost').delete().eq('ForumId', forumId)
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data deleted successfully!'}
}

export async function createAssessmentAnswer(object: AssessmentAnswer){
    const { data, error } = await supabase.from('AssessmentAnswer').insert(object)
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data created successfully!'}
}

export async function createScore(object: Score){
    const { data, error } = await supabase.from('Score').insert(object)
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data created successfully!'}
}

export async function fetchThreads(forumId: string){
    const { data, error } = await supabase.rpc('fetch_threads', {forum_id: forumId})
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data fetched successfully!'}
}

export async function createThread(object: ForumThread){
    const { data, error } = await supabase.from('ForumThread').insert(object)
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data created successfully!'}
}

export async function updateThread(object: ForumThread){
    const { data, error } = await supabase.from('ForumThread').update(object).eq('ThreadId', object.ThreadId)
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data updated successfully!'}
}

export async function deleteThread(threadId: string){
    const { data, error } = await supabase.from('ForumThread').delete().eq('ThreadId', threadId)
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data deleted successfully!'}
}

