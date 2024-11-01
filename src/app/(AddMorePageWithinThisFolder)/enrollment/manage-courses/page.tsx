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
  Tooltip,
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
import { ChevronDownIcon } from '@/components/icon/chevron-down-icon';
import { SearchIcon } from '@/components/icon/search-icon';
import { createCourse, deleteCourse, fetchCourses, updateCourse } from "@/app/api/enrollment/manage-courses";
import { generateGUID } from "../../../../../utils/boilerplate-function";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { loadUserFromStorage } from "@/lib/user-slice";
import { MsCourse } from "@/app/api/data-model";
import { uploadFileToAzureBlobStorage } from "@/app/api/azure-helper";
import { FileUpload } from "@/components/ui/file-upload";
import { set } from "lodash";

const statusColorMap: Record<string, ChipProps["color"]>  = {
  active: "success",
  inactive: "danger",
};

const columns = [
  {name: "COURSE NAME", uid: "CourseName", sortable: true},
  {name: "NUMBER OF SESSION", uid: "NumOfSession", sortable: true},
  {name: "TOTAL CREDITS", uid: "TotalCredits", sortable: true},
  {name: "CREATED BY", uid: "CreatedBy"},
  {name: "UPDATED BY", uid: "UpdatedBy"},
  {name: "STATUS", uid: "ActiveFlag", sortable: true},
  {name: "ACTIONS", uid: "Actions"},
];

const statusOptions = [
  {name: "Active", uid: "active"},
  {name: "Inactive", uid: "inactive"},
];

const defaultCourse : MsCourse = {
  CourseImage: "",
  CourseId: "",
  CourseName: "",
  NumOfSession: 0,
  TotalCredits: 0,
  CreatedBy: "",
  CreatedDate: new Date().toISOString(),
  UpdatedBy: "",
  UpdatedDate: new Date(0).toISOString(),
  ActiveFlag: false,
}

const INITIAL_VISIBLE_COLUMNS = ["CourseName", "NumOfSession", "TotalCredits", "CreatedBy", "UpdatedBy", "ActiveFlag", "Actions"];

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const ManageCourses = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "CourseName",
    direction: "ascending",
  });
  const [isFetchingCourses, setIsFetchingCourses] = React.useState(true);
  const [imageErrorMessage, setImageErrorMessage] = React.useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isEdit, setIsEdit] = React.useState(false);
  const [isDelete, setIsDelete] = React.useState(false);
  const [isCreate, setIsCreate] = React.useState(false);
  const [courseId, setCourseId] = React.useState("");
  let [course, setCourse] = React.useState<MsCourse | any>(defaultCourse);
  const [isLoading, setIsLoading] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState("");
  const [sessionErrorMessage, setSessionErrorMessage] = React.useState("");
  const [totalCreditsErrorMessage, setTotalCreditsErrorMessage] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const [existingFile, setExistingFile] = React.useState<File | null>(null);
  const [uploadClicked, setUploadClicked] = React.useState(false);
//   const [value, setValue] = React.useState("");
//   const [touched, setTouched] = React.useState(false);
//   const [roleCategories, setRoleCategories] = React.useState<SelectList[]>([])

