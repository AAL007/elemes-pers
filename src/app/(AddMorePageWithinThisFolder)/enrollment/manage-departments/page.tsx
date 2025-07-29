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
import { fetchDepartments, deleteDepartment, fetchFaculties } from '../../../api/enrollment/manage-departments';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { loadUserFromStorage } from "@/lib/user-slice";
import { MsFaculty, MsDepartment, SelectList } from "@/app/api/data-model";

const statusColorMap: Record<string, ChipProps["color"]>  = {
  active: "success",
  inactive: "danger",
};

const columns = [
  {name: "DEPARTMENT NAME", uid: "DepartmentName", sortable: true},
  {name: "CREATED BY", uid: "CreatedBy"},
  {name: "UPDATED BY", uid: "UpdatedBy"},
  {name: "STATUS", uid: "ActiveFlag", sortable: true},
  {name: "ACTIONS", uid: "Actions"},
];

const statusOptions = [
  {name: "Active", uid: "active"},
  {name: "Inactive", uid: "inactive"},
];

const defaultDepartment : MsDepartment = {
  DepartmentId: "",
  DepartmentName: "",
  CreatedBy: "",
  CreatedDate: new Date().toISOString(),
  UpdatedBy: "",
  UpdatedDate: new Date(0).toISOString(),
  ActiveFlag: false,
  FacultyId: "",
}

const INITIAL_VISIBLE_COLUMNS = ["DepartmentName", "CreatedBy", "UpdatedBy", "ActiveFlag", "Actions"];

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const ManageDepartments = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "DepartmentName",
    direction: "ascending",
  });
  const [isFetchingDepartment, setIsFetchingDepartment] = React.useState(true);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [ facultyId, setFacultyId ] = React.useState<string>("");
  const [touched, setTouched] = React.useState(false);
  let [department, setDepartment] = React.useState<MsDepartment | any>(defaultDepartment);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
//   const [academicPeriods, setAcademicPeriods] = React.useState<SelectList[]>([])

  const isValid = facultyId !== ""

  const handleEditClick = (departmentId: string) => {
    window.location.href = `manage-departments/edit-department/${departmentId}`
  }

  const handleAddClick = (facultyId: string) => {
    console.log(facultyId)
    window.location.href = `manage-departments/add-department/${facultyId}`
  }

  const [departments, setDepartments] = React.useState<MsDepartment[]>([]);
  const [faculties, setFaculties] = React.useState<SelectList[]>([]);
  useEffect(() => {
    dispatch(loadUserFromStorage());
    fetchFaculties().then((object: any) => {
        const faculties = object.data.map((z: MsFaculty) => {
            return{
                key: z.FacultyId,
                label: z.FacultyName
            }
        })
        setFaculties(faculties);
        setFacultyId(faculties[0].key)
    })
  }, [dispatch]);

  useEffect(() => {
    setIsFetchingDepartment(true);
    fetchDepartments(facultyId).then((object: any) => {
        setDepartments(object.data || []);
    })
    setIsFetchingDepartment(false);
  }, [facultyId]);

  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredDepartments = [...departments];

    if (hasSearchFilter) {
      filteredDepartments = filteredDepartments.filter((department) =>
        department.DepartmentName.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }
    if (statusFilter !== "all" && Array.from(statusFilter).length !== statusOptions.length) {
      filteredDepartments = filteredDepartments.filter((department) =>
        Array.from(statusFilter).includes(department.ActiveFlag ? "active" : "inactive"),
      );
    }

    return filteredDepartments;
  }, [departments, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof MsDepartment];
      const second = b[sortDescriptor.column as keyof MsDepartment];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((department: MsDepartment, columnKey: React.Key) => {
    const cellValue = department[columnKey as keyof MsDepartment];

    switch (columnKey) {
      case "DepartmentName":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-tiny capitalize text-default-400">{department.DepartmentName}</p>
          </div>
        );
      case "CreatedBy":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-tiny capitalize text-default-400">{department.CreatedBy}</p>
          </div>
        );
        case "UpdatedBy":
          return (
            <div className="flex flex-col">
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
            <Tooltip content="Edit Department">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <EditIcon onClick={() => {handleEditClick(department.DepartmentId)}} />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete Department">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <DeleteIcon onClick={() => {setDepartment(department); onOpen()}}/>
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
            <Button onClick={() => {handleAddClick(facultyId)}} color="primary" endContent={<PlusIcon />}>
              Add New
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {departments.length} Departments</span>
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
    facultyId,
    onSearchChange,
    onRowsPerPageChange,
    departments.length,
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
          setDepartment(defaultDepartment);
          setErrorMessage("");
          onOpenChange()
        }}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Delete Department</ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                    <p>Are you sure you want to delete <b>{department.DepartmentName}</b> ?</p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={() => {
                  setDepartment(defaultDepartment);
                  setErrorMessage("");
                  onClose();
                }}>
                  Close
                </Button>
                <Button color="primary" onPress={async() => {
                    setIsLoading(true);
                    try{
                        await deleteDepartment(department.DepartmentId).then((object: any) => {
                            if(object.statusCode == 200){
                                onClose();
                                setDepartment(defaultDepartment);
                                fetchDepartments(facultyId).then((object: any) => {
                                    setDepartments(object.data || []);
                                })
                                setErrorMessage("");
                                }else{
                                setErrorMessage(object.message)
                                }
                        })
                    }finally{
                        setIsLoading(false);
                    }
                }}>
                    {isLoading ? <Spinner color="default" size="sm"/> : "Delete"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Select
        label= "Faculty"
        variant="bordered"
        placeholder="Select faculty"
        errorMessage={isValid || !touched ? "" : "You need to select a faculty"}
        isInvalid={isValid || !touched ? false: true}
        selectedKeys={[facultyId]}
        className="max-w-[44%] mb-7"
        onChange={(e) => {
          setFacultyId(e.target.value);
          setIsFetchingDepartment(true);
          fetchDepartments(e.target.value).then((object: any) => {
            setDepartments(object.data || []);
          });
          setIsFetchingDepartment(false);
        }}
        onClose={() => setTouched(true)}
        value={facultyId}
        style={{ marginBottom: "2rem" }}
      >
        {faculties.map((faculty) => (
          <SelectItem key={faculty.key}>
            {faculty.label}
          </SelectItem>
         ))}
      </Select>
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
        <TableBody isLoading={isFetchingDepartment} loadingContent={<Spinner label="Loading ..."/>} emptyContent={"No departments found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.DepartmentId}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}

export default ManageDepartments;
