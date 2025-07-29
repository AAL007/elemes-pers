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
import { fetchActivePeriod, fetchLecturerClassCourse, updateAssessment, createAssessment, deleteAssessment, fetchAssessment, fetchTotalSession } from "@/app/api/assignment/assignment-management";
import { generateGUID } from "../../../../../utils/utils";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { loadUserFromStorage } from "@/lib/user-slice";
import { MsAssessment, SelectList } from "@/app/api/data-model";
import { Box, Grid } from "@mui/material";

const statusColorMap: Record<string, ChipProps["color"]>  = {
  active: "success",
  inactive: "danger",
};

const columns = [
  {name: "ASSESSMENT NAME", uid: "AssessmentName", sortable: true},
  {name: "CREATED BY", uid: "CreatedBy"},
  {name: "UPDATED BY", uid: "UpdatedBy"},
  {name: "STATUS", uid: "ActiveFlag", sortable: true},
  {name: "ACTIONS", uid: "Actions"},
];

const statusOptions = [
  {name: "Active", uid: "active"},
  {name: "Inactive", uid: "inactive"},
];

const defaultAssessment : MsAssessment = {
  AssessmentId: "",
  AssessmentName: "",
  CourseId: "",
  ClassId: "",
  AcademicPeriodId: "",
  SessionNumber: 0,
  SessionId: "",
  CreatedBy: "",
  CreatedDate: new Date().toISOString(),
  UpdatedBy: "",
  UpdatedDate: new Date(0).toISOString(),
  ActiveFlag: false,
}