//   const isValid = value !== ""

  const [courses, setCourses] = React.useState<MsCourse[]>([]);
  useEffect(() => {
    dispatch(loadUserFromStorage());
    setIsFetchingCourses(true);
    fetchCourses().then((object: any) => {
      setCourses(object.data || []);
    });
    setIsFetchingCourses(false);
  }, [dispatch]);

  const handleFileUpload = (files: File[]) => {
    setFiles(files);
  }

  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredCourses = [...courses];

    if (hasSearchFilter) {
      filteredCourses = filteredCourses.filter((course) =>
        course.CourseName.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }
    if (statusFilter !== "all" && Array.from(statusFilter).length !== statusOptions.length) {
      filteredCourses = filteredCourses.filter((course) =>
        Array.from(statusFilter).includes(course.ActiveFlag ? "active" : "inactive"),
      );
    }

    return filteredCourses;
  }, [courses, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof MsCourse];
      const second = b[sortDescriptor.column as keyof MsCourse];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((course: MsCourse, columnKey: React.Key) => {
    const cellValue = course[columnKey as keyof MsCourse];

    switch (columnKey) {
      case "CourseName":
        return (
          <div className="flex flex-col">
            {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
            <p className="text-bold text-tiny capitalize text-default-400">{course.CourseName}</p>
          </div>
        );
      case "NumOfSession":
          return (
              <div className="flex flex-col">
              {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
              <p className="text-bold text-tiny capitalize text-default-400">{course.NumOfSession}</p>
              </div>
          );
      case "TotalCredits":
        return (
          <div className="flex flex-col">
          {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
          <p className="text-bold text-tiny capitalize text-default-400">{course.TotalCredits}</p>
          </div>
        );
      case "CreatedBy":
        return (
          <div className="flex flex-col">
            {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
            <p className="text-bold text-tiny capitalize text-default-400">{course.CreatedBy}</p>
          </div>
        );
        case "UpdatedBy":
          return (
            <div className="flex flex-col">
              {/* <p className="text-bold text-small capitalize">{role.UpdatedBy ?? "N/A"}</p> */}
              <p className="text-bold text-tiny capitalize text-default-400">{course.UpdatedBy ?? "N/A"}</p>
            </div>
          );
      case "ActiveFlag":
        return (
          <Chip className="capitalize" color={statusColorMap[course.ActiveFlag ? "active" : "inactive"]} size="sm" variant="flat">
            {course.ActiveFlag ? "active" : "inactive"}
          </Chip>
        );
      case "Actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit Course">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <EditIcon onClick={() => {setIsEdit(true); setCourseId(course.CourseId); setCourse(course); onOpen(); console.log(course.CourseImage)}} />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete Course">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <DeleteIcon onClick={() => {setIsDelete(true); setCourseId(course.CourseId); setCourse(course); onOpen()}}/>
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
            placeholder="Search course..."
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
          <span className="text-default-400 text-small">Total {courses.length} courses</span>
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
          setCourse(defaultCourse);
          setNameErrorMessage("");
          setSessionErrorMessage("");
          setTotalCreditsErrorMessage("");
          setImageErrorMessage("");
          setFiles([]);
          setExistingFile(null);
          setUploadClicked(false);
          onOpenChange()
        }}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{isEdit ? "Edit Course" : isDelete ? "Delete Course" : isCreate ? "Add Course" : ""}</ModalHeader>
              <ModalBody>
                {(isCreate || isEdit) ? (
                  <>
                    <Input
                      autoFocus
                      label="Course Name"
                      placeholder="Enter course name"
                      variant="bordered"
                      onClick={() => setUploadClicked(false)}
                      onChange={(e) => {setCourse({...course, CourseName: e.target.value})}}
                      value={course.CourseName}
                    />
                    <h5 className="text-default-400 ml-1" style={{ color: "red", fontSize: "12px" }}>
                      {nameErrorMessage}
                    </h5>
                    <Input
                      autoFocus
                      label="Number of Sessions"
                      placeholder="Enter number of sessions"
                      variant="bordered"
                      onClick={() => setUploadClicked(false)}
                      onChange={(e) => {setCourse({...course, NumOfSession: e.target.value})}}
                      value={course.NumOfSession}
                    />
                    <h5 className="text-default-400 ml-1" style={{ color: "red", fontSize: "12px" }}>
                      {sessionErrorMessage}
                    </h5>
                    <Input
                      autoFocus
                      label="Number of Credits"
                      placeholder="Enter number of credits"
                      variant="bordered"
                      onClick={() => setUploadClicked(false)}
                      onChange={(e) => {setCourse({...course, TotalCredits: e.target.value})}}
                      value={course.TotalCredits}
                    />
                    <h5 className="text-default-400 ml-1" style={{ color: "red", fontSize: "12px" }}>
                      {totalCreditsErrorMessage}
                    </h5>
                    <div className={`border-2 ${uploadClicked ? 'border-black' : ''} border-350 rounded-2xl hover:${uploadClicked ? 'border-black' : 'border-gray-400'}`} onClick={() => setUploadClicked(true)}>
                      <p className="text-neutral-600 ml-3 mt-2" style={{ fontSize: "12.5px" }}>Upload Course Image</p>
                      <p className="text-neutral-500 ml-3" style={{ fontSize: "13.5px" }}>Drag or drop your files here or click to upload</p>
                      <FileUpload existingFile={existingFile} onChange={handleFileUpload} imageUrl={course.CourseImage}/>
                    </div>
                    <h5 className="text-default-400 ml-1" style={{ color: "red", fontSize: "12px" }}>
                      {imageErrorMessage}
                    </h5>
                  </>
                ) : (
                  <div className="flex flex-col gap-4">
                    <p>Are you sure you want to delete <b>{course.CourseName}</b> ?</p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={() => {
                  setCourse(defaultCourse);
                  setIsEdit(false);
                  setIsDelete(false);
                  setIsCreate(false);
                  setNameErrorMessage("");
                  setTotalCreditsErrorMessage("");
                  setSessionErrorMessage("");
                  setFiles([]);
                  setExistingFile(null);
                  setImageErrorMessage("");
                  setUploadClicked(false);
                  onClose();
                }}>
                  Close
                </Button>
                {(isCreate) ? (
                  <Button color="primary" onPress={async() => {
                    setIsLoading(true);
                    try{
                      if(files.length == 0){
                        setImageErrorMessage("Please upload course image!");
                        return
                      }
                      let courseId = await generateGUID();
                      let blobUrl = await uploadFileToAzureBlobStorage("course-image", files[0], course.CourseName, courseId)
                      let newCourse = {
                        CourseImage: blobUrl,
                        CourseId: courseId,
                        CourseName: course.CourseName,
                        NumOfSession: course.NumOfSession,
                        TotalCredits: course.TotalCredits,
                        CreatedBy: userData.name,
                        CreatedDate: new Date().toISOString(),
                        UpdatedBy: null,
                        UpdatedDate: new Date(0).toISOString(),
                        ActiveFlag: true,
                      }
                      await createCourse(newCourse).then((object: any) => {
                        if(object.statusCode == 200){
                          onClose();
                          setIsCreate(false);
                          setCourse(defaultCourse);
                          fetchCourses().then((object: any) => {
                            setCourses(object.data || []);
                          })
                          setExistingFile(null);
                          setFiles([]);
                          setUploadClicked(false);
                          setImageErrorMessage("");
                          setNameErrorMessage("");
                          setTotalCreditsErrorMessage("");
                          setSessionErrorMessage("");
                        }else{
                          if(object.type == 'name'){
                            setNameErrorMessage(object.message)  
                          }else if(object.type == 'session'){
                            setSessionErrorMessage(object.message)
                          }else if(object.type == 'credits'){
                            setTotalCreditsErrorMessage(object.message)
                          }
                        }
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
                      let blobUrl = course.CourseImage
                      if(files[0] != null){
                        blobUrl = await uploadFileToAzureBlobStorage("course-image", files[0], course.CourseName, course.CourseId)
                      }
                      let updatedCourse = {
                        CourseImage: blobUrl,
                        CourseId: course.CourseId,
                        CourseName: course.CourseName,
                        TotalCredits: course.TotalCredits,
                        NumOfSession: course.NumOfSession,
                        CreatedBy: course.CreatedBy,
                        CreatedDate: course.CreatedDate,
                        UpdatedBy: userData.name,
                        UpdatedDate: new Date().toISOString(),
                        ActiveFlag: course.ActiveFlag,
                      }
                      await updateCourse(updatedCourse).then((object: any) => {
                        if(object.statusCode == 200) {
                          onClose();
                          setIsEdit(false);
                          setCourse(defaultCourse);
                          fetchCourses().then((object: any) => {
                            setCourses(object.data || [] as MsCourse[]);
                          })
                          setNameErrorMessage("");
                          setSessionErrorMessage("");
                          setTotalCreditsErrorMessage("");
                          setFiles([]);
                          setUploadClicked(false);
                          setExistingFile(null);
                          setImageErrorMessage("");
                        }else{
                          if(object.type == 'name'){
                            setNameErrorMessage(object.message)
                          }else if(object.type == 'session'){
                            setSessionErrorMessage(object.message)
                          }else if(object.type == 'credits'){
                            setTotalCreditsErrorMessage(object.message)
                          }
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
                      await deleteCourse(courseId).then((object: any) => {
                        if(object.statusCode == 200){
                          onClose();
                          setIsDelete(false);
                          setCourse(defaultCourse);
                          fetchCourses().then((object: any) => {
                            setCourses(object.data || []);
                          })
                          setNameErrorMessage("");
                          setTotalCreditsErrorMessage("");
                          setSessionErrorMessage("");
                        }else{
                          console.log(object.message);
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
      <Table
        aria-label="Example table with custom cells, pagination and sorting"
        isHeaderSticky
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[382px]",
        }}
        // selectedKeys={selectedKeys}
        selectionMode="single"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        // onSelectionChange={setSelectedKeys}
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
        <TableBody isLoading={isFetchingCourses} loadingContent={<Spinner label="Loading ..."/>} emptyContent={"No courses found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.CourseId}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}

export default ManageCourses;
