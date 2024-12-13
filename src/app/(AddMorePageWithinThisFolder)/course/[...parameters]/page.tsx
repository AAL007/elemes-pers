'use client'
import * as React from "react";
import { useEffect } from "react";
import "@/components/ui/component.css"
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { 
    fetchSessionList,
    fetchSessionStatus,
    fetchAttendanceList, 
    fetchPeople, 
    isAssignmentCleared,
    isActivityLogWithSameLearningStyleExist,
    createOrUpdateSessionLog,
    createActivityLog,
    fetchDiscussions, 
    createDiscussion, 
    updateDiscussion, 
    deleteDiscussion,
    createAssessmentAnswer,
    createScore,
} from "@/app/api/course/course-detail-list";
import { fetchLearningStyle } from "@/app/api/home/dashboard";
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
    RadioGroup,
    Radio
} from "@nextui-org/react";
import Loading from "../../loading";
import { AssessmentAnswer, ForumPost, ForumPostResponse, StudentActivityLog, StudentSessionLog, Score } from "@/app/api/data-model";
import { generateGUID, formatDateTime, fetchFileFromUrl } from "../../../../../utils/boilerplate-function";
import { uploadFileToAzureBlobStorage, replaceFileInAzureBlobStorage, deleteFileInAzureBlobStorageByUrl } from "@/app/api/azure-helper";
import { FileUpload } from "@/components/ui/file-upload";
import PeopleTableComponent from "@/components/ui/people-table";
import AttendanceTableComponent from "@/components/ui/attendance-table";
import { EditIcon } from "@/components/icon/edit-icon";
import { DeleteIcon } from "@/components/icon/delete-icon";
import RatingModal from "@/components/ui/rating-modal";
import { fetchQuestionAnswer } from "@/app/api/assignment/create-edit-assignment";
import { question } from "../../assignment/create-edit-assignment/[...parameters]/page";

type SessionList = {
    assessmentId: string;
    contentUrl: string;
    file: File;
    sessionId: string;
    sessionName: string;
    sessionNumber: number;
    isContentClicked: boolean;
    isAssignmentClicked: boolean;
}

export type People = {
    name: string;
    email: string;
    role: string;
    profilePictureUrl: string;
    departmentName: string;
    activeFlag: boolean;
}

export type Attendance = {
    sessionId: string;
    sessionName: string;
    sessionNumber: string;
    sessionDate: string;
    onlineMeetingUrl: string;
    classroom: string; 
    status: boolean;
}

export type AssignmentResponse = {
    assessmentId: string;
    assessmentUrl: string;
    assessmentChances: number;
    sessionNumber: number;
    studentChances: number;
    createdDate: string;
    updatedDate: string;
}

type questionAnswer = {
    questionId: string;
    optionId: string;
    isAnswer: boolean;
}

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
    File: null,
    NumOfReplies: 0
}

