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
  Tooltip,
  DatePicker,
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
import { SelectList, SessionSchedule, SessionScheduleResponse } from "@/app/api/data-model";
import { Box, Grid } from "@mui/material";
import { 
  fetchSessionSchedule,
  createsessionSchedule,
  updateSessionSchedule,
  deleteSessionSchedule,
  fetchSessions
} from "@/app/api/enrollment/manage-session-schedule";
import { fetchDepartments } from "@/app/api/user-management/manage-users";
import { fetchClasses } from "@/app/api/enrollment/manage-classes";
import { fetchActivePeriod } from "@/app/api/assignment/assignment-management";
import { fetchCoursesByDepartmentId } from "@/app/api/enrollment/manage-classes";
import { DateValue, now, parseAbsoluteToLocal } from "@internationalized/date";

const statusColorMap: Record<string, ChipProps["color"]>  = {
  active: "success",
  inactive: "danger",
};

const columns = [
  {name: "SESSION NAME", uid: "SessionName", sortable: true},
  {name: "SESSION NUMBER", uid: "SessionNumber", sortable: true},
  {name: "SESSION DATE", uid: "SessionDate", sortable: true},
  {name: "CLASSROOM", uid: "Classroom", sortable: true},
  {name: "ONLINE MEETING URL", uid: "OnlineMeetingUrl", sortable: true},
  {name: "CREATED BY", uid: "CreatedBy"},
  {name: "UPDATED BY", uid: "UpdatedBy"},
  {name: "STATUS", uid: "ActiveFlag", sortable: true},
  {name: "ACTIONS", uid: "Actions"},
];

const statusOptions = [
  {name: "Active", uid: "active"},
  {name: "Inactive", uid: "inactive"},
];

const INITIAL_VISIBLE_COLUMNS = ["SessionName", "SessionNumber", "SessionDate", "Classroom", "OnlineMeetingUrl", "CreatedBy", "UpdatedBy", "ActiveFlag", "Actions"];

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const defaultSessionSchedule : SessionSchedule = {
  SessionId: "",
  ClassId: "",
  SessionDate: new Date().toISOString(),
  Classroom: "",
  OnlineMeetingUrl: null,
  CreatedBy: "",
  CreatedDate: new Date().toISOString(),
  UpdatedBy: "",
  UpdatedDate: new Date(0).toISOString(),
  ActiveFlag: false,
}

