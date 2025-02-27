'use client'

const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob')
const azureStorageName = process.env.ACCOUNT_NAME
const sasToken = process.env.SAS_TOKEN
const azureStorageUrl = process.env.AZURE_STORAGE_URL

export async function uploadFileToAzureBlobStorage(containerName: string, file: File, folderName: string, fileName: string) {
    const blobServiceClient = new BlobServiceClient(`${azureStorageUrl}?${sasToken}`);
    let containerClient = blobServiceClient.getContainerClient(containerName);
    
    const fileExtension = file.name.split('.').pop();
    const newFileName = `${folderName}/${fileName}.${fileExtension}`;
    
    const blockBlobClient = containerClient.getBlockBlobClient(newFileName);
    await blockBlobClient.uploadData(file, {
        blobHTTPHeaders: { blobContentType: file.type }
    });

    const blobUrl = blockBlobClient.url;
    return blobUrl;
}

export async function replaceFileInAzureBlobStorage(containerName: string, file: File, folderName: string, fileName: string) {
    const blobServiceClient = new BlobServiceClient(`${azureStorageUrl}?${sasToken}`)
    let containerClient = blobServiceClient.getContainerClient(containerName);
    const prefix = `${folderName}/${fileName}`;
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
    const newBlobName = `${folderName}/${fileName}.${fileType}`;
    const newBlobClient = containerClient.getBlockBlobClient(newBlobName);

    await newBlobClient.uploadData(file, {
        blobHTTPHeaders: { blobContentType: file.type },
        overwrite: true
    });

    return newBlobClient.url;
}

export async function deleteFileInAzureBlobStorageByUrl(containerName: string, folderName: string, fileName: string): Promise<void> {
    const blobServiceClient = new BlobServiceClient(`${azureStorageUrl}?${sasToken}`)
    let containerClient = blobServiceClient.getContainerClient(containerName);
    const prefix = `${folderName}/${fileName}`;
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