const courseDetailList = ({params} : {params: {parameters: string}}) => {
    const userData = useSelector((state: RootState) => state.user);
    const [learningStyleId, setLearningStyleId] = React.useState("");
    const [sessionsList, setSessionsList] = React.useState<SessionList[]>([]);
    const [discussionPage, setDiscussionPage] = React.useState(1);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isFetchingDiscussion, setIsFetchingDiscussion] = React.useState(true);
    const discussionRowsPerPage = 5;
    const [people, setPeople] = React.useState<People[]>([]);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [isCreate, setIsCreate] = React.useState(false);
    const [isEdit, setIsEdit] = React.useState(false);
    const [isDelete, setIsDelete] = React.useState(false);
    const [post, setPost] = React.useState<ForumPostResponse>(defaultDiscussion);
    const [postDiscussions, setPostDiscussions] = React.useState<ForumPostResponse[]>([]);
    const [files, setFiles] = React.useState<File[]>([]);
    const [uploadClicked, setUploadClicked] = React.useState(false);
    const [existingFile, setExistingFile] = React.useState<File | null>(null);
    const [attendance, setAttendance] = React.useState<Attendance[]>([]);
    const [isButtonClicked, setIsButtonClicked] = React.useState(false);
    const [selected, setSelected] = React.useState<string>("content");
    const [sessionId, setSessionId] = React.useState<string>("");
    const [rating, setRating] = React.useState<number>(0);
    const [isRatingModalOpen, setIsRatingModalOpen] = React.useState(false);
    const [startTime, setStartTime] = React.useState<number | null>(null);
    const [duration, setDuration] = React.useState<number>(0);
    const [existingRating, setExistingRating] = React.useState<number | null>(null);
    const [disabledKeys, setDisabledKeys] = React.useState<string[]>([]);
    const [majorActiveTab, setMajorActiveTab] = React.useState<string>('sessions');
    const [questions, setQuestions] = React.useState<question[]>([]);
    const [counter, setCounter] = React.useState(0);
    const [answers, setAnswers] = React.useState<questionAnswer[]>([]);
    const [assessmentId, setAssessmentId] = React.useState<string>("");
    const [score, setScore] = React.useState<number>(0);
    const [isAssessmentCleared, setIsAssessmentCleared] = React.useState<boolean>(false);
    const [isQuizStarted, setIsQuizStarted] = React.useState<boolean>(false);

    const handleFileUpload = (files: File[]) => {
        setFiles(files);
    }

    const fetchIsAssignmentCleared = async(assessmentId: string) => {
        const res = await isAssignmentCleared(userData.id, assessmentId);
        if(!res.success){
            setScore(0);
            setIsAssessmentCleared(false);
            setIsQuizStarted(false);
            return;
        }
        if(res.data){
            setScore(res.data.Score);
            setIsAssessmentCleared(true);
            setIsQuizStarted(false);
            return;
        }
    }

    const fetchingExistingQuestionAnswer = async(assessmentId: string) => {
        const res = await fetchQuestionAnswer(assessmentId)
        if(res.success){
            let tempQuestions: question[] = []
            let questionMap: {[key: string]: question} = {}

            for(let i = 0; i < res.data.length; i++){
                const row = res.data[i];
                const { questionId, question, imageUrl, optionId, option, isAnswer } = row;

                if (!questionMap[questionId]) {
                    questionMap[questionId] = {
                        questionId: questionId,
                        question: question,
                        image: null,
                        imageUrl: imageUrl,
                        options: []
                    };
                }

                questionMap[questionId].options.push({
                    optionId: optionId,
                    option: option,
                    isAnswer: isAnswer
                });
            }
            tempQuestions = Object.values(questionMap);

            const answers = tempQuestions.map((question) => {
                return {
                    questionId: question.questionId,
                    optionId: '',
                    isAnswer: false
                }
            })

            setAnswers(answers);
            
            setQuestions(tempQuestions)
        }
    }

    const handleAnswerChange = (value: string, questionId: string, isAnswer: boolean) => {
        setAnswers((prevAnswers) =>
            prevAnswers.map((answer) =>
              answer.questionId === questionId ? { ...answer, optionId: value, isAnswer: isAnswer } : answer
            )
        );
    }

    const fetchSessionLists = async () => {
        const res = await fetchSessionList(userData.id, params.parameters[0], learningStyleId);
        if(!res.success){
            alert(res.message);
            setIsLoading(false);
            return;
        }
        const sessionsList = await Promise.all(res.data.map(async(z: any) => {
            const file = (z.contentUrl != null && learningStyleId != '33658389-418c-48e7-afc7-9c08ec31a461') ? await fetchFileFromUrl(z.contentUrl) : null;
            return {
                assessmentId: z.assessmentId,
                contentUrl: z.contentUrl,
                file: file,
                sessionId: z.sessionId,
                sessionName: z.sessionName,
                sessionNumber: z.sessionNumber,
                isContentClicked: z.isContentClicked,
                isAssignmentClicked: z.isAssignmentClicked,
            }
        }))
        setSessionsList(sessionsList);
        handleSessionLog(sessionsList[0].sessionId, true, false);
        setTimeout(() => {
            setIsLoading(false);
        }, 11000)
    }

    const fetchSessionStatuses = async () => {
        const res = await fetchSessionStatus(userData.id, params.parameters[0], learningStyleId);
        if(!res.success){
            alert(res.message);
            return;
        }
        const disabledKeys = res.data.filter((x: any) => x.isSessionLocked).map((x: any) => x.sessionId);
        setDisabledKeys(disabledKeys);
    }

    const handleSessionLog = async(sessionId: string, isContentClicked: boolean, isAssignmentClicked: boolean) => {
        const sessionLog: StudentSessionLog = {
            StudentId: userData.id,
            SessionId: sessionId,
            IsContentClicked: isContentClicked,
            IsAssignmentClicked: isAssignmentClicked,
            CreatedDate: new Date(),
            UpdatedDate: new Date()
        }

        const res = await createOrUpdateSessionLog(sessionLog);
        if(!res.success){
            alert(res.message);
            return;
        }
    }

    useEffect(() => {
        if(sessionId === "") return;
        if(selected === "content"){
            handleSessionLog(sessionId, true, false);
        }else if(selected === "assignment"){
            handleSessionLog(sessionId, false, true);
        }
    }, [selected])

    useEffect(() => {
        if(majorActiveTab != 'sessions') {
            if(startTime){
                const endTime = Date.now();
                const duration = endTime - startTime;
                console.log(`User spent ${Math.round(duration / 1000)} seconds on the content tab`)
                setDuration(Math.round(duration/1000));
                setStartTime(null)
            }
        }else{
            if(selected === "content"){
                setStartTime(Date.now());
            }else{
                if(startTime){
                    const endTime = Date.now();
                    const duration = endTime - startTime;
                    console.log(`User spent ${Math.round(duration / 1000)} seconds on the content tab`)
                    setDuration(Math.round(duration/1000));
                    setStartTime(null)
                }
            }
        }
    }, [selected, sessionId, majorActiveTab])

    useEffect(() => {
        if(duration == 0){
            return;
        }
        if(duration < 30){
            setDuration(0);
            return;
        }
        existingRating ?? setIsRatingModalOpen(true);   
        if(existingRating){
            addActivityLog(existingRating);
        }
    }, [duration])

    const addActivityLog = async(rating: number) => {
        const activityLog: StudentActivityLog = {
            StudentId: userData.id,
            SessionId: sessionId,
            LearningStyleId: learningStyleId,
            TimeSpent: duration,
            Rating: rating,
            CreatedDate: new Date().toISOString(),
        }

        const res = await createActivityLog(activityLog);
        if(!res.success){
            alert(res.message);
            return;
        }
        fetchSessionStatuses();
        fetchIsActivityLogWithSameLearningStyleExist();
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

    const renderFile = (file: File) => {
        const fileName = file.name.split('?')[0].split('/').pop();
        const fileExtension = fileName?.split('.').pop()?.toLowerCase();
        switch (true) {
            case fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png' || fileExtension === 'gif':
                return <img alt={file.name} src={URL.createObjectURL(file)} className="w-full rounded-xl" />;
            case fileExtension === 'mp4' || fileExtension === 'webm' || fileExtension === 'avi' || fileExtension === 'mov':
                return <video controls className="w-full rounded-xl" src={URL.createObjectURL(file)} />;
            case fileExtension === 'mp3' || fileExtension === 'wav' || fileExtension === 'ogg' || fileExtension === 'mpeg':
                return <audio controls className="w-full rounded-xl" src={URL.createObjectURL(file)} />;
            case fileExtension === 'pdf':
                return <iframe src={URL.createObjectURL(file)} className="w-full h-full rounded-xl" />;
            case fileExtension === 'doc' || fileExtension === 'docx' || fileExtension === 'xls' || fileExtension === 'xlsx' || fileExtension === 'ppt' || fileExtension === 'pptx':
                return <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(URL.createObjectURL(file))}`} className="w-full h-full rounded-xl" />;
            default:
                return <a href={URL.createObjectURL(file)} download={file.name}>Download Attachment</a>;
        }
    }

    const handleSubmitAssessmentAnswer = async() => {
        const unansweredQuestions = answers.filter(x => x.optionId == '');
        if(unansweredQuestions.length > 0){
            alert('Please answer all the questions');
            setIsButtonClicked(false);
            return;
        }
        for(let i = 0; i < answers.length; i++){
            const assessmentAnswer: AssessmentAnswer = {
                AssessmentAnswerId: await generateGUID(),
                AssessmentId: assessmentId,
                StudentId: userData.id,
                QuestionId: answers[i].questionId,
                OptionId: answers[i].optionId,
                IsCorrect: answers[i].isAnswer,
                CreatedDate: new Date().toISOString(),
            }
            const res = await createAssessmentAnswer(assessmentAnswer);
            if(!res.success){
                alert(res.message);
                setIsButtonClicked(false);
                return;
            }
        }
        const correctAnswer = answers.filter(x => x.isAnswer == true).length;
        const score =Math.round(correctAnswer / answers.length * 100);
        const newScore: Score = {
            StudentId: userData.id,
            AssessmentId: assessmentId,
            Score: score,
            CreatedDate: new Date().toISOString(),
        }
        const res = await createScore(newScore);
        if(!res.success){
            alert(res.message);
            setIsButtonClicked(false);
            return;
        }
        setIsButtonClicked(false);
        setIsQuizStarted(false);
        fetchSessionStatuses();
        fetchIsAssignmentCleared(assessmentId);
    }

    const fetchAttendances = async() => {
        const res = await fetchAttendanceList(userData.id, params.parameters[0], params.parameters[1]);
        if(!res.success){
            alert(res.message);
            return;
        }
        setAttendance(res.data);
    }

    const fetchPeoples = async () => {
        const res = await fetchPeople(params.parameters[0], params.parameters[1]);
        if(!res.success){
            alert(res.message);
            setIsLoading(false)
            return;
        }
        setPeople(res.data);
    }

    const fetchStudentLearningStyle = async (studentId: string) => {
        const res = await fetchLearningStyle(studentId);
        if(!res.success){
            alert(res.message);
            return;
        }
        setLearningStyleId(res.data[0].LearningStyleId);
    }

    const fetchIsActivityLogWithSameLearningStyleExist = async() => {
        const res = await isActivityLogWithSameLearningStyleExist(sessionId == "" ? sessionsList[0].sessionId : sessionId, userData.id, learningStyleId);
        if(!res.success){
            // console.log(res.message)
            setExistingRating(null);
            return;
        }
        // console.log(res.data?.Rating)
        setExistingRating(res.data?.Rating);
    }

    const posts = React.useMemo(() => {
        const start = (discussionPage - 1) * discussionRowsPerPage;
        const end = start + discussionRowsPerPage;
        
        return postDiscussions.slice(start, end);
    }, [discussionPage, postDiscussions, discussionRowsPerPage]);

    useEffect(() => {
        fetchStudentLearningStyle(userData.id);
    }, [])

    useEffect(() => {
        setIsLoading(true);
        // fetchAssignmentLists();
        fetchAttendances();
        fetchPeoples();
        fetchSessionStatuses();
        fetchSessionLists();
    }, [params.parameters, learningStyleId])

    useEffect(() => {
        if(sessionsList[0] == undefined || learningStyleId === "") return;
        fetchIsActivityLogWithSameLearningStyleExist();
    }, [learningStyleId, sessionId, sessionsList])

    useEffect(() => {
        if(sessionId === "") return;
        fetchingDiscussions();
        const assessmentId = sessionsList.find(x => x.sessionId == sessionId)?.assessmentId;
        console.log(assessmentId)
        setAssessmentId(assessmentId ?? '');
        fetchIsAssignmentCleared(assessmentId ?? '');
        fetchingExistingQuestionAnswer(assessmentId ?? '');
    }, [sessionId])

    return (
        <>
            <RatingModal 
                isOpen={isRatingModalOpen} 
                onOpenChange={() => setIsRatingModalOpen(!isRatingModalOpen)} 
                fetchIsActivityLogWithSameLearningStyleExist={fetchIsActivityLogWithSameLearningStyleExist}
                setRating={setRating}
                studentId={userData.id}
                sessionId={sessionId}
                learningStyleId={learningStyleId}
                duration={duration}
            />
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
                                                                {session.file != null ? renderFile(session.file) : learningStyleId == '33658389-418c-48e7-afc7-9c08ec31a461' ?  (
                                                                    <>
                                                                        <p className="mb-4 font-semibold text-lg ">
                                                                            {session.sessionNumber == 1 ? 
                                                                            "Move the balloon near either the clothes or wall to see how the static electricity works. You can choose one or two balloons and see what will happen.":
                                                                            session.sessionNumber == 2 ? 
                                                                            "Use the property to affect the lever. Keep the plank balance. You can see how the mass of the object affect the plank balance." :
                                                                            session.sessionNumber == 3 ?
                                                                            "Play with the voltage and resistance. You can see how the circuit will change when either voltage or resistance is fixed and varied." : 
                                                                            session.sessionNumber == 4 ? 
                                                                            "Play with the resistivity, length and area. You can see how the resistance will change while changing the variables." :
                                                                            session.sessionNumber == 5 ?
                                                                            "You can select five modes to play include intro (basic of the sound waves), measure (measure how long is the sound waves based on the frequency and amplitude), two sources (sound waves from two sources), reflection (play with the frequency, amplitude, wall angle and position to see how the sound waves will reflect from the wall) and air pressure (play with the frequency, amplitude, audio control and air density in box to see the air pressure in the box)." :
                                                                            "Play with the light include white light, monochromatic light and rainbows to see how a person will describe the light color."}
                                                                        </p>
                                                                        <iframe src={session.contentUrl} className="w-full h-[80vh]" allowFullScreen={true}></iframe>
                                                                    </>
                                                                ) : <p>No content available</p>}
                                                            </div>
                                                        </Tab>
                                                        <Tab key={'assignment'} title={'Assignment'}>
                                                            {(!isAssessmentCleared && !isQuizStarted && questions.length != 0) && (
                                                                <div className="flex flex-col w-full items-center">
                                                                    <img className="mx-auto justify-center" src={'/img/start-quiz.png'} alt="start-quiz"/>
                                                                    <div className="flex justify-end">
                                                                        <Button className="h-14 w-24 mr-2" color="primary" variant="solid" onClick={() => {setIsQuizStarted(true)}}>Start Quiz</Button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {(isAssessmentCleared && !isQuizStarted) && (
                                                                <div className="flex flex-col justify-center mb-3 items-center w-full">
                                                                    <img src={'/img/trophy.png'} alt="trophy"/>
                                                                    <h2 className="font-extrabold text-4xl">{score}</h2>
                                                                    <h2 className="font-medium text-lg mt-2">Your total score</h2>
                                                                </div>
                                                            )}
                                                            {(questions.length == 0) && (
                                                                <div className="flex w-full justify-center items-center">
                                                                    No questions available
                                                                </div>
                                                            )}
                                                            {(questions.length != 0 && isQuizStarted) && (
                                                                <div className="px-2 py-2">
                                                                    <div className="flex justify-between mt-4 items-center">
                                                                        <h2 className="text-lg font-bold mr-5">{counter + 1}. {questions[counter].question}</h2>
                                                                    </div>
                                                                    {(questions[counter].imageUrl != null && questions[counter].imageUrl != '') && <img className="pl-4 w-1/4 h-1/4 mt-2 mb-2" src={questions[counter].imageUrl as string} alt="question-image" />}
                                                                    <RadioGroup value={answers.find(x => x.questionId == questions[counter].questionId)?.optionId} onValueChange={(e) => {handleAnswerChange(e, questions[counter].questionId, questions[counter].options.find(x => x.optionId == e)?.isAnswer ? true : false)}}>
                                                                        {questions[counter].options.map((option) => (
                                                                            <Radio className="ml-4 shadow-sm items-center justify-start inline-flex w-full max-w-md bg-content1 cursor-pointer rounded-lg gap-2 p-2 border-2 data-[selected=true]:border-primary mt-2 mb-2" key={option.optionId} value={option.optionId.toString()}>{option.option}</Radio>
                                                                        ))}
                                                                    </RadioGroup>
                                                                    <div className="mt-8 flex w-full pl-8 justify-end">
                                                                        {counter > 0 && (
                                                                            <div className="mr-3">
                                                                                <Button variant="bordered" color="primary" onClick={() => setCounter(counter - 1)}>Back</Button>
                                                                            </div>
                                                                        )}
                                                                        {(questions.length > 1 && counter+1 != questions.length) && (
                                                                            <div className="mr-3">
                                                                                <Button color="primary" onClick={() => {setCounter(counter + 1)}}>Next</Button>
                                                                            </div>
                                                                        )}
                                                                        <div>
                                                                            {<Button isLoading={isButtonClicked} color="success" onClick={() => {setIsButtonClicked(true); handleSubmitAssessmentAnswer()}}>Submit</Button>}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
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
                                                                                    <p className={`pt-2 ${item.File != null ? 'pb-2' : ''}`}>{item.Content}</p>
                                                                                    {item.File != null && (renderFile(item.File))}                                                 
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
                            <Tab key={'attendance'} title={'Attendance'}>
                                <Card>
                                    <AttendanceTableComponent attendances={attendance} studentId={userData.id} fetchAttendanceList={fetchAttendances}/>
                                </Card>
                            </Tab>
                            <Tab key={'people'} title={'People'}>
                                <Card>
                                    <PeopleTableComponent peoples={people} isLoading={isLoading} />
                                </Card>
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