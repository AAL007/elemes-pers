'use client'

const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob')
const azureStorageName = process.env.ACCOUNT_NAME
const sasToken = "sv=2022-11-02&ss=bfqt&srt=co&sp=rwdlacupyx&se=2025-02-28T16:07:07Z&st=2024-08-29T08:07:07Z&spr=https&sig=navaS7%2FMj1RxsWjMT3Fl51DGsTYklZgZlVKIbmg%2B%2Fqo%3D"
const azureStorageUrl = `https://elemesstorage.blob.core.windows.net`

export async function uploadFileToAzureBlobStorage(containerName: string, file: File, folderName: string, fileName: string) {
    const blobServiceClient = new BlobServiceClient(`${azureStorageUrl}?${sasToken}`)
    let containerClient = blobServiceClient.getContainerClient(containerName);
    const fileType = file.type.split('/').pop();
    const newFileName = `${folderName}/${fileName}.${fileType}`;
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