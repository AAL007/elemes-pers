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
import { createClass, updateClass, deleteClass, fetchClasses, fetchAcademicPeriods, fetchCoursesByDepartmentId, fetchAvailableLecturers, createLecturerClass } from "@/app/api/enrollment/manage-classes";
import { generateGUID } from "../../../../../utils/utils";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { loadUserFromStorage } from "@/lib/user-slice";
import { MsClass, MsDepartment, SelectList, MsAcademicPeriod, LecturerClass } from "@/app/api/data-model";
import { Box, Grid } from "@mui/material";
import { fetchDepartments } from "@/app/api/user-management/manage-users";

const statusColorMap: Record<string, ChipProps["color"]>  = {
  active: "success",
  inactive: "danger",
};

const columns = [
  {name: "CLASS NAME", uid: "ClassName", sortable: true},
  {name: "CREATED BY", uid: "CreatedBy"},
  {name: "UPDATED BY", uid: "UpdatedBy"},
  {name: "STATUS", uid: "ActiveFlag", sortable: true},
  {name: "ACTIONS", uid: "Actions"},
];

const statusOptions = [
  {name: "Active", uid: "active"},
  {name: "Inactive", uid: "inactive"},
];

const defaultClass : MsClass = {
  ClassId: "",
  ClassName: "",
  DepartmentId: "",
  AcademicPeriodId: "",
  CreatedBy: "",
  CreatedDate: new Date().toISOString(),
  UpdatedBy: "",
  UpdatedDate: new Date(0).toISOString(),
  ActiveFlag: false,
}