const ManageSessionSchedule = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const today = new Date().toISOString();
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "SessionName",
    direction: "ascending",
  });
  const [isFetchingSessionSchedules, setIsFetchingSessionSchedules] = React.useState(true);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isEdit, setIsEdit] = React.useState(false);
  const [isDelete, setIsDelete] = React.useState(false);
  const [isCreate, setIsCreate] = React.useState(false);
  const [sessionDate, setSessionDate] = React.useState(parseAbsoluteToLocal(today));
  const [courseId, setCourseId] = React.useState("");
  const [classId, setClassId] = React.useState("");
  const [sessionId, setSessionId] = React.useState("");
  const [departmentId, setDepartmentId] = React.useState("");
  const [academicPeriodId, setAcademicPeriodId] = React.useState("");
  const [uploadClicked, setUploadClicked] = React.useState(false);
  let [sessionSchedule, setSessionSchedule] = React.useState<SessionSchedule | any>(defaultSessionSchedule);
  const [isLoading, setIsLoading] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const [touched2, setTouched2] = React.useState(false);
  const [touched3, setTouched3] = React.useState(false);
  const [touched4, setTouched4] = React.useState(false);
  const [sessionSchedules, setSessionSchedules] = React.useState<SessionScheduleResponse[]>([]);
  const [courses, setCourses] = React.useState<SelectList[]>([]);
  const [classes, setClasses] = React.useState<SelectList[]>([]);
  const [departments, setDepartments] = React.useState<SelectList[]>([]);
  const [sessions, setSessions] = React.useState<SelectList[]>([]);
  const isValid = departmentId !== ""
  const isValid2 = classId !== ""
  const isValid3 = courseId !== ""
  const isValid4 = sessionId !== ""
  
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

    const fetchingSessionSchedules = async () => {
        setSessionSchedules([]);
        setIsFetchingSessionSchedules(true);
        await fetchSessionSchedule(classId, courseId).then((object: any) => {
            let sessionSchedules = object.data.map((z: any) => {
                return {
                    SessionId: z.sessionId,
                    SessionName: z.sessionName,
                    SessionNumber: z.sessionNumber,
                    ClassId: z.classId,
                    SessionDate: z.sessionDate,
                    Classroom: z.classroom,
                    OnlineMeetingUrl: z.onlineMeetingUrl,
                    CreatedDate: z.createdDate,
                    CreatedBy: z.createdBy,
                    UpdatedDate: z.updatedDate,
                    UpdatedBy: z.updatedBy,
                    ActiveFlag: parseAbsoluteToLocal(z.sessionDate) > parseAbsoluteToLocal(today) ? true : false,
                }
            })
            setSessionSchedules(sessionSchedules);
        })
        setIsFetchingSessionSchedules(false);
    }

  const fetchingDepartments = async() => {
    await fetchDepartments().then((object: any) => {
      const res = object.data.map((z: any) => {
          return{
              key: z.DepartmentId,
              label: z.DepartmentName,
          }
      })
      setDepartments(res)
      if(res.length > 0) setDepartmentId(res[0].key)
    })
  }

  const fetchingActivePeriod = async() => {
    await fetchActivePeriod().then((object: any) => {
      setAcademicPeriodId(object.data[0].Key);
    })
  }
  
  useEffect(() => {
    dispatch(loadUserFromStorage());
    setIsFetchingSessionSchedules(true);
    fetchingActivePeriod();
    fetchingDepartments();
  }, [dispatch]);

  const fetchingClasses = async() => {
    await fetchClasses(departmentId, academicPeriodId).then((object: any) => {
      const res = object.data.map((z: any) => {
        return {
          key: z.ClassId,
          label: z.ClassName,
        }
      })
      setClasses(res);
      if(res.length > 0) setClassId(res[0].key);
    });
  }

  const fetchingCourses = async() => {
    await fetchCoursesByDepartmentId(departmentId).then((object: any) => {
      const res = object.data.map((z: any) => {
        return {
          key: z.CourseId,
          label: z.MsCourse.CourseName,
        }
      })
      setCourses(res);
      if(res.length > 0) setCourseId(res[0].key);
    })
  }

  const fetchingSession = async() => {
    await fetchSessions(courseId).then((object: any) => {
      const res = object.data.map((z: any) => {
        return {
          key: z.SessionId,
          label: z.SessionNumber,
        }
      })
      console.log(res)
      setSessions(res);
      // if(res.length > 0) setSessionId(res[0].key);
    })
  }

  useEffect(() => {
    fetchingClasses();
    fetchingCourses();
  }, [departmentId])

  useEffect(() => {
    fetchingSessionSchedules();
  }, [classId, courseId])

  useEffect(() => {
    fetchingSession();
  }, [courseId])

  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredSessions = [...sessionSchedules];

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
  }, [sessionSchedules, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof SessionScheduleResponse];
      const second = b[sortDescriptor.column as keyof SessionScheduleResponse];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((session: SessionScheduleResponse, columnKey: React.Key) => {
    const cellValue = session[columnKey as keyof SessionScheduleResponse];

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
      case "SessionDate":
        return (
          <div className="flex flex-col">
          {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
          <p className="text-bold text-tiny capitalize text-default-400">{session.SessionDate}</p>
          </div>
        );
        case "Classroom":
          return (
            <div className="flex flex-col">
            {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
            <p className="text-bold text-tiny capitalize text-default-400">{session.Classroom}</p>
            </div>
          );
          case "OnlineMeetingUrl":
        return (
          <div className="flex flex-col">
          {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
          <p className="text-bold text-tiny capitalize text-default-400">{session.OnlineMeetingUrl ?? "N/A"}</p>
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
                <EditIcon onClick={() => {setIsEdit(true); setSessionDate(parseAbsoluteToLocal(session.SessionDate)); setSessionSchedule(session); onOpen()}} />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete Course">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <DeleteIcon onClick={() => {setIsDelete(true); setSessionDate(parseAbsoluteToLocal(session.SessionDate)) ;setSessionSchedule(session); onOpen()}}/>
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
            placeholder="Search session schedule..."
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
          <span className="text-default-400 text-small">Total {sessionSchedules.length} sessions</span>
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
          setSessionDate(parseAbsoluteToLocal(today));
          setSessionSchedule(defaultSessionSchedule);
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
                    <Select
                      required
                      label= "Session"
                      variant="bordered"
                      placeholder="Select a session"
                      errorMessage={isValid4 || !touched4 ? "" : "You need to select a session"}
                      isInvalid={isValid4 || !touched4 ? false: true}
                      className="w-full"
                      selectedKeys={[sessionId]}
                      onChange={(e) => {setSessionId(e.target.value); console.log(e.target.value)}}
                      onClose={() => setTouched4(true)}
                      value={sessionId}
                    >
                      {sessions.map((session) => (
                        <SelectItem key={session.key} textValue={session.label}>
                          {session.label}
                        </SelectItem>
                      ))}
                    </Select>
                    <Input
                      autoFocus
                      label="Classroom"
                      placeholder="Enter classroom"
                      variant="bordered"
                      onClick={async () => await setUploadClicked(false)}
                      onChange={(e) => {setSessionSchedule({...sessionSchedule, Classroom: e.target.value})}}
                      value={sessionSchedule.Classroom}
                    />
                    <Input
                      autoFocus
                      label="Online Meeting URL"
                      placeholder="Enter online meeting url"
                      variant="bordered"
                      onClick={async () => await setUploadClicked(false)}
                      onChange={(e) => {setSessionSchedule({...sessionSchedule, OnlineMeetingUrl: e.target.value})}}
                      value={sessionSchedule.OnlineMeetingUrl}
                    />
                    <DatePicker
                      isRequired
                      label="Session Date"
                      className="w-full"
                      variant="bordered"
                      granularity="second"
                      labelPlacement="inside"
                      onChange={setSessionDate}
                      showMonthAndYearPickers
                      value={sessionDate}
                    />
                  </>
                ) : (
                  <div className="flex flex-col gap-4">
                    <p>Are you sure you want to delete <b>{sessionSchedule.SessionName}</b> ?</p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={() => {
                  setSessionDate(parseAbsoluteToLocal(today));
                  setSessionSchedule(defaultSessionSchedule);
                  setIsEdit(false);
                  setIsDelete(false);
                  setIsCreate(false);
                  setUploadClicked(false);
                  onClose();
                }}>
                  Close
                </Button>
                {isCreate ? (
                  <Button color="primary" onPress={async() => {
                    setIsLoading(true);
                    try{
                      let newSessionSchedule: SessionSchedule = {
                        ClassId: classId,
                        SessionId: sessionId,
                        SessionDate: convertDate(sessionDate),
                        Classroom: sessionSchedule.Classroom,
                        OnlineMeetingUrl: sessionSchedule.OnlineMeetingUrl,
                        CreatedBy: userData.name,
                        CreatedDate: new Date().toISOString(),
                        UpdatedBy: null,
                        UpdatedDate: new Date(0).toISOString(),
                        ActiveFlag: true,
                      }
                      console.log(newSessionSchedule)
                      await createsessionSchedule(newSessionSchedule).then((object: any) => {
                        if(!object.success){
                            alert(object.message)
                            return;
                        }
                        onClose();
                        setIsCreate(false);
                        setUploadClicked(false);
                        setSessionDate(parseAbsoluteToLocal(today));
                        setSessionSchedule(defaultSessionSchedule);
                        fetchingSessionSchedules();
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
                      let updatedSessionSchedule: SessionSchedule = {
                        ClassId: classId,
                        SessionId: sessionId,
                        SessionDate: convertDate(sessionDate),
                        Classroom: sessionSchedule.Classroom,
                        OnlineMeetingUrl: sessionSchedule.OnlineMeetingUrl,
                        CreatedBy: sessionSchedule.CreatedBy,
                        CreatedDate: sessionSchedule.CreatedDate,
                        UpdatedBy: userData.name,
                        UpdatedDate: new Date().toISOString(),
                        ActiveFlag: sessionSchedule.ActiveFlag,
                      }
                      // console.log(updatedSessionSchedule)
                      await updateSessionSchedule(updatedSessionSchedule).then((object: any) => {
                        if(object.success) {
                          onClose();
                          setUploadClicked(false);
                          setIsEdit(false);
                          setSessionDate(parseAbsoluteToLocal(today));
                          setSessionSchedule(defaultSessionSchedule);
                          fetchingSessionSchedules();
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
                      await deleteSessionSchedule(sessionSchedule.SessionId, classId).then((object: any) => {
                        if(object.success){
                          onClose();
                          setIsDelete(false);
                          setUploadClicked(false);
                          setSessionDate(parseAbsoluteToLocal(today));
                          setSessionSchedule(defaultSessionSchedule);
                          fetchingSessionSchedules();
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
                <Grid item xs={4} sm={4} md={4} lg={4} className="mb-2">
                  <Select
                      required
                      label= "Department"
                      variant="bordered"
                      placeholder="Select a department"
                      errorMessage={isValid || !touched ? "" : "You need to select a department"}
                      isInvalid={isValid || !touched ? false: true}
                      className="w-full sm:max-w-[94%]"
                      selectedKeys={[departmentId]}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      onClose={() => setTouched(true)}
                      value={departmentId}
                    >
                      {departments.map((department) => (
                        <SelectItem key={department.key}>
                          {department.label}
                        </SelectItem>
                      ))}
                    </Select>
                </Grid>
                <Grid item xs={4} sm={4} md={4} lg={4} className="mb-2">
                  <Select
                      required
                      label= "Class"
                      variant="bordered"
                      placeholder="Select a class"
                      errorMessage={isValid2 || !touched2 ? "" : "You need to select a class"}
                      isInvalid={isValid2 || !touched2 ? false: true}
                      className="w-full sm:max-w-[94%]"
                      selectedKeys={[classId]}
                      onChange={(e) => setClassId(e.target.value)}
                      onClose={() => setTouched2(true)}
                      value={classId}
                    >
                      {classes.map((classObj) => (
                        <SelectItem key={classObj.key}>
                          {classObj.label}
                        </SelectItem>
                      ))}
                    </Select>
                </Grid>
                <Grid item xs={4} sm={4} md={4} lg={4} className="mb-2">
                  <Select
                      required
                      label= "Course"
                      variant="bordered"
                      placeholder="Select a course"
                      errorMessage={isValid3 || !touched3 ? "" : "You need to select a course"}
                      isInvalid={isValid3 || !touched3 ? false: true}
                      className="w-full sm:max-w-[94%]"
                      selectedKeys={[courseId]}
                      onChange={(e) => setCourseId(e.target.value)}
                      onClose={() => setTouched3(true)}
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
        <TableBody isLoading={isFetchingSessionSchedules} loadingContent={<Spinner label="Loading ..."/>} emptyContent={"No session schedules found"} items={sortedItems}>
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

export default ManageSessionSchedule;
