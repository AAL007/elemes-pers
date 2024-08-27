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
} from "@nextui-org/react";
import { PlusIcon } from '@/components/icon/plus-icon';
import { EditIcon } from "@/components/icon/edit-icon";
import { DeleteIcon } from "@/components/icon/delete-icon";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { loadUserFromStorage } from "@/lib/user-slice";
import { CourseDetail, SelectList } from "@/app/api/data-model";
import { Box, Grid } from "@mui/material";
import { fetchCourseDetail, fetchCourse, createCourseDetail, updateCourseDetail, deleteCourseDetail, updateCourseDetailSessionNumber } from "@/app/api/enrollment/manage-course-detail";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd"
import { IconDotsVertical } from "@tabler/icons-react"
import { useOptimistic, useTransition } from "react"
import { Tooltip } from "@nextui-org/react"

const defaultCourseDetail : CourseDetail = {
  CourseId: "",
  SessionNumber: 0,
  SessionName: "",
  LearningOutcome: "",
  CreatedBy: "",
  CreatedDate: new Date().toISOString(),
  UpdatedBy: "",
  UpdatedDate: new Date(0).toISOString(),
  ActiveFlag: false,
}

const ManageCourseDetail = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const [isFetchingCourses, setIsFetchingCourses] = React.useState(true);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isEdit, setIsEdit] = React.useState(false);
  const [isDelete, setIsDelete] = React.useState(false);
  const [isCreate, setIsCreate] = React.useState(false);
  const [courseId, setCourseId] = React.useState("");
  let [courseDetail, setCourseDetail] = React.useState<CourseDetail | any>(defaultCourseDetail);
  const [isLoading, setIsLoading] = React.useState(false);
  const [touched, setTouched] = React.useState(false);

  const [courseDetails, setCourseDetails] = React.useState<any[]>([]);
  const [courses, setCourses] = React.useState<SelectList[]>([]);
  const isValid = courseId !== ""

  const [, startTransition] = useTransition()
    const [optimisticState, swapOptimistic] = useOptimistic(
        courseDetails,
        (state, { sourceId, destinationId }) => {
            const sourceIndex = state.findIndex((item) => item.SessionNumber === sourceId);
            const destinationIndex = state.findIndex((item) => item.SessionNumber === destinationId);
            const updatedState = [...state];
            updatedState[sourceIndex] = state[destinationIndex];
            updatedState[destinationIndex] = state[sourceIndex];
            return updatedState;
        }
    )

    const fetchingCourseDetail = async () => {
        setIsFetchingCourses(true);
        await fetchCourseDetail(courseId).then((object: any) => {
            let courseDetails = object.data.map((z: any) => {
                return {
                    CourseId: z.CourseId,
                    SessionNumber: z.SessionNumber.toString(),
                    SessionName: z.SessionName,
                    LearningOutcome: z.LearningOutcome,
                    CreatedBy: z.CreatedBy,
                    CreatedDate: z.CreatedDate,
                    UpdatedBy: z.UpdatedBy,
                    UpdatedDate: z.UpdatedDate,
                    ActiveFlag: z.ActiveFlag
                }
            })
            setCourseDetails(courseDetails);
        })
        setIsFetchingCourses(false);
    }

    const onDragEnd = async (result: any) => {
        const sourceId = result.draggableId;
        const destinationId = courseDetails[result.destination.index].SessionNumber;
        swapOptimistic({ sourceId: sourceId, destinationId: destinationId });
        startTransition( async () => {
            let res = await updateCourseDetailSessionNumber(courseId, parseInt(sourceId), parseInt(destinationId));
            if (!res.success) {
                console.log(res.message);
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
          setCourseDetail(defaultCourseDetail);
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
                            onChange={(e) => {setCourseDetail({...courseDetail, SessionNumber: e.target.value})}}
                            value={courseDetail.SessionNumber}
                        />
                    )}
                    <Input
                      autoFocus
                      label="Learning Outcome"
                      placeholder="Enter learning outcome"
                      variant="bordered"
                      onChange={(e) => {setCourseDetail({...courseDetail, LearningOutcome: e.target.value})}}
                      value={courseDetail.LearningOutcome}
                    />
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
                  onClose();
                }}>
                  Close
                </Button>
                {isCreate ? (
                  <Button color="primary" onPress={async() => {
                    setIsLoading(true);
                    try{
                      let newCourseDetail: CourseDetail = {
                        CourseId: courseId,
                        SessionNumber: courseDetail.SessionNumber,
                        SessionName: courseDetail.SessionName,
                        LearningOutcome: courseDetail.LearningOutcome,
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
                        setIsCreate(false);
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
                      let updatedCourseDetail: CourseDetail = {
                        CourseId: courseDetail.CourseId,
                        SessionNumber: courseDetail.SessionNumber,
                        SessionName: courseDetail.SessionName,
                        LearningOutcome: courseDetail.LearningOutcome,
                        CreatedBy: courseDetail.CreatedBy,
                        CreatedDate: courseDetail.CreatedDate,
                        UpdatedBy: userData.name,
                        UpdatedDate: new Date().toISOString(),
                        ActiveFlag: courseDetail.ActiveFlag,
                      }
                      await updateCourseDetail(updatedCourseDetail).then((object: any) => {
                        if(object.success) {
                          onClose();
                          setIsEdit(false);
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
                      await deleteCourseDetail(courseId, courseDetail.SessionNumber).then((object: any) => {
                        if(object.success){
                          onClose();
                          setIsDelete(false);
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
                                            key={list.SessionNumber}
                                            draggableId={list.SessionNumber}
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
                                                                    <EditIcon onClick={() => {setIsEdit(true); setCourseDetail(list); onOpen()}} />
                                                                </span>
                                                            </Tooltip>
                                                            <Tooltip color="danger" content="Delete Course Detail">
                                                                <span className="text-lg text-danger cursor-pointer active:opacity-50">
                                                                    <DeleteIcon onClick={() => {setIsDelete(true); setCourseDetail(list); onOpen()}}/>
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
