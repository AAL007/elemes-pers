'use client'
import * as React from "react";
import { useEffect } from "react";
import "@/components/ui/component.css"
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { 
    fetchDiscussions, 
    createDiscussion, 
    updateDiscussion, 
    deleteDiscussion,
    fetchLecturerSessionList,
    fetchStudentAttendances
} from "@/app/api/course/course-detail-list";
import { 
    Tabs, 
    Tab, 
    Card, 
    CardBody, 
    CardHeader, 
    CardFooter,
    Pagination, 
    Button, 
    Avatar,
    Input,
    ModalBody,
    ModalHeader,
    ModalFooter,
    Modal, 
    ModalContent,
    useDisclosure,
    Spinner,
    Textarea,
    Tooltip,
} from "@nextui-org/react";
import Loading from "@/app/(AddMorePageWithinThisFolder)/loading";
import { ForumPost, ForumPostResponse } from "@/app/api/data-model";
import { generateGUID, formatDateTime, fetchFileFromUrl } from "../../../../../../utils/utils";
import { uploadFileToAzureBlobStorage, replaceFileInAzureBlobStorage, deleteFileInAzureBlobStorageByUrl } from "@/app/api/azure-helper";
import { FileUpload } from "@/components/ui/file-upload";
import { EditIcon } from "@/components/icon/edit-icon";
import { DeleteIcon } from "@/components/icon/delete-icon";
import StudentResult from "@/components/ui/student-result-table";
import { IconVideo, IconDoor, IconCalendarTime } from "@tabler/icons-react";
import StudentAttendanceTable from "@/components/ui/student-attendance-table";
import { IconDownload } from "@tabler/icons-react";

const defaultDiscussion: ForumPostResponse = {
    ForumId: '',
    SessionId: '',
    ContentTitle: '',
    Content: '',
    ContentUrl: '',
    CreatorImage: '',
    CreatorEmail: '',
    CreatorName: '',
    CreatorId: '',
    CreatorType: '',
    CreatedDate: new Date().toISOString(),
    UpdatedDate: '',
    NumOfReplies: 0
}