const INITIAL_VISIBLE_COLUMNS = ["ClassName", "CreatedBy", "UpdatedBy", "ActiveFlag", "Actions"];

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const ManageClasses = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "ClassName",
    direction: "ascending",
  });
  const [isFetchingClasses, setIsFetchingClasses] = React.useState(true);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isEdit, setIsEdit] = React.useState(false);
  const [isDelete, setIsDelete] = React.useState(false);
  const [isCreate, setIsCreate] = React.useState(false);
  const [classId, setClassId] = React.useState("");
  let [classItem, setClass] = React.useState<MsClass | any>(defaultClass);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [courses, setCourses] = React.useState<string[]>([]);
  const [touched, setTouched] = React.useState(false);
  const [touched2, setTouched2] = React.useState(false);
  const [touched3, setTouched3] = React.useState(false);

  const [classes, setClasses] = React.useState<MsClass[]>([]);
  const [departments, setDepartments] = React.useState<SelectList[]>([]);
  const [department, setDepartment] = React.useState<string>("");
  const [academicPeriods, setAcademicPeriods] = React.useState<SelectList[]>([]);
  const [academicPeriod, setAcademicPeriod] = React.useState<string>("");
  const isValid = department !==""
  const isValid2 = academicPeriod !== ""

  useEffect(() => {
    dispatch(loadUserFromStorage());
    fetchAcademicPeriods().then((object: any) => {
      const academicPeriods = object.data.map((academicPeriod: MsAcademicPeriod) => {
        return {
          key: academicPeriod.AcademicPeriodId,
          label: academicPeriod.AcademicPeriodName,
        }
      });
      setAcademicPeriods(academicPeriods);
      setAcademicPeriod(academicPeriods[0].key);
    })
    fetchDepartments().then((object: any) => {
      const departments = object.data.map((department: MsDepartment) => {
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
    fetchCoursesByDepartmentId(department).then((object: any) => {
      const courses = object.data.map((course: any) => {
        return course.CourseId;
      })
      setCourses(courses);
    })
  }, [department])

  useEffect(() => {
    setIsFetchingClasses(true);
    fetchClasses(department, academicPeriod).then((object: any) => {
      setClasses(object.data || []);
    });
    setIsFetchingClasses(false);
  }, [department, academicPeriod])

  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredClasses = [...classes];

    if (hasSearchFilter) {
      filteredClasses = filteredClasses.filter((classObj) =>
        classObj.ClassName.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }
    if (statusFilter !== "all" && Array.from(statusFilter).length !== statusOptions.length) {
      filteredClasses = filteredClasses.filter((classObj) =>
        Array.from(statusFilter).includes(classObj.ActiveFlag ? "active" : "inactive"),
      );
    }

    return filteredClasses;
  }, [classes, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof MsClass];
      const second = b[sortDescriptor.column as keyof MsClass];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((classObj: MsClass, columnKey: React.Key) => {
    const cellValue = classObj[columnKey as keyof MsClass];

    switch (columnKey) {
      case "ClassName":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-tiny capitalize text-default-400">{classObj.ClassName}</p>
          </div>
        );
      case "CreatedBy":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-tiny capitalize text-default-400">{classObj.CreatedBy}</p>
          </div>
        );
        case "UpdatedBy":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-tiny capitalize text-default-400">{classObj.UpdatedBy ?? "N/A"}</p>
            </div>
          );
      case "ActiveFlag":
        return (
          <Chip className="capitalize" color={statusColorMap[classObj.ActiveFlag ? "active" : "inactive"]} size="sm" variant="flat">
            {classObj.ActiveFlag ? "active" : "inactive"}
          </Chip>
        );
      case "Actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit Class">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <EditIcon onClick={() => {setIsEdit(true); setClassId(classObj.ClassId); setClass(classObj); onOpen()}} />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete Class">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <DeleteIcon onClick={() => {setIsDelete(true); setClassId(classObj.ClassId); setClass(classObj); onOpen()}}/>
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
            placeholder="Search class..."
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
          <span className="text-default-400 text-small">Total {classes.length} classes</span>
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
          setClass(defaultClass);
          setErrorMessage("");
          onOpenChange()
        }}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{isEdit ? "Edit Class" : isDelete ? "Delete Class" : isCreate ? "Add Class" : ""}</ModalHeader>
              <ModalBody>
                {(isCreate || isEdit) ? (
                  <>
                    <Input
                      autoFocus
                      label="Class Name"
                      placeholder="Enter class name"
                      variant="bordered"
                      onChange={(e) => {setClass({...classItem, ClassName: e.target.value})}}
                      value={classItem.ClassName}
                    />
                    <h5 className="text-default-400 ml-1" style={{ color: "red", fontSize: "12px" }}>
                      {errorMessage}
                    </h5>
                  </>
                ) : (
                  <div className="flex flex-col gap-4">
                    <p>Are you sure you want to delete <b>{classItem.CourseName}</b> ?</p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={() => {
                  setClass(defaultClass);
                  setIsEdit(false);
                  setIsDelete(false);
                  setIsCreate(false);
                  setErrorMessage("");
                  onClose();
                }}>
                  Close
                </Button>
                {isCreate ? (
                  <Button color="primary" onPress={async() => {
                    setIsLoading(true);
                    try{
                      const lecturer = await fetchAvailableLecturers(academicPeriod, department)
                      if(lecturer?.statusCode == 400){
                        alert(lecturer.message)
                        return;
                      }
                      console.log(lecturer)
                      let newClass: MsClass = {
                        ClassId: generateGUID(),
                        ClassName: classItem.ClassName,
                        DepartmentId: department,
                        AcademicPeriodId: academicPeriod,
                        CreatedBy: userData.name,
                        CreatedDate: new Date().toISOString(),
                        UpdatedBy: null,
                        UpdatedDate: new Date(0).toISOString(),
                        ActiveFlag: true,
                      }
                      await createClass(newClass).then((object: any) => {
                        if(object.statusCode == 400){
                          alert(object.message)
                          return;
                        }
                      })
                      for(let i = 0; i < courses.length; i++){
                        let newLecturerClass: LecturerClass = {
                          ClassId: newClass.ClassId,
                          StaffId: lecturer.data.find(x => x.courseId == courses[i])?.staffId,
                          CreatedBy: userData.name,
                          CreatedDate: new Date().toISOString(),
                          UpdatedBy: null,
                          UpdatedDate: new Date(0).toISOString(),
                          ActiveFlag: true,
                        }
                        await createLecturerClass(newLecturerClass).then((object: any) => {
                          if(object.statusCode == 400){
                            alert(object.message)
                            return;
                          }
                        })
                      }
                      onClose();
                      setIsCreate(false);
                      setClass(defaultClass);
                      fetchClasses(department,academicPeriod).then((object: any) => {
                        setClasses(object.data || []);
                      })
                      setErrorMessage("");
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
                      let updatedClass: MsClass = {
                        ClassId: classItem.ClassId,
                        ClassName: classItem.ClassName,
                        AcademicPeriodId: classItem.AcademicPeriodId,
                        DepartmentId: classItem.DepartmentId,
                        CreatedBy: classItem.CreatedBy,
                        CreatedDate: classItem.CreatedDate,
                        UpdatedBy: userData.name,
                        UpdatedDate: new Date().toISOString(),
                        ActiveFlag: classItem.ActiveFlag,
                      }
                      await updateClass(updatedClass).then((object: any) => {
                        if(object.statusCode == 200) {
                          onClose();
                          setIsEdit(false);
                          setClass(defaultClass);
                          fetchClasses(department, academicPeriod).then((object: any) => {
                            setClasses(object.data || [] as MsClass[]);
                          })
                          setErrorMessage("");
                        }else{
                          setErrorMessage(object.message);
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
                      await deleteClass(classId).then((object: any) => {
                        if(object.statusCode == 200){
                          onClose();
                          setIsDelete(false);
                          setClass(defaultClass);
                          fetchClasses(department, academicPeriod).then((object: any) => {
                            setClasses(object.data || []);
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
                <Grid item xs={6} sm={6} md={6} lg={6} className="mb-2">
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
                <Grid item xs={6} sm={6} md={6} lg={6} className="flex justify-end mb-2">
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
        <TableBody isLoading={isFetchingClasses} loadingContent={<Spinner label="Loading ..."/>} emptyContent={"No classes found"} items={sortedItems}>
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

export default ManageClasses;
