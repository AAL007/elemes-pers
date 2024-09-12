'use client'

import { createClient } from "../../../../utils/supabase/client"
import { LecturerClass, MsClass } from "../../api/data-model"

const supabase = createClient()

export async function fetchAvailableLecturers(academicPeriod: string, departmentId: string) {
    const {data, error} = await supabase.from('DepartmentCourse').select().eq('DepartmentId', departmentId)
    if(!error){
        const lecturers = [];
        for(let i = 0; i < data.length; i++){
            const res = await supabase
                .from('LecturerCourse')
                .select(`StaffId`)
                .eq('CourseId', data[i].CourseId)

            if (res.error) {
                console.log('error', res.error);
                let object = {
                    data: [],
                    statusCode: 400,
                    message: res.error.message
                };
                return object;
            }
            const res2 = await supabase.from('MsStaff').select(`StaffId, LecturerClass (StaffId, ClassId, Class (ClassId, AcademicPeriodId))`).in('StaffId', res.data.map((r: any) => r.StaffId));

            if (res2.error) {
                console.log('error', res2.error);
                let object = {
                    data: [],
                    statusCode: 400,
                    message: res2.error.message
                };
                return object;
            }

            for (let j = 0; j < res2.data.length; j++) {
                const lecturerClass = res2.data[j].LecturerClass;
                const classesInPeriod = lecturerClass.filter((lc: any) => lc.Class.AcademicPeriodId === academicPeriod);

                if (classesInPeriod.length < 4) {
                    lecturers.push({
                        staffId: res.data[j].StaffId,
                        courseId: data[i].CourseId,
                        classCount: classesInPeriod.length
                    });
                }
            }
        }
        console.log(lecturers);
        return {
            data: lecturers,
            statusCode: 200,
            message: 'Lecturers fetched successfully!'
        };
    }else{
        console.log('error', error);
        let object = {
            data: [],
            statusCode: 400,
            message: error.message
        }
        return object;
    }
}

export async function createClass(classObj: MsClass) {
    if(classObj.ClassName == "") {
        let object = {
            data: [],
            statusCode: 400,
            message: 'Class name cannot be empty!'
        }
        return object
    }
    const { data, error } = await supabase.from('Class').select()
        .eq('ClassName', classObj.ClassName)
        .eq('AcademicPeriodId', classObj.AcademicPeriodId)
        .eq('DepartmentId', classObj.DepartmentId).single()
    if(error){
        const { data, error } = await supabase.from('Class').insert(classObj)
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
            message: 'Class created successfully!'
        }
        return object;
    }
    let object = {
        data: [],
        statusCode: 400,
        message: 'Class that you inputed is already exist!'
    }
    return object
}

export async function createLecturerClass (lecturerClass: LecturerClass) {
    const { data, error } = await supabase.from('LecturerClass').select().eq('StaffId', lecturerClass.StaffId).eq('ClassId', lecturerClass.ClassId).single()
    if(error){
        const { data, error } = await supabase.from('LecturerClass').insert(lecturerClass)
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
            message: 'Lecturer class created successfully!'
        }
        return object;
    }
}

export async function updateClass(classObj: MsClass) {
    if(classObj.ClassName == ""){
        let object = {
            data: [],
            statusCode: 400,
            message: 'Class name cannot be empty!',
            type: 'name'
        }
        return object;
    }

    const { data, error } = await supabase.from('Class').update(classObj).eq('ClassId', classObj.ClassId)
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
        message: 'Class updated successfully!'
    }
    return object; 
}

export async function deleteClass(classId: string) {
    const { data, error } = await supabase.from('Class').delete().eq('ClassId', classId)
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
        message: 'Class deleted successfully!'
    }
    return object;
}
  
export async function fetchClasses(departmentId: string, academicPeriodId: string) {
    const { data, error } = await supabase.from('Class').select().eq('DepartmentId', departmentId).eq('AcademicPeriodId', academicPeriodId).order('ClassName', {ascending: true})
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
        message: 'Classes fetched successfully!'
    }
    return object;
}

export async function fetchCoursesByDepartmentId(departmentId: string) {
    const { data, error } = await supabase.from('DepartmentCourse').select(`CourseId, MsCourse (CourseId, CourseName)`).eq('DepartmentId', departmentId);
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

// export async function fetchLecturerByCourseId(courseId: string) {
//     const { data, error } = await supabase.from('LecturerCourse').select().eq('CourseId', courseId)
//     if (error){
//         console.log('error', error); 
//         let object = {
//             data: [],
//             statusCode: 400,
//             message: error.message
//         }
//         return object;
//     };
    
//     let object = {
//         data: data,
//         statusCode: 200,
//         message: 'Lecturers fetched successfully!'
//     }
//     return object;
// }

export async function fetchAcademicPeriods() {
    const { data, error } = await supabase.from('MsAcademicPeriod').select().order('AcademicPeriodId', {ascending: true})
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
        message: 'Academic periods fetched successfully!'
    }
    return object;
}
