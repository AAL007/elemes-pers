'use client'

import React from "react";
import { useState, useEffect } from "react";
import { 
    Card, 
    CardBody, 
    CardFooter, 
    CardHeader, 
    Avatar, 
    Divider, 
    Pagination, 
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Textarea,
    useDisclosure,
    Spinner,
    Tooltip 
} from "@nextui-org/react";
import { fetchDiscussion, createThread, updateThread, deleteThread, fetchThreads } from "@/app/api/course/course-detail-list";
import { ForumThread, ForumThreadResponse, ForumPostResponse } from "@/app/api/data-model";
import { fetchFileFromUrl, formatDateTime, generateGUID } from "../../../../../utils/boilerplate-function";
import { FileUpload } from "@/components/ui/file-upload";
import { uploadFileToAzureBlobStorage, replaceFileInAzureBlobStorage, deleteFileInAzureBlobStorageByUrl } from "@/app/api/azure-helper";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { EditIcon } from "@/components/icon/edit-icon";
import { DeleteIcon } from "@/components/icon/delete-icon";
import { set } from "lodash";

const defaultThread: ForumThreadResponse = {
    ThreadId: '',
    ForumId: '',
    Content: '',
    ContentUrl: '',
    CreatorEmail: '',
    CreatorName: '',
    CreatorImage: '',
    CreatorId: '',
    CreatorType: '',
    CreatedDate: new Date().toISOString(),
    UpdatedDate: '',
    File: null
}

