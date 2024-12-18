'use client'
import * as React from "react";
import { Grid, Box } from '@mui/material';
import "@/components/ui/component.css"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
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
} from "@nextui-org/react";
import { DeleteIcon } from "@/components/icon/delete-icon";
import { ChevronDownIcon } from '@/components/icon/chevron-down-icon';
import { SearchIcon } from '@/components/icon/search-icon';
import PageContainer from '@/components/ui/container/page-container';
import { useEffect, useState } from "react";
import { Input } from '@nextui-org/react';
import { fetchCourses, fetchDepartmentCourses, fetchDepartment, updateDepartment, createDepartmentCourse, deleteDepartmentCourse } from '@/app/api/enrollment/manage-departments';
import { Button, Select, SelectItem} from "@nextui-org/react";
import { generateGUID } from "../../../../../../../utils/boilerplate-function";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { loadUserFromStorage } from "@/lib/user-slice";
import { DepartmentCourse, MsCourse, MsDepartment, SelectList } from "@/app/api/data-model";
// components

const statusColorMap: Record<string, ChipProps["color"]>  = {
  active: "success",
  inactive: "danger",
};

const defaultDepartment: MsDepartment = {
    DepartmentId: "",
    DepartmentName: "",
    FacultyId: "",
    CreatedBy: "",
    CreatedDate: "",
    UpdatedBy: "",
    UpdatedDate: "",
    ActiveFlag: true,
}

const columns = [
  {name: "COURSE NAME", uid: "CourseId", sortable: true},
  {name: "CREATED BY", uid: "CreatedBy"},
  {name: "UPDATED BY", uid: "UpdatedBy"},
  {name: "STATUS", uid: "ActiveFlag", sortable: true},
  {name: "ACTIONS", uid: "Actions"},
];

const statusOptions = [
  {name: "Active", uid: "active"},
  {name: "Inactive", uid: "inactive"},
];

const INITIAL_VISIBLE_COLUMNS = ["CourseId", "CreatedBy", "UpdatedBy", "ActiveFlag", "Actions"];

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const EditDepartment = ({params} : {params : {departmentId: string}}) => {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "CourseId",
    direction: "ascending",
  });
