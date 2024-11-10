'use client'
import * as React from "react";
import { useEffect } from "react";
import "@/components/ui/component.css"
// components
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
  Selection,
  ChipProps,
  SortDescriptor,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Modal, 
  ModalContent,
  useDisclosure,
  Spinner,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { PlusIcon } from '@/components/icon/plus-icon';
import { EditIcon } from "@/components/icon/edit-icon";
import { DeleteIcon } from "@/components/icon/delete-icon";
import { SearchIcon } from "@/components/icon/search-icon";
import { ChevronDownIcon } from "@/components/icon/chevron-down-icon";
import { EyeIcon } from "@/components/icon/eye-icon";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { loadUserFromStorage } from "@/lib/user-slice";
import { ContentLearningStyle, CourseDetail, SelectList } from "@/app/api/data-model";
import { Box, Grid } from "@mui/material";
import { 
  fetchCourseDetail, 
  fetchCourse, 
  createCourseDetail, 
  updateCourseDetail,
  deleteCourseDetail, 
  fetchLearningStyle,
  createContentLearningStyle,
  fetchContentLearningStyle,
  updateContentLearningStyle
} from "@/app/api/enrollment/manage-course-detail";
import { uploadFileToAzureBlobStorage, replaceFileInAzureBlobStorage, deleteFileInAzureBlobStorageByUrl } from "@/app/api/azure-helper";
import { Tooltip } from "@nextui-org/react"
import { generateGUID, fetchFileFromUrl } from "../../../../../utils/boilerplate-function";

const statusColorMap: Record<string, ChipProps["color"]>  = {
  active: "success",
  inactive: "danger",
};

const columns = [
  {name: "SESSION NAME", uid: "SessionName", sortable: true},
  {name: "SESSION NUMBER", uid: "SessionNumber", sortable: true},
  {name: "LEARNING OUTCOME", uid: "LearningOutcome", sortable: true},
  {name: "CREATED BY", uid: "CreatedBy"},
  {name: "UPDATED BY", uid: "UpdatedBy"},
  {name: "STATUS", uid: "ActiveFlag", sortable: true},
  {name: "ACTIONS", uid: "Actions"},
];

const statusOptions = [
  {name: "Active", uid: "active"},
  {name: "Inactive", uid: "inactive"},
];

const INITIAL_VISIBLE_COLUMNS = ["SessionName", "SessionNumber", "LearningOutcome", "CreatedBy", "UpdatedBy", "ActiveFlag", "Actions"];

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const defaultCourseDetail : CourseDetail = {
  CourseId: "",
  SessionId: "",
  SessionNumber: 0,
  SessionName: "",
  LearningOutcome: "",
  CreatedBy: "",
  CreatedDate: new Date().toISOString(),
  UpdatedBy: "",
  UpdatedDate: new Date(0).toISOString(),
  ActiveFlag: false,
}

type courseContent = {
  LearningStyleId: string,
  Content: File | null,
  URL: string,
}

