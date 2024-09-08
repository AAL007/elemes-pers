'use client'
import * as React from "react";
import { useEffect } from "react";
import "@/components/ui/component.css"
// components
import {
  Input,
  Button,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Modal, 
  ModalContent,
  useDisclosure,
  Spinner,
  Select,
  SelectItem,
  Card,
  CardHeader,
  DatePicker,
} from "@nextui-org/react";
import { PlusIcon } from '@/components/icon/plus-icon';
import { EditIcon } from "@/components/icon/edit-icon";
import { DeleteIcon } from "@/components/icon/delete-icon";
import { EyeIcon } from "@/components/icon/eye-icon";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { loadUserFromStorage } from "@/lib/user-slice";
import { CourseDetail, SelectList } from "@/app/api/data-model";
import { Box, Grid } from "@mui/material";
import { 
  fetchCourseDetail, 
  fetchCourse, 
  createCourseDetail, 
  updateCourseDetail,
  deleteCourseDetail, 
  updateCourseDetailSessionNumber,
} from "@/app/api/enrollment/manage-course-detail";
import { uploadFileToAzureBlobStorage, replaceFileInAzureBlobStorage, deleteFileInAzureBlobStorageByUrl } from "@/app/api/azure-helper";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd"
import { IconDotsVertical } from "@tabler/icons-react"
import { useOptimistic, useTransition } from "react"
import { Tooltip } from "@nextui-org/react"
import { FileUpload } from "@/components/ui/file-upload";
import { generateGUID } from "../../../../../utils/boilerplate-function";
import { DateValue, now, parseAbsoluteToLocal } from '@internationalized/date';
import { resolve } from "path";
const defaultCourseDetail : CourseDetail = {
  CourseId: "",
  SessionId: "",
  SessionNumber: 0,
  SessionName: "",
  ContentUrl: "",
  LearningOutcome: "",
  LectureDate: new Date().toISOString(),
  CreatedBy: "",
  CreatedDate: new Date().toISOString(),
  UpdatedBy: "",
  UpdatedDate: new Date(0).toISOString(),
  ActiveFlag: false,
}

