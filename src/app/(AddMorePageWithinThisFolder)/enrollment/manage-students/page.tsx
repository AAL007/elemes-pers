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
import { fetchClasses, fetchAcademicPeriods } from "@/app/api/enrollment/manage-classes";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { loadUserFromStorage } from "@/lib/user-slice";
import { SelectList, Enrollment } from "@/app/api/data-model";
import { Box, Grid } from "@mui/material";
import { fetchDepartments } from "@/app/api/user-management/manage-users";
import { createEnrollment, deleteEnrollment, fetchEnrollment, fetchStudentsByDepartmentId } from "@/app/api/enrollment/manage-student";

const statusColorMap: Record<string, ChipProps["color"]>  = {
  active: "success",
  inactive: "danger",
};

const columns = [
  {name: "STUDENT NAME", uid: "StudentId", sortable: true},
  {name: "CREATED BY", uid: "CreatedBy"},
  {name: "UPDATED BY", uid: "UpdatedBy"},
  {name: "STATUS", uid: "ActiveFlag", sortable: true},
  {name: "ACTIONS", uid: "Actions"},
];

const statusOptions = [
  {name: "Active", uid: "active"},
  {name: "Inactive", uid: "inactive"},
];

const INITIAL_VISIBLE_COLUMNS = ["StudentId", "CreatedBy", "UpdatedBy", "ActiveFlag", "Actions"];

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const ManageStudents = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "StudentId",
    direction: "ascending",
  });
  const [isFetchingEnrollment, setIsFetchingEnrollment] = React.useState(true);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isDelete, setIsDelete] = React.useState(false);
  const [isCreate, setIsCreate] = React.useState(false);
  const [studentId, setStudentId] = React.useState<string>("");
  const [enrollments, setEnrollments] = React.useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const [touched2, setTouched2] = React.useState(false);
  const [touched3, setTouched3] = React.useState(false);
  const [touched4, setTouched4] = React.useState(false);

  const [classes, setClasses] = React.useState<SelectList[]>([]);
  const [classId, setClassId] = React.useState<string>("");
  const [departments, setDepartments] = React.useState<SelectList[]>([]);
  const [department, setDepartment] = React.useState<string>("");
  const [academicPeriods, setAcademicPeriods] = React.useState<SelectList[]>([]);
  const [academicPeriod, setAcademicPeriod] = React.useState<string>("");
  const [students, setStudents] = React.useState<SelectList[]>([]);
  const [student, setStudent] = React.useState(new Set([]));;
  const isValid = department !==""
  const isValid2 = academicPeriod !== ""
  const isValid3 = classId !== ""
  const isValid4 = student.size !== 0

  const handleSelectionChange = (e: any) => {
    setStudent(new Set(e.target.value.split(",")));
  };

  useEffect(() => {
    dispatch(loadUserFromStorage());
    fetchAcademicPeriods().then((object: any) => {
      const academicPeriods = object.data.map((academicPeriod: any) => {
        return {
          key: academicPeriod.AcademicPeriodId,
          label: academicPeriod.AcademicPeriodName,
        }
      });
      setAcademicPeriods(academicPeriods);
      setAcademicPeriod(academicPeriods[0].key);
    })
    fetchDepartments().then((object: any) => {
      const departments = object.data.map((department: any) => {
        return {
          key: department.DepartmentId,
          label: department.DepartmentName,
        }
      })
      setDepartments(departments);
      setDepartment(departments[0].key);
    })
  }, [dispatch]);

  useEffect(() => {
    fetchClasses(department, academicPeriod).then((object: any) => {
      if(object.data.length == 0){return;}
      const classes = object.data.map((classObj: any) => {
        return {
          key: classObj.ClassId,
          label: classObj.ClassName,
        }
      })
      setClasses(classes);
      setClassId(classes[0].key);
    })
  }, [department, academicPeriod])

  useEffect(() => {
    fetchStudentsByDepartmentId(department).then((object: any) => {
        const students = object.data.map((student: any) => {
            return {
            key: student.StudentId,
            label: student.StudentName,
            }
        })
        setStudents(students);
    })
  }, [department])

  useEffect(() => {
    setIsFetchingEnrollment(true);
    fetchEnrollment(classId).then((object: any) => {
        setEnrollments(object.data || []);
    })
    setIsFetchingEnrollment(false);
  }, [classId])

  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredEnrollments = [...enrollments];

    if (hasSearchFilter) {
      filteredEnrollments = filteredEnrollments.filter((enrollment) =>
        students.find(x => x.key == enrollment.StudentId)?.label.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }
    if (statusFilter !== "all" && Array.from(statusFilter).length !== statusOptions.length) {
      filteredEnrollments = filteredEnrollments.filter((enrollment) =>
        Array.from(statusFilter).includes(enrollment.ActiveFlag ? "active" : "inactive"),
      );
    }

    return filteredEnrollments;
  }, [enrollments, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof Enrollment];
      const second = b[sortDescriptor.column as keyof Enrollment];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((enrollment: Enrollment, columnKey: React.Key) => {
    const cellValue = enrollment[columnKey as keyof Enrollment];

    switch (columnKey) {
      case "StudentId":
        return (
          <div className="flex flex-col">
            {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
            <p className="text-bold text-tiny capitalize text-default-400">{students.find(x => x.key == enrollment.StudentId)?.label}</p>
          </div>
        );
      case "CreatedBy":
        return (
          <div className="flex flex-col">
            {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
            <p className="text-bold text-tiny capitalize text-default-400">{enrollment.CreatedBy}</p>
          </div>
        );
        case "UpdatedBy":
          return (
            <div className="flex flex-col">
              {/* <p className="text-bold text-small capitalize">{role.UpdatedBy ?? "N/A"}</p> */}
              <p className="text-bold text-tiny capitalize text-default-400">{enrollment.UpdatedBy ?? "N/A"}</p>
            </div>
          );
      case "ActiveFlag":
        return (
          <Chip className="capitalize" color={statusColorMap[enrollment.ActiveFlag ? "active" : "inactive"]} size="sm" variant="flat">
            {enrollment.ActiveFlag ? "active" : "inactive"}
          </Chip>
        );
      case "Actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip color="danger" content="Delete Class">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <DeleteIcon onClick={() => {setIsDelete(true); setStudentId(enrollment.StudentId); onOpen()}}/>
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, [enrollments]);

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
            placeholder="Search students..."
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
          <span className="text-default-400 text-small">Total {enrollments.length} Students</span>
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
    enrollments,
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    classes.length,
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
          setIsDelete(false);
          setIsCreate(false);
          setStudentId("");
          setStudent(new Set([]));
          setErrorMessage("");
          onOpenChange()
        }}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{isDelete ? "Delete Enrollment" : isCreate ? "Add Enrollment" : ""}</ModalHeader>
              <ModalBody>
                {(isCreate) ? (
                  <>
                    <Select
                      required
                      selectionMode="multiple"
                      label= "Students"
                      variant="bordered"
                      placeholder="Select students"
                      errorMessage={isValid4 || !touched4 ? "" : "You need to select a student"}
                      isInvalid={isValid4 || !touched4 ? false: true}
                      className="w-full sm:max-w-[94%]"
                      selectedKeys={student}
                      onChange={handleSelectionChange}
                      onClose={() => setTouched4(true)}
                    >
                      {students.map((student) => (
                        <SelectItem key={student.key}>
                          {student.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </>
                ) : (
                  <div className="flex flex-col gap-4">
                    <p>Are you sure you want to delete <b>{students.find(x => x.key == studentId)?.label}</b> ?</p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={() => {
                  setIsDelete(false);
                  setIsCreate(false);
                  setStudentId("");
                  setStudent(new Set([]));
                  setErrorMessage("");
                  onClose();
                }}>
                  Close
                </Button>
                {isCreate ? (
                  <Button color="primary" onPress={async() => {
                    setIsLoading(true);
                    try{
                      const selectedStudent = Array.from(student).filter(item => item !== "")
                      for(let i = 0; i < selectedStudent.length; i++){
                        let newEnrollment: Enrollment = {
                            ClassId: classId,
                            StudentId: selectedStudent[i],
                            CreatedBy: userData.name,
                            CreatedDate: new Date().toISOString(),
                            UpdatedBy: null,
                            UpdatedDate: new Date(0).toISOString(),
                            ActiveFlag: true,
                        }
                        await createEnrollment(newEnrollment).then((object: any) => {
                            if(object.statusCode == 400){
                              alert(object.message)
                              return;
                            }
                          })
                      }
                      onClose();
                      setIsCreate(false);
                      setStudentId("");
                      setStudent(new Set([]));
                      fetchEnrollment(classId).then((object: any) => {
                        setEnrollments(object.data || []);
                      })
                      setErrorMessage("");
                    }finally{
                      setIsLoading(false);
                    }
                    }}>
                    {isLoading ? <Spinner size="sm" color="default"/> : "Add"}
                  </Button>
                ) : (
                  <Button color="primary" onPress={async() => {
                    setIsLoading(true);
                    try{
                      await deleteEnrollment(classId, studentId).then((object: any) => {
                        if(object.statusCode == 200){
                          onClose();
                          setIsDelete(false);
                          setStudentId("");
                          setStudent(new Set([]));
                          fetchEnrollment(classId).then((object: any) => {
                            setEnrollments(object.data || []);
                          })
                          setErrorMessage("");
                        }else{
                          setErrorMessage(object.message);
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
                <Grid item xs={4} sm={4} md={4} lg={4} className="mb-2">
                  <Select
                      required
                      label= "Department"
                      variant="bordered"
                      placeholder="Select a department"
                      errorMessage={isValid || !touched ? "" : "You need to select a department"}
                      isInvalid={isValid || !touched ? false: true}
                      className="w-full sm:max-w-[94%]"
                      selectedKeys={[department]}
                      onChange={(e) => setDepartment(e.target.value)}
                      onClose={() => setTouched(true)}
                      value={department}
                    >
                      {departments.map((department) => (
                        <SelectItem key={department.key}>
                          {department.label}
                        </SelectItem>
                      ))}
                    </Select>
                </Grid>
                <Grid item xs={4} sm={4} md={4} lg={4} className="flex justify-end mb-2">
                    <Select
                      required
                      label= "Academic Period"
                      variant="bordered"
                      placeholder="Select an academic period"
                      errorMessage={isValid2 || !touched2 ? "" : "You need to select an academic period"}
                      isInvalid={isValid2 || !touched2 ? false: true}
                      className="w-full sm:max-w-[94%]"
                      selectedKeys={[academicPeriod]}
                      onChange={(e) => setAcademicPeriod(e.target.value)}
                      value={academicPeriod}
                      onClose={() => setTouched2(true)}
                    >
                      {academicPeriods.map((academicPeriod) => (
                        <SelectItem key={academicPeriod.key}>
                          {academicPeriod.label}
                        </SelectItem>
                      ))}
                    </Select>
                </Grid>
                <Grid item xs={4} sm={4} md={4} lg={4} className="flex justify-end mb-2">
                    <Select
                      required
                      label= "Class"
                      variant="bordered"
                      placeholder="Select a class"
                      errorMessage={isValid3 || !touched3 ? "" : "You need to select a class"}
                      isInvalid={isValid3 || !touched3 ? false: true}
                      className="w-full sm:max-w-[94%]"
                      selectedKeys={[classId]}
                      onChange={(e) => setClassId(e.target.value)}
                      value={classId}
                      onClose={() => setTouched3(true)}
                    >
                      {classes.map((classObj) => (
                        <SelectItem key={classObj.key}>
                          {classObj.label}
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
        <TableBody isLoading={isFetchingEnrollment} loadingContent={<Spinner label="Loading ..."/>} emptyContent={"No students found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.ClassId}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}

export default ManageStudents;