const INITIAL_VISIBLE_COLUMNS = ["AssessmentName", "CreatedBy", "UpdatedBy", "ActiveFlag", "Actions"];

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const AssignmentManagement = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const [filterValue, setFilterValue] = React.useState("");
  const today = new Date().toISOString();
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "AssessmentName",
    direction: "ascending",
  });
  const [isFetchingAssessment, setIsFetchingAssessment] = React.useState(true);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isEdit, setIsEdit] = React.useState(false);
  const [isDelete, setIsDelete] = React.useState(false);
  const [isCreate, setIsCreate] = React.useState(false);
  const [classId, setClassId] = React.useState("");
  let [assessment, setAssessment] = React.useState<MsAssessment | any>(defaultAssessment);
  const [isLoading, setIsLoading] = React.useState(false);
  const [uploadClicked, setUploadClicked] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [courseId, setCourseId] = React.useState("");
  const [courseLabel, setCourseLabel] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const [touched2, setTouched2] = React.useState(false);
  const [touched3, setTouched3] = React.useState(false);
  const [classes, setClasses] = React.useState<SelectList[]>([]);
  const [courses, setCourses] = React.useState<SelectList[]>([]);
  const [sessionNumber, setSessionNumber] = React.useState<string>("");
  const [sessionNumbers, setSessionNumbers] = React.useState<SelectList[]>([]);
  const [assessments, setAssessments] = React.useState<any[]>([]);
  const [academicPeriod, setAcademicPeriod] = React.useState<string>("");
  const isValid = classId !==""
  const isValid2 = courseId !== ""
  const isValid3 = sessionNumber !== ""

  useEffect(() => {
    dispatch(loadUserFromStorage());
    setIsFetchingAssessment(true);
    fetchActivePeriod().then((object: any) => {
      setAcademicPeriod(object.data[0].Key);
    })
  }, [dispatch])

  useEffect(() => {
    setIsFetchingAssessment(true);
    fetchLecturerClassCourse(userData.id, academicPeriod).then((object: any) => {
      const classes = object.data.map((z: any) => {
        return {
          key: z.ClassKey,
          label: z.ClassValue,
        }
      })
      setClasses(classes);
      setClassId(classes[0]?.key ?? "");
      const courses = object.data.reduce((acc: any[], z: any) => {
        const key = z.CourseKey;
        if (!acc.some(course => course.key === key)) {
          acc.push({
            key: z.CourseKey,
            label: z.CourseValue,
          });
        }
        return acc;
      }, []);
      setCourses(courses);
      setCourseId(courses[0]?.key ?? "");
    })
  }, [academicPeriod]);

  const fetchingAssessment = async (courseId: string, classId: string, academicPeriod: string) => {
    setIsFetchingAssessment(true);
    fetchAssessment(courseId, classId, academicPeriod).then((object: any) => {
      const assessments = object.data.map((z: any) => {
        return {
          AssessmentId: z.assessmentId,
          AssessmentName: z.assessmentName,
          CourseId: z.courseId,
          ClassId: z.classId,
          AcademicPeriodId: z.academicPeriodId,
          SessionNumber: z.sessionNumber,
          CreatedBy: z.createdBy,
          CreatedDate: z.createdDate,
          UpdatedBy: z.updatedBy,
          UpdatedDate: z.updatedDate,
          ActiveFlag: z.activeFlag,
        }
      })
      console.log(assessments)
      console.log(assessments.length)
      setAssessments(assessments || []);
    })
    setIsFetchingAssessment(false);
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

  useEffect(() => {
    fetchingAssessment(courseId, classId, academicPeriod);
  }, [classId, courseId])

  useEffect(() => {
    setCourseLabel(courses.find((z) => z.key === courseId)?.label || "");
  }, [courseId])

  useEffect(() => {
    fetchTotalSession(courseId).then((object: any) => {
      const numOfSession = object.data[0]?.NumOfSession;
      const totalCredits = object.data[0]?.TotalCredits;
      const sessionNumbers = [];
      for(let i = 1; i <= numOfSession * totalCredits; i++){
        sessionNumbers.push({
          key: i.toString(),
          label: i.toString(),
        })
      }
      setSessionNumbers(sessionNumbers);
      setSessionNumber(sessionNumbers[0]?.key ?? "");
    })
  }, [courseId])

  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredAssessments = [...assessments];

    if (hasSearchFilter) {
      filteredAssessments = filteredAssessments.filter((assessmentObj) =>
        assessmentObj.AssessmentName.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }
    if (statusFilter !== "all" && Array.from(statusFilter).length !== statusOptions.length) {
      filteredAssessments = filteredAssessments.filter((assessmentObj) =>
        Array.from(statusFilter).includes(assessmentObj.ActiveFlag ? "active" : "inactive"),
      );
    }

    return filteredAssessments;
  }, [assessments, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof MsAssessment];
      const second = b[sortDescriptor.column as keyof MsAssessment];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((assessmentObj: MsAssessment, columnKey: React.Key) => {
    const cellValue = assessmentObj[columnKey as keyof MsAssessment];

    switch (columnKey) {
      case "AssessmentName":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-tiny capitalize text-default-400">{assessmentObj.AssessmentName}</p>
          </div>
        );
      case "CreatedBy":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-tiny capitalize text-default-400">{assessmentObj.CreatedBy}</p>
          </div>
        );
        case "UpdatedBy":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-tiny capitalize text-default-400">{assessmentObj.UpdatedBy ?? "N/A"}</p>
            </div>
          );
      case "ActiveFlag":
        return (
          <Chip className="capitalize" color={statusColorMap[assessmentObj.ActiveFlag ? "active" : "inactive"]} size="sm" variant="flat">
            {assessmentObj.ActiveFlag ? "active" : "inactive"}
          </Chip>
        );
      case "Actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit Assignment">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <EditIcon onClick={() => {setIsEdit(true); setSessionNumber(assessmentObj.SessionNumber.toString()); setAssessment(assessmentObj); onOpen()}} />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete Assigment">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <DeleteIcon onClick={() => {setIsDelete(true); setSessionNumber(assessmentObj.SessionNumber.toString()); setAssessment(assessmentObj); onOpen()}}/>
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
            placeholder="Search assessment..."
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
          <span className="text-default-400 text-small">Total {assessments.length} assessments</span>
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
    classes.length,
    hasSearchFilter,
    assessments
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
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
          setUploadClicked(false);
          setAssessment(defaultAssessment);
          setErrorMessage("");
          onOpenChange()
        }}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{isEdit ? "Edit Assessment" : isDelete ? "Delete Assessment" : isCreate ? "Add Assessment" : ""}</ModalHeader>
              <ModalBody>
                {(isCreate || isEdit) ? (
                  <>
                    <Input
                      autoFocus
                      label="Assessment Name"
                      placeholder="Enter assignment name"
                      variant="bordered"
                      onClick={async() => await setUploadClicked(false)}
                      onChange={(e) => {setAssessment({...assessment, AssessmentName: e.target.value})}}
                      value={assessment.AssessmentName}
                    />
                    <h5 className="text-default-400 ml-1" style={{ color: "red", fontSize: "12px" }}>
                      {errorMessage}
                    </h5>
                    <Select
                      required
                      label= "Session Number"
                      variant="bordered"
                      placeholder="Select a session number"
                      errorMessage={isValid3 || !touched3 ? "" : "You need to select a session number"}
                      isInvalid={isValid3 || !touched3 ? false: true}
                      className="w-full sm:max-w-full"
                      selectedKeys={[sessionNumber]}
                      onClick={async() => await setUploadClicked(false)}
                      onChange={(e) => setSessionNumber(e.target.value)}
                      onClose={() => setTouched3(true)}
                      value={sessionNumber}
                    >
                      {sessionNumbers.map((sessionNumberObj) => (
                        <SelectItem key={sessionNumberObj.key}>
                          {sessionNumberObj.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </>
                ) : (
                  <div className="flex flex-col gap-4">
                    <p>Are you sure you want to delete <b>{assessment.AssessmentName}</b> ?</p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={() => {
                  setAssessment(defaultAssessment);
                  setIsEdit(false);
                  setIsDelete(false);
                  setIsCreate(false);
                  setUploadClicked(false);
                  setErrorMessage("");
                  onClose();
                }}>
                  Close
                </Button>
                {isCreate ? (
                  <Button color="primary" onPress={async() => {
                    setIsLoading(true);
                    try{
                      let assessmentId = await generateGUID();
                      let newAssessment: MsAssessment = {
                        AssessmentId: assessmentId,
                        AssessmentName: assessment.AssessmentName,
                        ClassId: classId,
                        CourseId: courseId,
                        AcademicPeriodId: academicPeriod,
                        SessionNumber: parseInt(sessionNumber),
                        SessionId: '',
                        CreatedBy: userData.name,
                        CreatedDate: new Date().toISOString(),
                        UpdatedBy: null,
                        UpdatedDate: new Date(0).toISOString(),
                        ActiveFlag: true,
                      }
                      console.log(newAssessment)
                      await createAssessment(newAssessment).then((object: any) => {
                        if(!object.success){
                          alert(object.message)
                          return;
                        }
                      })
                      window.location.href = `/assignment/create-edit-assignment/create/${assessmentId}`;
                      setErrorMessage("");
                    }catch(e){
                      alert(e);
                    }
                    }}>
                    {isLoading ? <Spinner size="sm" color="default"/> : "Next"}
                  </Button>
                ) : isEdit ? (
                  <Button color="primary" onPress={async () => {
                    setIsLoading(true);
                    try {
                      let updatedAssessment: MsAssessment = {
                        AssessmentId: assessment.AssessmentId,
                        AssessmentName: assessment.AssessmentName,
                        ClassId: assessment.ClassId,
                        CourseId: assessment.CourseId,
                        AcademicPeriodId: assessment.AcademicPeriodId,
                        SessionNumber: parseInt(sessionNumber),
                        SessionId: assessment.SessionId,
                        CreatedBy: assessment.CreatedBy,
                        CreatedDate: assessment.CreatedDate,
                        UpdatedBy: userData.name,
                        UpdatedDate: new Date().toISOString(),
                        ActiveFlag: true,
                      }
                      await updateAssessment(updatedAssessment).then((object: any) => {
                        if(object.success) {
                          window.location.href = `/assignment/create-edit-assignment/edit/${updatedAssessment.AssessmentId}`
                        }else{
                          setErrorMessage(object.message);
                        }
                      })
                    } catch(e) {
                      alert(e);
                    }
                  }}>
                    {isLoading ? <Spinner color="default" size="sm"/> : "Next"}
                  </Button>
                ) : (
                  <Button color="primary" onPress={async() => {
                    setIsLoading(true);
                    try{
                      await deleteAssessment(assessment.AssessmentId).then((object: any) => {
                        console.log(assessment.AssessmentId)
                        if(object.success){
                          console.log(object.message)
                          onClose();
                          setUploadClicked(false);
                          setIsDelete(false);
                          setAssessment(defaultAssessment);
                          fetchingAssessment(courseId, classId, academicPeriod);
                          setErrorMessage("");
                        }else{
                          alert(object.message)
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
            <Grid container className="mt-0.5 mb-10">
                <Grid item xs={6} sm={6} md={6} lg={6} className="mb-2">
                  <Select
                      required
                      label= "Class"
                      variant="bordered"
                      placeholder="Select a class"
                      errorMessage={isValid || !touched ? "" : "You need to select a class"}
                      isInvalid={isValid || !touched ? false: true}
                      className="w-full sm:max-w-[94%]"
                      selectedKeys={[classId]}
                      onChange={(e) => setClassId(e.target.value)}
                      onClose={() => setTouched(true)}
                      value={classId}
                    >
                      {classes.map((classObj) => (
                        <SelectItem key={classObj.key}>
                          {classObj.label}
                        </SelectItem>
                      ))}
                    </Select>
                </Grid>
                <Grid item xs={6} sm={6} md={6} lg={6} className="flex justify-end mb-2">
                    <Select
                      required
                      label= "Course"
                      variant="bordered"
                      placeholder="Select a course"
                      errorMessage={isValid2 || !touched2 ? "" : "You need to select a course"}
                      isInvalid={isValid2 || !touched2 ? false: true}
                      className="w-full sm:max-w-[94%]"
                      selectedKeys={[courseId]}
                      onChange={(e) => setCourseId(e.target.value)}
                      value={courseId}
                      onClose={() => setTouched2(true)}
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
        <TableBody isLoading={isFetchingAssessment} loadingContent={<Spinner label="Loading ..."/>} emptyContent={"No assessments found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.AssessmentId}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}

export default AssignmentManagement;