const DiscussionDetail = ({params} : {params: {forumId: string}}) => {
    const userData = useSelector((state: RootState) => state.user);
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [discussionDetail, setDiscussionDetail] = useState<ForumPostResponse | null>(null);
    const [thread, setThread] = React.useState<ForumThreadResponse>(defaultThread);
    const [threads, setThreads] = React.useState<ForumThreadResponse[]>([]);
    const [isCreate, setIsCreate] = React.useState<boolean>(false);
    const [isDelete, setIsDelete] = React.useState<boolean>(false);
    const [isEdit, setIsEdit] = React.useState<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [isButtonLoading, setIsButtonLoading] = React.useState<boolean>(false);
    const [uploadClicked, setUploadClicked] = React.useState<boolean>(false);
    const [existingFile, setExistingFile] = React.useState<File | null>(null);
    const [files, setFiles] = React.useState<File[]>([]);
    const [discussionPage, setDiscussionPage] = useState(1);
    const discussionRowsPerPage = 5;

    const posts = React.useMemo(() => {
        const start = (discussionPage - 1) * discussionRowsPerPage;
        const end = start + discussionRowsPerPage;
        
        return threads.slice(start, end);
    }, [discussionPage, threads, discussionRowsPerPage]);

    const renderFile = (file: File) => {
        const fileName = file.name.split('?')[0].split('/').pop();
        const fileExtension = fileName?.split('.').pop()?.toLowerCase();
        switch (true) {
            case fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png' || fileExtension === 'gif':
                return <img alt={file.name} src={URL.createObjectURL(file)} className="w-full rounded-xl" />;
            case fileExtension === 'mp4' || fileExtension === 'webm' || fileExtension === 'avi' || fileExtension === 'mov':
                return <video controls className="w-full rounded-xl" src={URL.createObjectURL(file)} />;
            case fileExtension === 'mp3' || fileExtension === 'wav' || fileExtension === 'ogg':
                return <audio controls className="w-full rounded-xl" src={URL.createObjectURL(file)} />;
            case fileExtension === 'pdf':
                return <iframe src={URL.createObjectURL(file)} className="w-full h-full rounded-xl" />;
            case fileExtension === 'doc' || fileExtension === 'docx' || fileExtension === 'xls' || fileExtension === 'xlsx' || fileExtension === 'ppt' || fileExtension === 'pptx':
                return <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(URL.createObjectURL(file))}`} className="w-full h-full rounded-xl" />;
            default:
                return <a href={URL.createObjectURL(file)} download={file.name}>Download Attachment</a>;
        }
    }

    useEffect(() => {
        fetchDiscussionDetail();
        fetchingThreads();
    }, [])

    const handleFileUpload = (files: File[]) => {
        setFiles(files);
    }


    const fetchDiscussionDetail = async () => {
        setDiscussionDetail(null);
        setIsLoading(true);
        const res = await fetchDiscussion(params.forumId);
        if(!res.success){
            alert(res.message);
            setIsLoading(false);
            return;
        }
        const discussionDetail = {
            ForumId: res.data[0].forumId,
            SessionId: res.data[0].sessionId,
            ContentTitle: res.data[0].contentTitle,
            Content: res.data[0].content,
            ContentUrl: res.data[0].contentUrl,
            CreatorImage: res.data[0].creatorImage,
            CreatorEmail: res.data[0].creatorEmail,
            CreatorName: res.data[0].creatorName,
            CreatorId: res.data[0].creatorId,
            CreatorType: res.data[0].creatorType,
            CreatedDate: res.data[0].createdDate,
            UpdatedDate: res.data[0].updatedDate,
            File: res.data[0].contentUrl != null ? await fetchFileFromUrl(res.data[0].contentUrl) : null,
            NumOfReplies: res.data[0].numOfReplies
        }

        setDiscussionDetail(discussionDetail);
        setIsLoading(false);
    }

    const fetchingThreads = async () => {
        setThreads([]);
        setIsLoading(true);
        const res = await fetchThreads(params.forumId);
        if(!res.success){
            alert(res.message);
            setIsLoading(false);
            return;
        }
        console.log(res.data)
        let threads = await Promise.all(res.data.map(async(x: any) => {
            const file = x.contentUrl != null ? await fetchFileFromUrl(x.contentUrl) : null;
            return {
                ThreadId: x.threadId,
                ForumId: x.forumId,
                Content: x.content,
                ContentUrl: x.contentUrl,
                CreatorId: x.creatorId,
                CreatorType: x.creatorType,
                CreatedDate: x.createdDate,
                UpdatedDate: x.updatedDate,
                CreatorName: x.creatorName,
                CreatorEmail: x.creatorEmail,
                CreatorImage: x.creatorImage,
                File: file
            }
        }))
        setThreads(threads);
        setIsLoading(false);
    }
    
    return(
        <div>
            <Modal
                backdrop="blur"
                isDismissable={false}
                isOpen={isOpen} 
                onOpenChange={() => {
                setIsEdit(false);
                setIsDelete(false);
                setIsCreate(false);
                setUploadClicked(false);
                setExistingFile(null);
                setThread(defaultThread);
                onOpenChange()
                }}
                placement="top-center"
            >
                <ModalContent>
                {(onClose) => (
                    <>
                    <ModalHeader className="flex flex-col gap-1">{isEdit ? "Edit Reply" : isDelete ? "Delete Reply" : isCreate ? "Add New Reply" : ""}</ModalHeader>
                    <ModalBody>
                        {(isCreate || isEdit) ? (
                        <>
                            <Textarea
                                autoFocus
                                label="Content"
                                placeholder="Enter Content"
                                variant="bordered"
                                isRequired
                                onClick={async() => await setUploadClicked(false)}
                                onChange={(e) => {setThread({...thread, Content: e.target.value})}}
                                value={thread.Content}
                            />
                            <div className={`border-2 ${uploadClicked ? 'border-black' : ''} border-350 rounded-2xl hover:${uploadClicked ? 'border-black' : 'border-gray-400'}`} onClick={() => setUploadClicked(true)}>
                                <p className="text-neutral-600 ml-3 mt-2" style={{ fontSize: "12.5px" }}>{`Upload Content File (if needed)`}</p>
                                <p className="text-neutral-500 ml-3" style={{ fontSize: "13.5px" }}>Drag or drop your files here or click to upload</p>
                                <FileUpload existingFile={existingFile} onChange={handleFileUpload} />
                            </div>
                        </>
                        ) : (
                        <div className="flex flex-col gap-4">
                            <p>Are you sure you want to delete this post?</p>
                        </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="flat" onPress={() => {
                        setThread(defaultThread);
                        setIsEdit(false);
                        setIsDelete(false);
                        setIsCreate(false);
                        setUploadClicked(false);
                        setExistingFile(null);
                        onClose();
                        }}>
                        Close
                        </Button>
                        {isCreate ? (
                        <Button color="primary" onPress={async() => {
                            setIsButtonLoading(true);
                            try{
                                let threadId = await generateGUID();
                                let blobUrl = (files[0] == undefined || files[0] == null) ? null : await uploadFileToAzureBlobStorage("thread", files[0], params.forumId, threadId);
                                let newThread: ForumThread = {
                                    ForumId: params.forumId,
                                    ThreadId: threadId,
                                    Content: thread.Content,
                                    ContentUrl: blobUrl,
                                    CreatorId: userData.id,
                                    CreatorType: userData.role,
                                    CreatedDate: new Date().toISOString(),
                                    UpdatedDate: new Date().toISOString()
                                }
                                await createThread(newThread).then((object: any) => {
                                    if(!object.success){
                                    alert(object.message)
                                    return;
                                    }
                                })
                                onClose();
                                setIsCreate(false);
                                setUploadClicked(false);
                                setExistingFile(null);
                                setThread(defaultThread);
                                setFiles([]);
                                fetchDiscussionDetail();
                                fetchingThreads();
                            }finally{
                                setIsButtonLoading(false);
                            }
                        }}>
                            {isButtonLoading ? <Spinner size="sm" color="default"/> : "Add"}
                        </Button>
                        ) : isEdit ? (
                        <Button color="primary" onPress={async () => {
                            setIsButtonLoading(true);
                            try {
                                let blobUrl = (files[0] != null && files[0] != undefined) ? await replaceFileInAzureBlobStorage("thread", files[0], params.forumId, thread.ThreadId) : thread.ContentUrl;
                                let updatedThread: ForumThread = {
                                    ForumId: thread.ForumId,
                                    ThreadId: thread.ThreadId,
                                    Content: thread.Content,
                                    ContentUrl: blobUrl,
                                    CreatorId: thread.CreatorId,
                                    CreatorType: thread.CreatorType,
                                    CreatedDate: thread.CreatedDate,
                                    UpdatedDate: new Date().toISOString()
                                }
                                await updateThread(updatedThread).then((object: any) => {
                                    if(object.success) {
                                        onClose();
                                        setIsEdit(false);
                                        setUploadClicked(false);
                                        setExistingFile(null);
                                        setThread(defaultThread);
                                        setFiles([]);
                                        fetchDiscussionDetail();
                                        fetchingThreads();
                                    }else{
                                    }
                                })
                            } finally {
                                setIsButtonLoading(false);
                            }
                        }}>
                            {isButtonLoading ? <Spinner color="default" size="sm"/> : "Edit"}
                        </Button>
                        ) : (
                        <Button color="primary" onPress={async() => {
                            setIsButtonLoading(true);
                            try{
                                let res = await deleteFileInAzureBlobStorageByUrl("thread", params.forumId, thread.ThreadId);
                                await deleteThread(thread.ThreadId).then((object: any) => {
                                    if(object.success){
                                        onClose();
                                        setUploadClicked(false);
                                        setExistingFile(null);
                                        setIsDelete(false);
                                        setThread(defaultThread);
                                        fetchDiscussionDetail();
                                        fetchingThreads();
                                    }else{
                                    }
                                })
                            }finally{
                                setIsButtonLoading(false);
                            }
                        }}>
                            {isButtonLoading ? <Spinner color="default" size="sm"/> : "Delete"}
                        </Button>
                        )}
                    </ModalFooter>
                    </>
                )}
                </ModalContent>
            </Modal>
            <Card className="px-4 py-4" fullWidth shadow="md" radius="md">
                {isLoading && (
                    <div className="flex justify-center items-center w-full h-72">
                        <Spinner color="primary" size="md"/>
                    </div>
                )}
                {discussionDetail && (
                    <>
                        <Card key={params.forumId} className="w-full cursor-pointer px-1 py-1" shadow="none">
                            <CardHeader className="justify-between">
                                <div className="flex gap-5">
                                    <Avatar radius="full" size="md" src={`${discussionDetail?.CreatorImage ?? '/img/profile-picture-blank.jpeg'}`} />
                                    <div className="flex flex-col gap-1 items-start justify-center">
                                        <h4 className="text-small font-semibold leading-none text-default-600">{discussionDetail?.CreatorName}</h4>
                                        <h5 className="text-small tracking-tight text-default-400">{discussionDetail?.CreatorEmail}</h5>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardBody className="px-3 py-0 text-small text-default-400">
                                <h2 className="text-lg font-semibold text-gray-400">{discussionDetail?.ContentTitle}</h2>
                                <p className={`pt-2 ${discussionDetail?.File != null ? 'pb-2' : ''}`}>{discussionDetail?.Content}</p>
                                {discussionDetail?.File != null && (renderFile(discussionDetail?.File))}                                                 
                                <span className="pt-2">
                                    {formatDateTime(discussionDetail?.UpdatedDate)}
                                </span>
                            </CardBody>
                            <CardFooter className="gap-3">
                                <div className="flex gap-1">
                                    <p className="font-semibold text-default-400 text-small">{discussionDetail?.NumOfReplies}</p>
                                    <p className=" text-default-400 text-small">Replies</p>
                                </div>
                            </CardFooter>
                        </Card>
                        <Divider orientation="horizontal" className="my-3 w-full"/>
                    </>
                )}
                {(posts.length == 0 && !isLoading) ? (
                    <div className="mt-8 flex align-middle text-md justify-center ">
                        No threads available in this session
                    </div>
                ) : (
                    <>
                        {posts.map((post) => (
                            <Card key={post.ThreadId} className="mt-2 w-full cursor-pointer px-1 py-1" shadow="none">
                                <CardHeader className="justify-between">
                                    <div className="flex gap-5">
                                        <Avatar radius="full" size="md" src={`${post.CreatorImage ?? '/img/profile-picture-blank.jpeg'}`} />
                                        <div className="flex flex-col gap-1 items-start justify-center">
                                            <h4 className="text-small font-semibold leading-none text-default-600">{post.CreatorName}</h4>
                                            <h5 className="text-small tracking-tight text-default-400">{post.CreatorEmail}</h5>
                                        </div>
                                    </div>
                                    {(post.CreatorEmail === userData.email) && (
                                        <div className="flex gap-1">
                                            <Tooltip content="Edit Discussion">
                                                <Button isIconOnly radius="full" variant="light" className="bg-none text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => {setIsEdit(true); setThread(post); onOpen()}} >
                                                    <EditIcon/>
                                                </Button>
                                            </Tooltip>
                                            <Tooltip color="danger" content="Delete Discussion">
                                                <Button isIconOnly radius="full" variant="light" className="bg-none text-lg text-danger cursor-pointer active:opacity-50" onClick={() => {setIsDelete(true); setThread(post);  onOpen()}}>
                                                    <DeleteIcon/>
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardBody className="px-3 py-0 text-small text-default-400">
                                    <p className={`${post.File != null ? 'pb-2' : ''}`}>{post.Content}</p>
                                    {post.File != null && (renderFile(post.File))}                                                 
                                    <span className="pt-2">
                                        {formatDateTime(post.UpdatedDate)}
                                    </span>
                                </CardBody>
                            </Card>
                        ))}
                    </>
                )}
                {!isLoading && (
                    <div className="flex items-center justify-between">
                        <Pagination showShadow showControls total={Math.ceil(threads.length / discussionRowsPerPage)} page={discussionPage} onChange={setDiscussionPage} className="mt-7 mb-2"/>
                        <Button onClick={() => {setIsCreate(true); onOpen()}} className="mt-4 mb-2 h-12" color="primary">Add New Reply</Button>
                    </div>
                )}
            </Card>
        </div>
    )
}

export default DiscussionDetail;