const courseDetailList = ({params} : {params: {parameters: string}}) => {
    const userData = useSelector((state: RootState) => state.user);
    const [sessionsList, setSessionsList] = React.useState<any[]>([]);
    const [discussionPage, setDiscussionPage] = React.useState(1);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isFetchingDiscussion, setIsFetchingDiscussion] = React.useState(true);
    const discussionRowsPerPage = 5;
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [isCreate, setIsCreate] = React.useState(false);
    const [isEdit, setIsEdit] = React.useState(false);
    const [isDelete, setIsDelete] = React.useState(false);
    const [post, setPost] = React.useState<ForumPostResponse>(defaultDiscussion);
    const [postDiscussions, setPostDiscussions] = React.useState<ForumPostResponse[]>([]);
    const [files, setFiles] = React.useState<File[]>([]);
    const [uploadClicked, setUploadClicked] = React.useState(false);
    const [existingFile, setExistingFile] = React.useState<File | null>(null);
    const [attendance, setAttendance] = React.useState<any[]>([]);
    const [selected, setSelected] = React.useState<string>("content");
    const [sessionId, setSessionId] = React.useState<string>("");
    const [disabledKeys, setDisabledKeys] = React.useState<string[]>([]);
    const [majorActiveTab, setMajorActiveTab] = React.useState<string>('sessions');
    const [assessmentId, setAssessmentId] = React.useState<string>("");

    const handleFileUpload = (files: File[]) => {
        setFiles(files);
    }

    const fetchAttendances = async () => {
        const res = await fetchStudentAttendances(params.parameters[0], params.parameters[1], sessionId);
        if(!res.success){
            alert(res.message);
            return;
        }
        const attendances = await Promise.all(res.data.map(async(z: any) => {
            return {
                id: z.id,
                name: z.name,
                email: z.email, 
                departmentName: z.departmentName,
                role: z.role,
                profilePictureUrl: z.profilePictureUrl,
                status: z.status,
                activeFlag: z.activeFlag
            }
        }))
        console.log(attendances)
        setAttendance(attendances);
    }

    const fetchSessionLists = async () => {
        const res = await fetchLecturerSessionList(params.parameters[0]);
        if(!res.success){
            alert(res.message);
            setIsLoading(false);
            return;
        }
        const sessionsList = await Promise.all(res.data.map(async(z: any) => {
            return {
                assessmentId: z.assessmentId,
                sessionId: z.sessionId,
                sessionName: z.sessionName,
                sessionNumber: z.sessionNumber,
                sessionDate: z.sessionDate,
                classroom: z.classroom,
                onlineMeetingUrl: z.onlineMeetingUrl
            }
        }))
        setSessionsList(sessionsList);
        
        setTimeout(() => {
            setIsLoading(false);
        }, 1300)
    }

    const fetchingDiscussions = async() => {
        setPostDiscussions([]);
        setIsFetchingDiscussion(true);
        const res = await fetchDiscussions(sessionId)
        if(!res.success){
            alert(res.message);
            setIsFetchingDiscussion(false);
            return;
        }
        const discussions = await Promise.all(res.data.map(async(z: any) => {
            const file = z.contentUrl != null ? await fetchFileFromUrl(z.contentUrl) : null;
            return {
                ForumId: z.forumId,
                SessionId: z.sessionId,
                ContentTitle: z.contentTitle,
                Content: z.content,
                ContentUrl: z.contentUrl,
                CreatorImage: z.creatorImage,
                CreatorEmail: z.creatorEmail,
                CreatorName: z.creatorName,
                CreatorId: z.creatorId,
                CreatorType: z.creatorType,
                CreatedDate: z.createdDate,
                UpdatedDate: z.updatedDate,
                File: file,
                NumOfReplies: z.numOfReplies
            }
        }))
        setPostDiscussions(discussions);
        setIsFetchingDiscussion(false);
    }

    const renderFile = (file: string, menu: string) => {
        const fileName = file.split('?')[0].split('/').pop();
        const fileExtension = fileName?.split('.').pop()?.toLowerCase();
        switch (true) {
            case fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png' || fileExtension === 'gif':
                return <img alt={'image'} src={file} className={`${menu == 'content' ? 'w-full' : 'w-1/4 h-1/4'} rounded-xl`} />;
            case fileExtension === 'mp4' || fileExtension === 'webm' || fileExtension === 'avi' || fileExtension === 'mov':
                return <video controls className={`${menu == 'content' ? 'w-full' : 'w-1/4 h-1/4'} rounded-xl`} src={file} />;
            case fileExtension === 'mp3' || fileExtension === 'wav' || fileExtension === 'ogg' || fileExtension === 'mpeg':
                return <audio controls className={`${menu == 'content' ? 'w-full' : 'w-1/4 h-1/4'} rounded-xl`} src={file} />;
            case fileExtension === 'doc' || fileExtension === 'docx' || fileExtension === 'xls' || fileExtension === 'xlsx' || fileExtension === 'ppt' || fileExtension === 'pptx':
                return <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file)}`} className="w-full h-full rounded-xl" />;
            default:
                return (
                    <div className="flex flex-row justify-start items-center">
                        <IconDownload size={20} />
                        <a href={file} download={'file'}>Download Attachment</a>
                    </div>
                );
        }
    }
    const posts = React.useMemo(() => {
        const start = (discussionPage - 1) * discussionRowsPerPage;
        const end = start + discussionRowsPerPage;
        
        return postDiscussions.slice(start, end);
    }, [discussionPage, postDiscussions, discussionRowsPerPage]);

    useEffect(() => {
        setIsLoading(true);
        fetchSessionLists();
    }, [params.parameters])

    useEffect(() => {
        if(sessionId === "") return;
        fetchAttendances();
        fetchingDiscussions();
        const assessmentId = sessionsList.find(x => x.sessionId == sessionId)?.assessmentId;
        setAssessmentId(assessmentId ?? '');
    }, [sessionId])

    return (
        <>
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
                setPost(defaultDiscussion);
                onOpenChange()
                }}
                placement="top-center"
            >
                <ModalContent>
                {(onClose) => (
                    <>
                    <ModalHeader className="flex flex-col gap-1">{isEdit ? "Edit Post" : isDelete ? "Delete Post" : isCreate ? "Add New Post" : ""}</ModalHeader>
                    <ModalBody>
                        {(isCreate || isEdit) ? (
                        <>
                            <Input
                                autoFocus
                                label="Title"
                                placeholder="Enter title"
                                variant="bordered"
                                isRequired
                                onClick={async() => await setUploadClicked(false)}
                                onChange={(e) => {setPost({...post, ContentTitle: e.target.value})}}
                                value={post.ContentTitle}
                            />
                            <Textarea
                                autoFocus
                                label="Content"
                                placeholder="Enter Content"
                                variant="bordered"
                                isRequired
                                onClick={async() => await setUploadClicked(false)}
                                onChange={(e) => {setPost({...post, Content: e.target.value})}}
                                value={post.Content}
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
                        setPost(defaultDiscussion);
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
                            setIsLoading(true);
                            try{
                                let forumId = await generateGUID();
                                let blobUrl = (files[0] == undefined || files[0] == null) ? null : await uploadFileToAzureBlobStorage("discussion", files[0], sessionId, forumId);
                                let newDiscussion: ForumPost = {
                                    ForumId: forumId,
                                    SessionId: sessionId,
                                    ContentTitle: post.ContentTitle,
                                    Content: post.Content,
                                    ContentUrl: blobUrl,
                                    CreatorId: userData.id,
                                    CreatorType: userData.role,
                                    CreatedDate: new Date().toISOString(),
                                    UpdatedDate: new Date().toISOString()
                                }
                                await createDiscussion(newDiscussion).then((object: any) => {
                                    if(!object.success){
                                    alert(object.message)
                                    return;
                                    }
                                })
                                onClose();
                                setIsCreate(false);
                                setUploadClicked(false);
                                setExistingFile(null);
                                setPost(defaultDiscussion);
                                setFiles([]);
                                fetchingDiscussions();
                            }finally{
                                setIsLoading(false);
                            }
                        }}>
                            {isLoading ? <Spinner size="sm" color="default"/> : "Add"}
                        </Button>
                        ) : isEdit ? (
                        <Button color="primary" onPress={async () => {
                            setIsLoading(true);
                            try {
                                console.log(files)
                                let blobUrl = (files[0] != null && files[0] != undefined) ? await replaceFileInAzureBlobStorage("discussion", files[0], sessionId, post.ForumId) : post.ContentUrl;
                                let updatedDiscussion: ForumPost = {
                                    ForumId: post.ForumId,
                                    SessionId: post.SessionId,
                                    ContentTitle: post.ContentTitle,
                                    Content: post.Content,
                                    ContentUrl: blobUrl,
                                    CreatorId: post.CreatorId,
                                    CreatorType: post.CreatorType,
                                    CreatedDate: post.CreatedDate,
                                    UpdatedDate: new Date().toISOString()
                                }
                                await updateDiscussion(updatedDiscussion).then((object: any) => {
                                    if(object.success) {
                                        onClose();
                                        setIsEdit(false);
                                        setUploadClicked(false);
                                        setExistingFile(null);
                                        setPost(defaultDiscussion);
                                        setFiles([]);
                                        fetchingDiscussions();
                                    }else{
                                    }
                                })
                            } finally {
                                setIsLoading(false);
                            }
                        }}>
                            {isLoading ? <Spinner color="default" size="sm"/> : "Edit"}
                        </Button>
                        ) : (
                        <Button color="primary" onPress={async() => {
                            setIsLoading(true);
                            try{
                                let res = await deleteFileInAzureBlobStorageByUrl("discussion", sessionId, post.ForumId);
                                await deleteDiscussion(post.ForumId).then((object: any) => {
                                    if(object.success){
                                        onClose();
                                        setUploadClicked(false);
                                        setExistingFile(null);
                                        setIsDelete(false);
                                        setPost(defaultDiscussion);
                                        fetchingDiscussions();
                                    }else{
                                    }
                                })
                            }finally{
                                setIsLoading(false);
                            }
                        }}>
                            {isLoading ? <Spinner color="default" size="sm"/> : "Delete"}
                        </Button>
                        )}
                    </ModalFooter>
                    </>
                )}
                </ModalContent>
            </Modal>
            <div className="flex w-full flex-col">
                {isLoading && <Loading />}
                {(sessionsList.length == 0 && !isLoading) ? (
                    <div className="flex w-full text-center align-center justify-center" style={{ height: '75vh' }}>
                        <p className="text-lg">No session available</p>
                    </div>
                ) : (sessionsList.length != 0 && !isLoading) ? (
                    <>
                        <Tabs selectedKey={majorActiveTab} onSelectionChange={(e) => setMajorActiveTab(String(e))} className="flex w-full flex-col" variant="underlined" aria-label="Course Detail">
                            <Tab key={'sessions'} title={'Sessions'}>
                                <Tabs disabledKeys={disabledKeys} onSelectionChange={(e) => {setSessionId(String(e))}} variant="light" className="flex w-full flex-col" aria-label="Sessions">
                                    {sessionsList.map((session) => (
                                        <Tab key={session.sessionId} title={`Session ${session.sessionNumber}`}>
                                            <Card>
                                                <CardBody>
                                                    <Tabs selectedKey={selected} onSelectionChange={(e) => {setSelected(String(e))}} className="flex w-full flex-col" aria-label="Session Detail">
                                                        <Tab key={'content'} title={session.sessionName}>
                                                            <div key={'content'}>
                                                                <div className="">
                                                                    <div className="flex flex-row justify-evenly align-middle items-center mt-5 ml-3">
                                                                        <Card className="flex flex-row justify-center items-center w-1/4 bg-yellow-400 h-12" shadow="md">
                                                                            <IconDoor size={24}/>
                                                                            <p className="text-sm font-normal ml-3">Classroom {session.classroom}</p>
                                                                        </Card>
                                                                        <Button className="w-1/4 flex flex-row items-center h-12" color="primary" variant="shadow">
                                                                            <IconVideo size={24} stroke={2} />
                                                                            <a className="text-sm font-normal" href={session.onlineMeetingUrl} target="_blank" rel="noopener noreferrer">Join Zoom Meeting</a>
                                                                        </Button>
                                                                        <Card className="flex flex-row justify-center items-center w-1/3 bg-yellow-400 h-12" shadow="md">
                                                                            <IconCalendarTime size={24}/>
                                                                            <p className="text-sm font-normal ml-3">{formatDateTime(session.sessionDate)}</p>
                                                                        </Card>
                                                                    </div>
                                                                    <StudentAttendanceTable attendances={attendance} fetchAttendanceList={fetchAttendances} sessionDate={session.sessionDate} sessionId={session.sessionId}/>
                                                                </div>
                                                            </div>
                                                        </Tab>
                                                        <Tab key={'assignment'} title={'Assignment'}>
                                                            <StudentResult assessmentId={assessmentId}></StudentResult>
                                                        </Tab>
                                                        <Tab key={'discussion'} title={'Discussion'}>
                                                            <div className="text-start">
                                                                {isFetchingDiscussion && <Loading />}
                                                                {(posts.length == 0 && !isFetchingDiscussion) ? (
                                                                    <div className="mt-8 flex align-middle text-md justify-center ">
                                                                        No discussions available in this session
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        {posts.map((item, index) => (
                                                                            <Card isPressable={true} onPress={() => window.location.href = `/discussion/${item.ForumId}`} key={index} className="w-full mt-5 cursor-pointer border-2 border-default-200 hover:border-default-400 px-1 py-1" shadow="none">
                                                                                <CardHeader className="justify-between">
                                                                                    <div className="flex gap-5">
                                                                                        <Avatar radius="full" size="md" src={`${item.CreatorImage ?? '/img/profile-picture-blank.jpeg'}`} />
                                                                                        <div className="flex flex-col gap-1 items-start justify-center">
                                                                                            <h4 className="text-small font-semibold leading-none text-default-600">{item.CreatorName}</h4>
                                                                                            <h5 className="text-small tracking-tight text-default-400">{item.CreatorEmail}</h5>
                                                                                        </div>
                                                                                    </div>
                                                                                    {(item.CreatorEmail === userData.email) && (
                                                                                        <div className="flex gap-1">
                                                                                            <Tooltip content="Edit Discussion">
                                                                                                <Button isIconOnly radius="full" variant="light" className="bg-none text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => {setIsEdit(true); setPost(item); onOpen()}} >
                                                                                                    <EditIcon/>
                                                                                                </Button>
                                                                                            </Tooltip>
                                                                                            <Tooltip color="danger" content="Delete Discussion">
                                                                                                <Button isIconOnly radius="full" variant="light" className="bg-none text-lg text-danger cursor-pointer active:opacity-50" onClick={() => {setIsDelete(true); setPost(item);  onOpen()}}>
                                                                                                    <DeleteIcon/>
                                                                                                </Button>
                                                                                            </Tooltip>
                                                                                        </div>
                                                                                    )}
                                                                                </CardHeader>
                                                                                <CardBody className="px-3 py-0 text-small text-default-400">
                                                                                    <h2 className="text-lg font-semibold text-gray-400">{item.ContentTitle}</h2>
                                                                                    <p className={`pt-2 ${item.ContentUrl != null ? 'pb-2' : ''}`}>{item.Content}</p>
                                                                                    {item.ContentUrl != null && (renderFile(item.ContentUrl, 'discussion'))}                                                 
                                                                                    <span className="pt-2">
                                                                                        {formatDateTime(item.UpdatedDate)}
                                                                                    </span>
                                                                                </CardBody>
                                                                                <CardFooter className="gap-3">
                                                                                    <div className="flex gap-1">
                                                                                        <p className="font-semibold text-default-400 text-small">{item.NumOfReplies}</p>
                                                                                        <p className=" text-default-400 text-small">Replies</p>
                                                                                    </div>
                                                                                </CardFooter>
                                                                            </Card>
                                                                        ))}
                                                                    </>
                                                                )}
                                                                {!isFetchingDiscussion && (
                                                                    <div className="flex items-center justify-between">
                                                                        <Pagination showShadow showControls total={Math.ceil(postDiscussions.length / discussionRowsPerPage)} page={discussionPage} onChange={setDiscussionPage} className="mt-7 mb-2"/>
                                                                        <Button onClick={() => {setIsCreate(true); onOpen()}} className="mt-7 mb-2 h-12" color="primary">Add New Discussion</Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </Tab>
                                                    </Tabs>
                                                </CardBody>
                                            </Card>    
                                        </Tab>
                                    ))}
                                </Tabs> 
                            </Tab>
                        </Tabs>
                    </>
                ) : (
                    <></>
                )}
            </div>
        </>
    )
}

export default courseDetailList;