const ManageCourseDetail = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "SessionName",
    direction: "ascending",
  });
  const [isFetchingCourses, setIsFetchingCourses] = React.useState(true);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isEdit, setIsEdit] = React.useState(false);
  const [isDelete, setIsDelete] = React.useState(false);
  const [isCreate, setIsCreate] = React.useState(false);
  const [courseId, setCourseId] = React.useState("");
  const [courseLabel, setCourseLabel] = React.useState("");
  const [uploadClicked, setUploadClicked] = React.useState(false);
  let [courseDetail, setCourseDetail] = React.useState<CourseDetail | any>(defaultCourseDetail);
  const [isLoading, setIsLoading] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const [existingFile, setExistingFile] = React.useState<File | null>(null);
  const [courseDetails, setCourseDetails] = React.useState<any[]>([]);
  const [courses, setCourses] = React.useState<SelectList[]>([]);
  const [learningStyles, setLearningStyles] = React.useState<SelectList[]>([]);
  const isValid = courseId !== ""
  const [contentLearningStyles, setContentLearningStyles] = React.useState<courseContent[]>([]);
  const [defaultCourseContent, setDefaultCourseContent] = React.useState([]);

    const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>, learningStyleId: string) => {
      if(e.target.files){
        const file = e.target.files[0];
        const newContentLearningStyles = contentLearningStyles.map((contentLearningStyle) => {
          if(contentLearningStyle.LearningStyleId === learningStyleId){
            return {
              ...contentLearningStyle,
              Content: file
            }
          }
          return contentLearningStyle;
        })
        setContentLearningStyles(newContentLearningStyles);
      }
    }

    const handleChangeUrl = (e: React.ChangeEvent<HTMLInputElement>, learningStyleId: string) => {
      const url = e.target.value;
      const newContentLearningStyles = contentLearningStyles.map((contentLearningStyle) => {
        if(contentLearningStyle.LearningStyleId === learningStyleId){
          return {
            ...contentLearningStyle,
            URL: url
          }
        }
        return contentLearningStyle;
      })
      setContentLearningStyles(newContentLearningStyles);
    }

    const handleFetchContentLearningStyle = async (sessionId: string) => {
      const object = await fetchContentLearningStyle(sessionId);
      const contentLearningStyles = await Promise.all(
        object.data.map(async (z: any) => {
          const file = z.LearningStyleId != '33658389-418c-48e7-afc7-9c08ec31a461' ? await fetchFileFromUrl(z.ContentUrl) : null;
          return {
            LearningStyleId: z.LearningStyleId,
            Content: null,
            URL: z.ContentUrl
          };
        })
      );
      // console.log(contentLearningStyles)
      setContentLearningStyles(contentLearningStyles);
    }

    const fetchLearningStyles = async() => {
      await fetchLearningStyle().then((object: any) => {
        const learningStyles = object.data.map((z: any) => {
          return {
            key: z.LearningStyleId,
            label: z.LearningStyleName
          }
        })
        const courseContent = learningStyles.map((learningStyle: any) => {
          return {
            LearningStyleId: learningStyle.key,
            Content: null,
            URL: ""
          }
        })
        setContentLearningStyles(courseContent);
        setDefaultCourseContent(courseContent);
        setLearningStyles(learningStyles);
      })
    }

    const fetchingCourseDetail = async () => {
        setCourseDetails([]);
        setIsFetchingCourses(true);
        await fetchCourseDetail(courseId).then((object: any) => {
            let courseDetails = object.data.map((z: any) => {
                return {
                    CourseId: z.CourseId,
                    SessionId: z.SessionId,
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
    fetchLearningStyles();
  }, []);

  useEffect(() => {
    fetchingCourseDetail();
  }, [courseId])

  useEffect(() => {
    setCourseLabel(courses.find((z) => z.key === courseId)?.label || "");
  }, [courseId])

  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredSessions = [...courseDetails];

    if (hasSearchFilter) {
      filteredSessions = filteredSessions.filter((session) =>
        session.SessionName.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }
    if (statusFilter !== "all" && Array.from(statusFilter).length !== statusOptions.length) {
      filteredSessions = filteredSessions.filter((session) =>
        Array.from(statusFilter).includes(session.ActiveFlag ? "active" : "inactive"),
      );
    }

    return filteredSessions;
  }, [courseDetails, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof CourseDetail];
      const second = b[sortDescriptor.column as keyof CourseDetail];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((session: CourseDetail, columnKey: React.Key) => {
    const cellValue = session[columnKey as keyof CourseDetail];

    switch (columnKey) {
      case "SessionName":
        return (
          <div className="flex flex-col">
            {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
            <p className="text-bold text-tiny capitalize text-default-400">{session.SessionName}</p>
          </div>
        );
      case "SessionNumber":
          return (
              <div className="flex flex-col">
              {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
              <p className="text-bold text-tiny capitalize text-default-400">{session.SessionNumber}</p>
              </div>
          );
      case "LearningOutcome":
        return (
          <div className="flex flex-col">
          {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
          <p className="text-bold text-tiny capitalize text-default-400">{session.LearningOutcome}</p>
          </div>
        );
      case "CreatedBy":
        return (
          <div className="flex flex-col">
            {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
            <p className="text-bold text-tiny capitalize text-default-400">{session.CreatedBy}</p>
          </div>
        );
        case "UpdatedBy":
          return (
            <div className="flex flex-col">
              {/* <p className="text-bold text-small capitalize">{role.UpdatedBy ?? "N/A"}</p> */}
              <p className="text-bold text-tiny capitalize text-default-400">{session.UpdatedBy ?? "N/A"}</p>
            </div>
          );
      case "ActiveFlag":
        return (
          <Chip className="capitalize" color={statusColorMap[session.ActiveFlag ? "active" : "inactive"]} size="sm" variant="flat">
            {session.ActiveFlag ? "active" : "inactive"}
          </Chip>
        );
      case "Actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit Course">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <EditIcon onClick={() => {handleFetchContentLearningStyle(session.SessionId); setIsEdit(true); setCourseDetail(session); onOpen()}} />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete Course">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <DeleteIcon onClick={() => {setIsDelete(true); setCourseDetail(session); onOpen()}}/>
              </span>
            </Tooltip>
            <Tooltip content="Preview Assessment">
                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                  {/* <EyeIcon onClick={() => {window.open(session.ContentUrl, '_blank')}}/> */}
                </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const onRowsPerPageChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(()=>{
    setFilterValue("")
    setPage(1)
  },[])

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search session..."
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button onClick={() => {setIsCreate(true); onOpen()}} color="primary" endContent={<PlusIcon />}>
              Add New
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {courseDetails.length} sessions</span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="25">25</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    courses.length,
    hasSearchFilter,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {/* {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${filteredItems.length} selected`} */}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
      </div>
    );
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

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
          setExistingFile(null);
          setContentLearningStyles(defaultCourseContent);
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
                    <Input
                      autoFocus
                      label="Learning Outcome"
                      placeholder="Enter learning outcome"
                      variant="bordered"
                      onClick={async () => await setUploadClicked(false)}
                      onChange={(e) => {setCourseDetail({...courseDetail, LearningOutcome: e.target.value})}}
                      value={courseDetail.LearningOutcome}
                    />
                    <h2 className="text-lg font-semibold">Course Content</h2>
                    {contentLearningStyles.map((contentLearningStyle, index) => (
                      <div className="flex gap-2 mt-1 items-center justify-between w-full" key={index}>
                        {(contentLearningStyle.LearningStyleId != '33658389-418c-48e7-afc7-9c08ec31a461') ? (
                          <>
                            <input onChange={(e) => {handleChangeFile(e, contentLearningStyle.LearningStyleId)}} type="file" className="relative w-full inline-flex shadow-sm border-default-200 hover:border-default-400 border-2 rounded-xl focus:border-black" style={{ padding: '13px' }} autoFocus/>
                            <Input autoFocus disabled readOnly variant="bordered" label="Learning Style" value={learningStyles.find(x => x.key == contentLearningStyle.LearningStyleId)?.label}/>
                            {isEdit && (
                              <EyeIcon className="relative w-1/5 inline-flex" onClick={() => {window.open(contentLearningStyle.URL, '_blank')}}></EyeIcon>
                            )}
                          </>
                        ) : (
                          <>
                            <Input autoFocus variant="bordered" className="w-full" label="Content Url" placeholder="Enter Content Url" value={contentLearningStyle.URL} onChange={(e) => {handleChangeUrl(e, contentLearningStyle.LearningStyleId)}}/>
                            <Input className="w-11/12" autoFocus disabled readOnly variant="bordered" label="Learning Style" value={learningStyles.find(x => x.key == contentLearningStyle.LearningStyleId)?.label}/>
                          </>
                        )}
                      </div>
                    ))}
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
                  setContentLearningStyles(defaultCourseContent);
                  setExistingFile(null);
                  setUploadClicked(false);
                  onClose();
                }}>
                  Close
                </Button>
                {isCreate ? (
                  <Button color="primary" onPress={async() => {
                    setIsLoading(true);
                    try{
                      const learningStyleWithNoContent = contentLearningStyles.filter((contentLearningStyle) => contentLearningStyle.Content === null && contentLearningStyle.URL == "").length;
                      if(courseDetail.sessionName == "" || courseDetail.SessionNumber == 0 || courseDetail.LearningOutcome == ""){
                        alert("Please fill in all the fields");
                        return;
                      }
                      if(learningStyleWithNoContent > 0){
                        alert("Please upload content for all learning style categories");
                        return;
                      }
                      let sessionId = await generateGUID();
                      let newCourseDetail: CourseDetail = {
                        CourseId: courseId,
                        SessionId: sessionId,
                        SessionNumber: parseInt(courseDetail.SessionNumber),
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
                      })
                      for(let i = 0; i < contentLearningStyles.length; i++){
                        let blobUrl = "";
                        if(contentLearningStyles[i].LearningStyleId != '33658389-418c-48e7-afc7-9c08ec31a461'){
                          const contentFile = contentLearningStyles[i].Content;
                          if(contentFile instanceof File){
                            blobUrl = await uploadFileToAzureBlobStorage("course-content", contentFile, courseLabel, `${sessionId}/${contentLearningStyles[i].LearningStyleId}`);
                          }
                        }else{
                          blobUrl = contentLearningStyles[i].URL;
                        }
                        let newContentLearningStyle: ContentLearningStyle = {
                          SessionId: sessionId,
                          LearningStyleId: contentLearningStyles[i].LearningStyleId,
                          ContentUrl: blobUrl,
                          CreatedBy: userData.name,
                          CreatedDate: new Date().toISOString(),
                          UpdatedBy: null,
                          UpdatedDate: new Date(0).toISOString(),
                        }
                        await createContentLearningStyle(newContentLearningStyle).then((object: any) => {
                          if(!object.success){
                            alert(object.message)
                            return;
                          }
                          onClose();
                          setFiles([]);
                          setExistingFile(null);
                          setContentLearningStyles(defaultCourseContent);
                          setIsCreate(false);
                          setUploadClicked(false);
                          setCourseDetail(defaultCourseDetail);
                          fetchingCourseDetail();
                        })
                      }
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
                      for(let i = 0; i < contentLearningStyles.length; i++){
                        let blobUrl = "";
                        if(contentLearningStyles[i].LearningStyleId != '33658389-418c-48e7-afc7-9c08ec31a461'){
                          const contentFile = contentLearningStyles[i].Content;
                          if(contentFile instanceof File){
                            blobUrl = await replaceFileInAzureBlobStorage("course-content", contentFile, courseLabel, `${courseDetail.SessionId}/${contentLearningStyles[i].LearningStyleId}`);
                          }else{
                            blobUrl = contentLearningStyles[i].URL;
                          }
                        }else{
                          blobUrl = contentLearningStyles[i].URL;
                        }
                        let newContentLearningStyle: ContentLearningStyle = {
                          SessionId: courseDetail.SessionId,
                          LearningStyleId: contentLearningStyles[i].LearningStyleId,
                          ContentUrl: blobUrl,
                          CreatedBy: userData.name,
                          CreatedDate: new Date().toISOString(),
                          UpdatedBy: null,
                          UpdatedDate: new Date(0).toISOString(),
                        }
                        console.log(newContentLearningStyle)
                        await updateContentLearningStyle(newContentLearningStyle).then((object: any) => {
                          if(!object.success){
                            alert(object.message)
                            return;
                          }
                        })
                      }
                      let updatedCourseDetail: CourseDetail = {
                        CourseId: courseDetail.CourseId,
                        SessionId: courseDetail.SessionId,
                        SessionNumber: parseInt(courseDetail.SessionNumber),
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
                          setFiles([]);
                          setExistingFile(null);
                          setContentLearningStyles(defaultCourseContent);
                          setUploadClicked(false);
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
                      for(let i = 0; i < contentLearningStyles.length; i++){
                        await deleteFileInAzureBlobStorageByUrl("course-content", courseLabel, `${courseDetail.SessionId}/${contentLearningStyles[i].LearningStyleId}`);
                      }
                      await deleteCourseDetail(courseDetail.SessionId).then((object: any) => {
                        if(object.success){
                          onClose();
                          setFiles([]);
                          setExistingFile(null);
                          setContentLearningStyles(defaultCourseContent);
                          setIsDelete(false);
                          setUploadClicked(false);
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
      </Box>
      <Table
        aria-label="Example table with custom cells, pagination and sorting"
        isHeaderSticky
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[382px]",
        }}
        selectionMode="single"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSortChange={
          setSortDescriptor
        }
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody isLoading={isFetchingCourses} loadingContent={<Spinner label="Loading ..."/>} emptyContent={"No sessions found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.SessionId}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}

export default ManageCourseDetail;
