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
  User,
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
import { PlusIcon } from '@/components/icon/plus-icon';
import { EditIcon } from "@/components/icon/edit-icon";
import { DeleteIcon } from "@/components/icon/delete-icon";
import { ChevronDownIcon } from '@/components/icon/chevron-down-icon';
import { SearchIcon } from '@/components/icon/search-icon';
import { MsRole, fetchRoles } from "@/app/api/user-management/manage-roles";
import { fetchStudents, fetchStaffs, deleteStaff, deleteStudent, UserList} from "@/app/api/user-management/manage-users";

const statusColorMap: Record<string, ChipProps["color"]>  = {
  active: "success",
  inactive: "danger",
};

const columns = [
  {name: "NAME", uid: "UserName", sortable: true},
  {name: "EMAIL", uid: "UserEmail"},
  {name: "ROLE", uid: "UserRole", sortable: true},
  {name: "STATUS", uid: "ActiveFlag", sortable: true},
  {name: "CREATED BY", uid: "CreatedBy"},
  {name: "UPDATED BY", uid: "UpdatedBy"},
  {name: "ACTIONS", uid: "Actions"},
];

const statusOptions = [
  {name: "Active", uid: "active"},
  {name: "Inactive", uid: "inactive"},
];

const defaultUser: UserList = {
  UserId: "",
  UserName: "",
  UserEmail: "",
  UserRole: "",
  CreatedBy: "",
  UpdatedBy: "",
  ActiveFlag: false,
  IsStaff: false,
}

const INITIAL_VISIBLE_COLUMNS = ["UserName", "UserEmail", "UserRole", "ActiveFlag", "Actions"];

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const ManageUsers = () => {
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "UserName",
    direction: "ascending",
  });
  const [isFetchingUsers, setIsFetchingUsers] = React.useState(true);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isDelete, setIsDelete] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [user, setUser] = React.useState<UserList | any>(defaultUser);

  const handleEditClick = (userId: string) => {
    window.location.href = `/user-management/manage-users/edit-user/${userId}`
  }

  const handleAddClick = () => {
    window.location.href = `/user-management/manage-users/add-user`
  }

  const [users, setUsers] = React.useState<UserList[]>([]);
  const [roles, setRoles] = React.useState<MsRole[]>([]);

  const handleFetchUsers = async () => {
    const rolesResponse = await fetchRoles()
    const roles = rolesResponse.data
    setRoles(roles)

    const staffsResponse = await fetchStaffs();
    const staffs = staffsResponse.data.map((z: any) => {
      return{
        UserId: z.StaffId,
        UserName: z.StaffName,
        UserEmail: z.StaffEmail,
        UserRole: roles.find((role: any) => role.RoleId == z.RoleId)?.RoleName ?? "N/A",
        CreatedBy: z.CreatedBy,
        UpdatedBy: z.UpdatedBy,
        ActiveFlag: z.ActiveFlag,
        IsStaff: true,
      }
    })

    const studentsResponse = await fetchStudents()
    const students = studentsResponse.data.map((z: any) => {
      return{
        UserId: z.StudentId,
        UserName: z.StudentName,
        UserEmail: z.StudentEmail,
        UserRole: roles.find((role: any) => role.RoleId == z.RoleId)?.RoleName ?? "N/A",
        CreatedBy: z.CreatedBy,
        UpdatedBy: z.UpdatedBy,
        ActiveFlag: z.ActiveFlag,
        IsStaff: false,
      }
    })

    const combinedUsers = [...staffs, ...students];
    const uniqueUsers = combinedUsers.filter((user, index, self) =>
      index === self.findIndex((u) => u.UserId === user.UserId)
    );

    setUsers(uniqueUsers)
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsFetchingUsers(true);
      await handleFetchUsers();
      setIsFetchingUsers(false);
    };
  
    fetchData();
  }, []);

  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

const filteredItems = React.useMemo(() => {
  let filteredUsers = [...users];

  if (hasSearchFilter) {
    filteredUsers = filteredUsers.filter((user) =>
      user.UserName.toLowerCase().includes(filterValue.toLowerCase()),
    );
  }
  if (statusFilter !== "all" && Array.from(statusFilter).length !== statusOptions.length) {
    filteredUsers = filteredUsers.filter((user) =>
      Array.from(statusFilter).includes(user.ActiveFlag ? "active" : "inactive"),
    );
  }

  return filteredUsers;
}, [users, hasSearchFilter, filterValue, statusFilter, statusOptions.length]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof UserList];
      const second = b[sortDescriptor.column as keyof UserList];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((user: UserList, columnKey: React.Key) => {
    const cellValue = user[columnKey as keyof UserList];

    switch (columnKey) {
      case "UserName":
        return (
          <div className="flex flex-col">
            {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
            <p className="text-bold text-tiny capitalize text-default-400">{user.UserName}</p>
          </div>
        );
      case "UserEmail":
        return (
          <div className="flex flex-col">
            {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
            <p className="text-bold text-tiny capitalize text-default-400">{user.UserEmail}</p>
          </div>
        );
      case "UserRole":
        return (
          <div className="flex flex-col">
            {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
            <p className="text-bold text-tiny capitalize text-default-400">{user.UserRole}</p>
          </div>
        );
      case "ActiveFlag":
        return (
          <Chip className="capitalize" color={statusColorMap[user.ActiveFlag ? "active" : "inactive"]} size="sm" variant="flat">
            {user.ActiveFlag ? "active" : "inactive"}
          </Chip>
        );
      case "CreatedBy":
        return (
          <div className="flex flex-col">
            {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
            <p className="text-bold text-tiny capitalize text-default-400">{user.CreatedBy}</p>
          </div>
        );
        case "UpdatedBy":
          return (
            <div className="flex flex-col">
              {/* <p className="text-bold text-small capitalize">{role.UpdatedBy ?? "N/A"}</p> */}
              <p className="text-bold text-tiny capitalize text-default-400">{user.UpdatedBy ?? "N/A"}</p>
            </div>
          );
        case "Actions":
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip content="Edit Role">
                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                  <EditIcon onClick={() => {handleEditClick(user.UserId)}} />
                </span>
              </Tooltip>
              <Tooltip color="danger" content="Delete Role">
                <span className="text-lg text-danger cursor-pointer active:opacity-50">
                  <DeleteIcon onClick={() => {setIsDelete(true); setUser(user); onOpen()}}/>
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
            placeholder="Search users..."
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
            <Button onClick={() => {handleAddClick()}} color="primary" endContent={<PlusIcon />}>
              Add New
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {users.length} users</span>
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
    users.length,
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
          setErrorMessage("");
          onOpenChange()
        }}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Delete Role</ModalHeader>
              <ModalBody>
                  <div className="flex flex-col gap-4">
                    <p>Are you sure you want to delete <b>{user.UserName}</b> ?</p>
                  </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={() => {
                  setIsDelete(false);
                  setErrorMessage("");
                  onClose();
                }}>
                  Close
                </Button>
                <Button color="primary" onPress={async() => {
                  setIsLoading(true);
                  try{
                    await (user.IsStaff ? deleteStaff(user.UserId) : deleteStudent(user.UserId)).then((object: any) => {
                      if(object.statusCode == 200){
                        setUser(defaultUser);
                        handleFetchUsers();
                        setErrorMessage("");
                        setIsDelete(false);
                        onClose();
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
              align={column.uid === "Actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody isLoading={isFetchingUsers} loadingContent={<Spinner label="Loading ..."/>} emptyContent={"No users found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.UserId}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}

export default ManageUsers;