//   const [departmentName, setDepartmentName] = useState<string>("");
  const [department, setDepartment] = useState<MsDepartment>(defaultDepartment);
  const [course, setCourse] = useState(new Set([]));
  const [isLoading, setLoadingStatus] = useState<boolean>(false);
  const [touched, setTouched] = React.useState(false);
  const [isFetchingDepartmentCourse, setIsFetchingDepartmentCourse] = useState<boolean>(false);
  const [departmentCourse, setDepartmentCourse] = useState<DepartmentCourse[]>([]);
  const [courseId, setCourseId] = useState<string>("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [errorMessage, setErrorMessage] = useState<string>("");

  const isValid = course.size != 0 ;

  const handleSelectionChange = (e: any) => {
    setCourse(new Set(e.target.value.split(",")));
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let updatedDepartment: MsDepartment = {
      DepartmentId: department.DepartmentId,
      DepartmentName: department.DepartmentName,
      FacultyId: department.FacultyId,
      CreatedBy: department.CreatedBy,
      CreatedDate: department.CreatedDate,
      UpdatedBy: userData.name,
      UpdatedDate: new Date().toISOString(),
      ActiveFlag: true,
    }
    let res = await updateDepartment(updatedDepartment)

    if(res.statusCode != 200 && res.statusCode != 409){
        alert(res.message)
        setLoadingStatus(false)
        return;
    }

    const courses = Array.from(course).filter(item => item !== "")
    for(let i = 0; i < courses.length; i++){
      if(departmentCourse.find(x => x.CourseId == courses[i])){continue}
      let newdepartmentCourse: DepartmentCourse = {
        DepartmentId: department.DepartmentId,
        CourseId: courses[i],
        CreatedBy: userData.name,
        CreatedDate: new Date().toISOString(),
        UpdatedBy: null,
        UpdatedDate: new Date(0).toISOString(),
        ActiveFlag: true
      }
      await createDepartmentCourse(newdepartmentCourse).then((res) => {
        if(res.statusCode != 200){
            alert(res.message)
            setLoadingStatus(false)
            return;
        }
      })
    }
    setLoadingStatus(false)
    setIsFetchingDepartmentCourse(true)
    fetchDepartmentCourses(department.DepartmentId).then((object: any) => {
      setDepartmentCourse(object.data || [])
      console.log(object.data)
    })
    setIsFetchingDepartmentCourse(false)
  }

  const [courseDropdownList, setCourseDropdownList] = React.useState<SelectList[]>([])
  useEffect(() => {
    dispatch(loadUserFromStorage())
    fetchDepartment(params.departmentId).then((object: any) => {
        setDepartment(object.data ?? defaultDepartment)
    })
    fetchDepartmentCourses(params.departmentId).then((object: any) => {
        setDepartmentCourse(object.data || [])
    })
    fetchCourses().then((object: any) => {
        const res = object.data.map((z: MsCourse) => {
            return{
                key: z.CourseId,
                label: z.CourseName
            }
        })
        setCourseDropdownList(res)
    })
  }, [dispatch]);

  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredDepartmentCourses = [...departmentCourse];

    if (hasSearchFilter) {
      console.log(courseDropdownList)
      filteredDepartmentCourses = filteredDepartmentCourses.filter((departmentCours) =>
        courseDropdownList.find(x => x.key == departmentCours.CourseId)?.label.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }
    if (statusFilter !== "all" && Array.from(statusFilter).length !== statusOptions.length) {
      filteredDepartmentCourses = filteredDepartmentCourses.filter((departmentCours) =>
        Array.from(statusFilter).includes(departmentCours.ActiveFlag ? "active" : "inactive"),
      );
    }

    return filteredDepartmentCourses;
  }, [departmentCourse, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof DepartmentCourse];
      const second = b[sortDescriptor.column as keyof DepartmentCourse];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((department: DepartmentCourse, columnKey: React.Key) => {
    const cellValue = department[columnKey as keyof DepartmentCourse];

    console.log(courseDropdownList)
    console.log(courseDropdownList.find(x => x.key == department.CourseId)?.label)
    switch (columnKey) {
      case "CourseId":
        return (
          <div className="flex flex-col">
            {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
            <p className="text-bold text-tiny capitalize text-default-400">{courseDropdownList.find(x => x.key == department.CourseId)?.label}</p>
          </div>
        );
      case "CreatedBy":
        return (
          <div className="flex flex-col">
            {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
            <p className="text-bold text-tiny capitalize text-default-400">{department.CreatedBy}</p>
          </div>
        );
        case "UpdatedBy":
          return (
            <div className="flex flex-col">
              {/* <p className="text-bold text-small capitalize">{role.UpdatedBy ?? "N/A"}</p> */}
              <p className="text-bold text-tiny capitalize text-default-400">{department.UpdatedBy ?? "N/A"}</p>
            </div>
          );
      case "ActiveFlag":
        return (
          <Chip className="capitalize" color={statusColorMap[department.ActiveFlag ? "active" : "inactive"]} size="sm" variant="flat">
            {department.ActiveFlag ? "active" : "inactive"}
          </Chip>
        );
      case "Actions":
        return (
          <div className="relative flex items-center gap-2">
            {/* <Tooltip content="Edit Department">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <EditIcon onClick={() => {handleEditClick(department.DepartmentId)}} />
              </span>
            </Tooltip> */}
            <Tooltip color="danger" content="Delete Department">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <DeleteIcon onClick={() => {setCourseId(department.CourseId); onOpen()}}/>
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, [courseDropdownList]);

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
            placeholder="Search departments..."
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
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {departmentCourse.length} Courses</span>
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
    departmentCourse.length,
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
    <PageContainer title="Update Department" description="Update Department">
      <>
      <Modal
        backdrop="blur"
        isDismissable={false}
        isOpen={isOpen} 
        onOpenChange={() => {
          setCourseId("");
          setErrorMessage("");
          onOpenChange()
        }}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Delete Course</ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                    <p>Are you sure you want to delete this course ?</p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={() => {
                  setCourseId("");
                  setErrorMessage("");
                  onClose();
                }}>
                  Close
                </Button>
                <Button color="primary" onPress={async() => {
                    setLoadingStatus(true);
                    try{
                        await deleteDepartmentCourse(params.departmentId, courseId).then((object: any) => {
                            if(object.statusCode == 200){
                                onClose();
                                setCourseId("");
                                fetchDepartmentCourses(params.departmentId).then((object: any) => {
                                    setDepartmentCourse(object.data || []);
                                })
                                setErrorMessage("");
                                }else{
                                setErrorMessage(object.message)
                                }
                        })
                    }finally{
                        setLoadingStatus(false);
                    }
                }}>
                    {isLoading ? <Spinner color="default" size="sm"/> : "Delete"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Box component="div">
        <div>
          <form onSubmit={handleSubmit}>
            <h2 style={{ fontSize: "22px", marginBottom: "20px", fontWeight: "600"}}>Edit Department</h2>
            <Grid container className="mt-0.5">
                <Grid item xs={6} sm={6} md={6} lg={6} className="mb-2">
                    <Input
                        autoFocus
                        label="Department Name"
                        className="w-full sm:max-w-[94%]"
                        labelPlacement='inside'
                        placeholder="Enter department name"
                        variant="bordered"
                        onChange={(e) => {setDepartment({...department, DepartmentName: e.target.value})}}
                        value={department.DepartmentName}
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={6} lg={6} className="flex justify-end mb-2">
                    <Select
                      required
                      selectionMode="multiple"
                      label= "Courses"
                      variant="bordered"
                      placeholder="Select a course"
                      errorMessage={isValid || !touched ? "" : "You need to select a course"}
                      isInvalid={isValid || !touched ? false: true}
                      className="w-full sm:max-w-[94%]"
                      selectedKeys={course}
                      onChange={handleSelectionChange}
                      onClose={() => setTouched(true)}
                    >
                      {courseDropdownList.map((roles) => (
                        <SelectItem key={roles.key}>
                          {roles.label}
                        </SelectItem>
                      ))}
                    </Select>
                </Grid>
                {/* <Grid item xs={6} sm={6} md={6} lg={6} className="mb-2">
                </Grid> */}
                <Grid item xs={9} sm={9} md={9} lg={9} className="mt-4">
                </Grid>
                <Grid item xs={3} sm={3} md={3} lg={3} className="mt-4 flex justify-end">
                    <Button color="primary" variant="solid" className="flex w-full sm:max-w-[65%] h-14 mb-10" isLoading={isLoading} onClick={(e: any) => {
                        setLoadingStatus(true)
                        handleSubmit(e)
                    }}>
                        Update Department
                    </Button>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12}>
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
                      <TableBody isLoading={isFetchingDepartmentCourse} loadingContent={<Spinner label="Loading ..."/>} emptyContent={"No courses found"} items={sortedItems}>
                        {(item) => (
                          <TableRow key={item.CourseId}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                </Grid>
            </Grid>
          </form>
        </div>
      </Box>
      </>
    </PageContainer>
  )
}

export default EditDepartment;
