'use client'

import { createClient } from "../../../../utils/supabase/client"
import { CourseDetail } from "../data-model"
const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob')
const supabase = createClient()

const azureStorageName = process.env.ACCOUNT_NAME
const courseContentContainer = "course-content"
const sasToken = "sv=2022-11-02&ss=bfqt&srt=co&sp=rwdlacupyx&se=2025-02-28T16:07:07Z&st=2024-08-29T08:07:07Z&spr=https&sig=navaS7%2FMj1RxsWjMT3Fl51DGsTYklZgZlVKIbmg%2B%2Fqo%3D"
const azureStorageUrl = `https://elemesstorage.blob.core.windows.net`

const blobServiceClient = new BlobServiceClient(`${azureStorageUrl}?${sasToken}`)
let containerClient = blobServiceClient.getContainerClient(courseContentContainer);

export async function uploadFileToAzureBlobStorage(file: File, courseName: string, sessionId: string) {
    const fileType = file.type.split('/').pop();
    const newFileName = `${courseName}/${sessionId}.${fileType}`;
    const blockBlobClient = containerClient.getBlockBlobClient(newFileName);
    await blockBlobClient.uploadData(file);

    const blobUrl = blockBlobClient.url;
    return blobUrl;
}

export async function replaceFileInAzureBlobStorage(file: File, courseName: string, sessionId: string) {
    const prefix = `${courseName}/${sessionId}`;
    let oldBlobName: string | undefined;

    // List blobs and find the matching blob
    for await (const blob of containerClient.listBlobsFlat({ prefix })) {
        if (blob.name.startsWith(prefix)) {
            oldBlobName = blob.name;
            break;
        }
    }

    if (oldBlobName) {
        const oldBlobClient = containerClient.getBlockBlobClient(oldBlobName);
        await oldBlobClient.delete();
    }

    const fileType = file.type.split('/').pop();
    const newBlobName = `${courseName}/${sessionId}.${fileType}`;
    const newBlobClient = containerClient.getBlockBlobClient(newBlobName);

    await newBlobClient.uploadData(file, {
        blobHTTPHeaders: { blobContentType: file.type },
        overwrite: true
    });

    return newBlobClient.url;
}

export async function deleteFileInAzureBlobStorageByUrl(courseName: string, sessionId: string): Promise<void> {
    const prefix = `${courseName}/${sessionId}`;
    let oldBlobName: string | undefined;

    // List blobs and find the matching blob
    for await (const blob of containerClient.listBlobsFlat({ prefix })) {
        if (blob.name.startsWith(prefix)) {
            oldBlobName = blob.name;
            break;
        }
    }

    if (oldBlobName) {
        const oldBlobClient = containerClient.getBlockBlobClient(oldBlobName);
        await oldBlobClient.delete();
    }
}

export async function fetchCourse() {
    const { data, error } = await supabase.from('MsCourse').select('CourseId, CourseName').eq('ActiveFlag', true)
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data fetched successfully!'}
}

export async function fetchCourseDetail(courseId: string){
    const { data, error } = await supabase.from('CourseDetail').select().eq('CourseId', courseId).order('SessionNumber', {ascending: true})
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data fetched successfully!'}
}

export async function createCourseDetail(item: CourseDetail){
    let msCourse = await supabase.from('MsCourse').select('NumOfSession, TotalCredits').eq('CourseId', item.CourseId)
    if(msCourse.error){
        return {success: false, data: [], message: msCourse.error.message}
    }
    let maximumSession = msCourse.data[0].NumOfSession * msCourse.data[0].TotalCredits
    if(item.SessionNumber > maximumSession){
        return {success: false, data: [], message: 'Session number cannot be more than total credits multiplied by number of session!'}
    }
    const { data, error } = await supabase.from('CourseDetail').insert(item)
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data inserted successfully!'}
}

export async function updateCourseDetail(item: CourseDetail){
    const { data, error } = await supabase.from('CourseDetail').update(item).eq('CourseId', item.CourseId).eq('SessionNumber', item.SessionNumber)
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data updated successfully!'}
}

export async function updateCourseDetailSessionNumber(courseId: string, sourceSessionId: string, destinationSessionId: string){
    const datas = await supabase.from('CourseDetail').select('*').eq('CourseId', courseId).in('SessionId', [`${sourceSessionId}`, `${destinationSessionId}`]).limit(2)
    if(datas.error){
        console.log(datas.error.message)
        return {success: false, data: [], message: datas.error.message}
    }
    const sourceSessionNumber = datas.data.find(data => data.SessionId === sourceSessionId).SessionNumber;
    const destinationSessionNumber = datas.data.find(data => data.SessionId === destinationSessionId).SessionNumber;
    const updateSourceData = await supabase.from('CourseDetail').update({SessionNumber: destinationSessionNumber}).eq('CourseId', courseId).eq('SessionId', sourceSessionId)
    if(updateSourceData.error){
        console.log(updateSourceData.error.message)
        return {success: false, data: [], message: updateSourceData.error.message}
    }
    const updateDestinationData = await supabase.from('CourseDetail').update({SessionNumber: sourceSessionNumber}).eq('CourseId', courseId).eq('SessionId', destinationSessionId)
    if(updateDestinationData.error){
        console.log(updateDestinationData.error.message)
        return {success: false, data: [], message: updateDestinationData.error.message}
    }
    return {success: true, data: [], message: 'Data updated successfully!'}
}

export async function deleteCourseDetail(courseId: string, sessionNumber: number){
    const { data, error } = await supabase.from('CourseDetail').delete().eq('CourseId', courseId).eq('SessionNumber', sessionNumber)
    if(error){
        return {success: false, data: [], message: error.message}
    }
    return {success: true, data: data, message: 'Data deleted successfully!'}
}