const ManageCourseDetail = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const today = new Date().toISOString();
  const [isFetchingCourses, setIsFetchingCourses] = React.useState(true);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isEdit, setIsEdit] = React.useState(false);
  const [isDelete, setIsDelete] = React.useState(false);
  const [isCreate, setIsCreate] = React.useState(false);
  const [courseId, setCourseId] = React.useState("");
  const [courseLabel, setCourseLabel] = React.useState("");
  const [uploadClicked, setUploadClicked] = React.useState(false);
  let [courseDetail, setCourseDetail] = React.useState<CourseDetail | any>(defaultCourseDetail);
  const [lecturerDate, setLecturerDate] = React.useState(parseAbsoluteToLocal(today));
  const [isLoading, setIsLoading] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const [existingFile, setExistingFile] = React.useState<File | null>(null);
  const [courseDetails, setCourseDetails] = React.useState<any[]>([]);
  const [courses, setCourses] = React.useState<SelectList[]>([]);
  const isValid = courseId !== ""

  const [, startTransition] = useTransition()
    const [optimisticState, swapOptimistic] = useOptimistic(
        courseDetails,
        (state, { sourceId, destinationId }) => {
            const sourceIndex = state.findIndex((item) => item.SessionId === sourceId);
            const destinationIndex = state.findIndex((item) => item.SessionId === destinationId);
            const updatedState = [...state];
            updatedState[sourceIndex] = state[destinationIndex];
            updatedState[destinationIndex] = state[sourceIndex];
            return updatedState;
        }
    )

    const handleFileUpload = (files: File[]) => {
      setFiles(files);
    }

    const convertDate = (date: any) => {
      return new Date(
        date.year,
        date.month - 1,
        date.day,
        date.hour,
        date.minute,
        date.second,
        date.millisecond
      ).toISOString();
    }

    const fetchFileFromUrl = async (url: string) => {
      const response = await fetch(url);
      const blob = await response.blob();
      const fileName = url.split("/").pop();
      return new File([blob], fileName || "file");
    }

    const handleEditClick = async (list: any) => {
      try {
        const resolvedList = await list;
        const resolvedFile = await resolvedList.File;
        await setExistingFile(resolvedFile);
        setIsEdit(true);
        onOpen();
        setLecturerDate(parseAbsoluteToLocal(resolvedList.LecturerDate));
        setCourseDetail(resolvedList);
      } catch (error) {
        console.error("Error resolving list:", error);
      }
    };

    const handleDeleteClick = async (list: any) => {
      try{
        const resolvedList = await list;
        await setCourseDetail(resolvedList);
        setIsDelete(true);
        onOpen();
      }catch(error){
        console.error("Error resolving list:", error);
      }
    }

    const fetchingCourseDetail = async () => {
        setIsFetchingCourses(true);
        await fetchCourseDetail(courseId).then((object: any) => {
            let courseDetails = object.data.map((z: any) => {
              const file = fetchFileFromUrl(z.ContentUrl);
              // console.log(file);
                return {
                    CourseId: z.CourseId,
                    SessionId: z.SessionId,
                    SessionNumber: z.SessionNumber.toString(),
                    SessionName: z.SessionName,
                    ContentUrl: z.ContentUrl,
                    File: file,
                    LearningOutcome: z.LearningOutcome,
                    LecturerDate: z.LectureDate,
                    CreatedBy: z.CreatedBy,
                    CreatedDate: z.CreatedDate,
                    UpdatedBy: z.UpdatedBy,
                    UpdatedDate: z.UpdatedDate,
                    ActiveFlag: z.ActiveFlag
                }
            })
            // console.log(courseDetails);
            setCourseDetails(courseDetails);
        })
        setIsFetchingCourses(false);
    }

    const onDragEnd = async (result: any) => {
        const sourceId = result.draggableId;
        const destinationId = courseDetails[result.destination.index].SessionId;
        swapOptimistic({ sourceId: sourceId, destinationId: destinationId });
        startTransition( async () => {
            let res = await updateCourseDetailSessionNumber(courseId, sourceId, destinationId);
            if (!res.success) {
                alert(res.message)
                return;
            }
            await fetchingCourseDetail();
        });
    };

  useEffect(() => {
    dispatch(loadUserFromStorage());
    fetchCourse().then((object: any) => {
        const courses = object.data.map((z: any) => {
            return {
                key: z.CourseId,
                label: z.CourseName
            }
        })
        setCourses(courses);
        setCourseId(courses[0].key);
    })
  }, [dispatch]);

  useEffect(() => {
    fetchingCourseDetail();
  }, [courseId])

  useEffect(() => {
    setCourseLabel(courses.find((z) => z.key === courseId)?.label || "");
  }, [courseId])

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
          setFiles([]);
          setLecturerDate(parseAbsoluteToLocal(today));
          setExistingFile(null);
          setCourseDetail(defaultCourseDetail);
          setUploadClicked(false);
          onOpenChange()
        }}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{isEdit ? "Edit Course Detail" : isDelete ? "Delete Course Detail" : isCreate ? "Add Course Detail" : ""}</ModalHeader>
              <ModalBody>
                {(isCreate || isEdit) ? (
                  <>
                    <Input
                      autoFocus
                      label="Session Name"
                      placeholder="Enter session name"
                      variant="bordered"
                      onClick={async () => await setUploadClicked(false)}
                      onChange={(e) => {setCourseDetail({...courseDetail, SessionName: e.target.value})}}
                      value={courseDetail.SessionName}
                    />
                    {isCreate && (
                        <Input
                            type="number"
                            autoFocus
                            label="Session Number"
                            placeholder="Enter session number"
                            variant="bordered"
                            onClick={async () => await setUploadClicked(false)}
                            onChange={(e) => {setCourseDetail({...courseDetail, SessionNumber: e.target.value})}}
                            value={courseDetail.SessionNumber}
                        />
                    )}
                    <Input
                      autoFocus
                      label="Learning Outcome"
                      placeholder="Enter learning outcome"
                      variant="bordered"
                      onClick={async () => await setUploadClicked(false)}
                      onChange={(e) => {setCourseDetail({...courseDetail, LearningOutcome: e.target.value})}}
                      value={courseDetail.LearningOutcome}
                    />
                    <DatePicker
                        isRequired
                        label="User Birth Date"
                        className="w-full"
                        granularity='second'
                        labelPlacement="inside"
                        onChange={setLecturerDate}
                        showMonthAndYearPickers
                        value={lecturerDate}
                    />
                    <div className={`border-2 ${uploadClicked ? 'border-black' : ''} border-350 rounded-2xl hover:${uploadClicked ? 'border-black' : 'border-gray-400'}`} onClick={() => setUploadClicked(true)}>
                      <p className="text-neutral-600 ml-3 mt-2" style={{ fontSize: "12.5px" }}>Upload Course Content</p>
                      <p className="text-neutral-500 ml-3" style={{ fontSize: "13.5px" }}>Drag or drop your files here or click to upload</p>
                      <FileUpload existingFile={existingFile} onChange={handleFileUpload} />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-4">
                    <p>Are you sure you want to delete <b>{courseDetail.SessionName}</b> ?</p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={() => {
                  setCourseDetail(defaultCourseDetail);
                  setIsEdit(false);
                  setIsDelete(false);
                  setIsCreate(false);
                  setFiles([]);
                  setExistingFile(null);
                  setLecturerDate(parseAbsoluteToLocal(today));
                  setUploadClicked(false);
                  onClose();
                }}>
                  Close
                </Button>
                {isCreate ? (
                  <Button color="primary" onPress={async() => {
                    setIsLoading(true);
                    try{
                      let sessionId = await generateGUID();
                      let blobUrl = await uploadFileToAzureBlobStorage("course-content", files[0], courseLabel, sessionId);
                      let newCourseDetail: CourseDetail = {
                        CourseId: courseId,
                        SessionId: sessionId,
                        SessionNumber: courseDetail.SessionNumber,
                        SessionName: courseDetail.SessionName,
                        ContentUrl: blobUrl,
                        LearningOutcome: courseDetail.LearningOutcome,
                        LectureDate: convertDate(lecturerDate),
                        CreatedBy: userData.name,
                        CreatedDate: new Date().toISOString(),
                        UpdatedBy: null,
                        UpdatedDate: new Date(0).toISOString(),
                        ActiveFlag: true,
                      }
                      await createCourseDetail(newCourseDetail).then((object: any) => {
                        if(!object.success){
                            alert(object.message)
                            return;
                        }
                        onClose();
                        setFiles([]);
                        setExistingFile(null);
                        setIsCreate(false);
                        setUploadClicked(false);
                        setLecturerDate(parseAbsoluteToLocal(today));
                        setCourseDetail(defaultCourseDetail);
                        fetchingCourseDetail();
                      })
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
                      let blobUrl = (files[0] != null && files[0] != undefined) ? await replaceFileInAzureBlobStorage("course-content", files[0], courseLabel, courseDetail.SessionId) : courseDetail.ContentUrl;
                      let updatedCourseDetail: CourseDetail = {
                        CourseId: courseDetail.CourseId,
                        SessionId: courseDetail.SessionId,
                        SessionNumber: courseDetail.SessionNumber,
                        SessionName: courseDetail.SessionName,
                        ContentUrl: blobUrl,
                        LearningOutcome: courseDetail.LearningOutcome,
                        LectureDate: convertDate(lecturerDate),
                        CreatedBy: courseDetail.CreatedBy,
                        CreatedDate: courseDetail.CreatedDate,
                        UpdatedBy: userData.name,
                        UpdatedDate: new Date().toISOString(),
                        ActiveFlag: courseDetail.ActiveFlag,
                      }
                      await updateCourseDetail(updatedCourseDetail).then((object: any) => {
                        if(object.success) {
                          onClose();
                          setFiles([]);
                          setExistingFile(null);
                          setUploadClicked(false);
                          setIsEdit(false);
                          setLecturerDate(parseAbsoluteToLocal(today));
                          setCourseDetail(defaultCourseDetail);
                          fetchingCourseDetail();
                        }else{
                          alert(object.message);
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
                      let res = await deleteFileInAzureBlobStorageByUrl("course-content", courseLabel, courseDetail.SessionId);
                      await deleteCourseDetail(courseId, courseDetail.SessionNumber).then((object: any) => {
                        if(object.success){
                          onClose();
                          setFiles([]);
                          setExistingFile(null);
                          setIsDelete(false);
                          setUploadClicked(false);
                          setLecturerDate(parseAbsoluteToLocal(today));
                          setCourseDetail(defaultCourseDetail);
                          fetchingCourseDetail();
                        }else{
                          alert(object.message);
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
      <Box component="div">
        <div>
            <Grid container className="mt-0.5 mb-3">
                <Grid item xs={6} sm={6} md={6} lg={6} className="mb-2">
                  <Select
                      required
                      label= "Course"
                      variant="bordered"
                      placeholder="Select a course"
                      errorMessage={isValid || !touched ? "" : "You need to select a course"}
                      isInvalid={isValid || !touched ? false: true}
                      className="w-full sm:max-w-[94%]"
                      selectedKeys={[courseId]}
                      onChange={(e) => setCourseId(e.target.value)}
                      onClose={() => setTouched(true)}
                      value={courseId}
                    >
                      {courses.map((course) => (
                        <SelectItem key={course.key}>
                          {course.label}
                        </SelectItem>
                      ))}
                    </Select>
                </Grid>
            </Grid>
        </div>
        <div className="flex justify-end">
            <Button onClick={() => {setIsCreate(true); onOpen()}} color="primary" endContent={<PlusIcon />}>
            Add New
            </Button>
        </div>
      </Box>
      <div className="mt-4">
        {isFetchingCourses && (
            <div className="flex justify-center items-center h-64">
                <Spinner color="primary" />
            </div>
        )}
        {isFetchingCourses === false && courseDetails.length === 0 && (
            <div className="flex justify-center items-center h-64">
                <p>No data found</p>
            </div>
        )}
        {isFetchingCourses === false && courseDetails.length > 0 && (
            <div>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId={"lists"}>
                        {(droppableProvided) => (
                            <ul
                                ref={droppableProvided.innerRef}
                                {...droppableProvided.droppableProps}
                                className="flex-grow flex flex-col"
                                style={{  alignItems: "center" }}
                            >
                                {optimisticState.map((list, index) => {
                                    return (
                                        <Draggable
                                            key={list.SessionId}
                                            draggableId={list.SessionId}
                                            index={index}
                                        >
                                            {(provided) => {
                                                return (
                                                    <Card
                                                        ref={provided.innerRef}
                                                        className="rounded-4 p-2 mt-4 flex max-w-[60%] justify-between items-center"
                                                        {...provided.draggableProps}
                                                    >
                                                        <CardHeader className="flex gap-4 items-center">
                                                            <button
                                                                {...provided.dragHandleProps}
                                                                className="cursor-grab"
                                                            >
                                                                <IconDotsVertical className="text-neutral-500" size={20}/>
                                                            </button>
                                                            <div>
                                                                <p>Session {index + 1}: <i>{list.SessionName}</i></p>
                                                            </div>
                                                            <Tooltip content="Edit Course Detail" className="flex gap-2">
                                                                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                                                    <EditIcon onClick={() => {handleEditClick(list)}} />
                                                                </span>
                                                            </Tooltip>
                                                            <Tooltip color="danger" content="Delete Course Detail">
                                                                <span className="text-lg text-danger cursor-pointer active:opacity-50">
                                                                    <DeleteIcon onClick={() => {handleDeleteClick(list)}}/>
                                                                </span>
                                                            </Tooltip>
                                                            <Tooltip content="Preview Assessment">
                                                                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                                                  <EyeIcon onClick={() => {window.open(list.ContentUrl, '_blank')}}/>
                                                                </span>
                                                            </Tooltip>
                                                        </CardHeader>
                                                    </Card>
                                                );
                                            }}
                                        </Draggable>
                                    )
                                })}
                            </ul>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        )}
      </div>
    </>
  );
}

export default ManageCourseDetail;
