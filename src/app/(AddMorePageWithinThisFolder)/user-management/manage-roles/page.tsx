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
  Skeleton,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Modal, 
  ModalContent,
  useDisclosure,
  Spinner
} from "@nextui-org/react";
import { PlusIcon } from '@/components/icon/plus-icon';
import { EditIcon } from "@/components/icon/edit-icon";
import { DeleteIcon } from "@/components/icon/delete-icon";
import { ChevronDownIcon } from '@/components/icon/chevron-down-icon';
import { SearchIcon } from '@/components/icon/search-icon';
import { fetchRoles, deleteRole, createRole, updateRole, MsRole } from '../../../api/user-management/manage-roles';
import { generateGUID } from "../../../../../utils/boilerplate-function";
import { error } from "console";

const statusColorMap: Record<string, ChipProps["color"]>  = {
  active: "success",
  inactive: "danger",
};

const columns = [
  {name: "ROLE NAME", uid: "RoleName", sortable: true},
  {name: "CREATED BY", uid: "CreatedBy"},
  {name: "UPDATED BY", uid: "UpdatedBy"},
  {name: "STATUS", uid: "ActiveFlag", sortable: true},
  {name: "ACTIONS", uid: "Actions"},
];

const statusOptions = [
  {name: "Active", uid: "active"},
  {name: "Inactive", uid: "inactive"},
];

const defaultRole : MsRole = {
  RoleId: "",
  RoleName: "",
  CreatedBy: "",
  CreatedDate: new Date().toISOString(),
  UpdatedBy: "",
  UpdatedDate: new Date(0).toISOString(),
  ActiveFlag: false,
}

const INITIAL_VISIBLE_COLUMNS = ["RoleName", "CreatedBy", "UpdatedBy", "ActiveFlag", "Actions"];

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const ManageRoles = () => {
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "RoleName",
    direction: "ascending",
  });
  const [isFetchingRoles, setIsFetchingRoles] = React.useState(true);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isEdit, setIsEdit] = React.useState(false);
  const [isDelete, setIsDelete] = React.useState(false);
  const [isCreate, setIsCreate] = React.useState(false);
  const [roleId, setRoleId] = React.useState("");
  let [role, setRole] = React.useState<MsRole | any>(defaultRole);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  // const handleEditClick = (roleId: string) => {
  //   window.location.href = `/user-management/manage-roles/edit-role/${roleId}`
  // }

  // const handleAddClick = () => {
  //   window.location.href = `/user-management/manage-roles/add-role`
  // }

  const [roles, setRoles] = React.useState<MsRole[]>([]);
  useEffect(() => {
    setIsFetchingRoles(true);
    fetchRoles().then((object: any) => {
      setRoles(object.data || []);
    });
    setIsFetchingRoles(false);
  }, []);

  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...roles];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) =>
        user.RoleName.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }
    if (statusFilter !== "all" && Array.from(statusFilter).length !== statusOptions.length) {
      filteredUsers = filteredUsers.filter((user) =>
        Array.from(statusFilter).includes(user.ActiveFlag ? "active" : "inactive"),
      );
    }

    return filteredUsers;
  }, [roles, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof MsRole];
      const second = b[sortDescriptor.column as keyof MsRole];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((role: MsRole, columnKey: React.Key) => {
    const cellValue = role[columnKey as keyof MsRole];

    switch (columnKey) {
      case "RoleName":
        return (
          <div className="flex flex-col">
            {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
            <p className="text-bold text-tiny capitalize text-default-400">{role.RoleName}</p>
          </div>
        );
      case "CreatedBy":
        return (
          <div className="flex flex-col">
            {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
            <p className="text-bold text-tiny capitalize text-default-400">{role.CreatedBy}</p>
          </div>
        );
        case "UpdatedBy":
          return (
            <div className="flex flex-col">
              {/* <p className="text-bold text-small capitalize">{role.UpdatedBy ?? "N/A"}</p> */}
              <p className="text-bold text-tiny capitalize text-default-400">{role.UpdatedBy ?? "N/A"}</p>
            </div>
          );
      case "ActiveFlag":
        return (
          <Chip className="capitalize" color={statusColorMap[role.ActiveFlag ? "active" : "inactive"]} size="sm" variant="flat">
            {role.ActiveFlag ? "active" : "inactive"}
          </Chip>
        );
      case "Actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit Role">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <EditIcon onClick={() => {setIsEdit(true); setRoleId(role.RoleId); setRole(role); onOpen()}} />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete Role">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <DeleteIcon onClick={() => {setIsDelete(true); setRoleId(role.RoleId); setRole(role); onOpen()}}/>
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
            placeholder="Search roles..."
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
          <span className="text-default-400 text-small">Total {roles.length} users</span>
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
    roles.length,
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
          setRole(defaultRole);
          setErrorMessage("");
          onOpenChange()
        }}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{isEdit ? "Edit Role" : isDelete ? "Delete Role" : isCreate ? "Add Role" : ""}</ModalHeader>
              <ModalBody>
                {(isCreate || isEdit) ? (
                  <>
                    <Input
                      autoFocus
                      label="Role Name"
                      placeholder="Enter role name"
                      variant="bordered"
                      onChange={(e) => {setRole({...role, RoleName: e.target.value})}}
                      value={role.RoleName}
                    />
                    <h5 className="text-default-400 ml-1" style={{ color: "red", fontSize: "12px" }}>
                      {errorMessage}
                    </h5>
                  </>
                ) : (
                  <div className="flex flex-col gap-4">
                    <p>Are you sure you want to delete <b>{role.RoleName}</b> ?</p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={() => {
                  setRole(defaultRole);
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
                      let newRole = {
                        RoleId: generateGUID(),
                        RoleName: role.RoleName,
                        CreatedBy: "User123",
                        CreatedDate: new Date().toISOString(),
                        UpdatedBy: null,
                        UpdatedDate: new Date(0).toISOString(),
                        ActiveFlag: true,
                      }
                      await createRole(newRole).then((object: any) => {
                        if(object.statusCode == 200){
                          onClose();
                          setIsCreate(false);
                          setRole(defaultRole);
                          fetchRoles().then((object: any) => {
                            setRoles(object.data || []);
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
                    {isLoading ? <Spinner size="sm" color="default"/> : "Add"}
                  </Button>
                ) : isEdit ? (
                  <Button color="primary" onPress={async () => {
                    setIsLoading(true);
                    try {
                      let updatedRole = {
                        RoleId: role.RoleId,
                        RoleName: role.RoleName,
                        CreatedBy: role.CreatedBy,
                        CreatedDate: role.CreatedDate,
                        UpdatedBy: "User123",
                        UpdatedDate: new Date().toISOString(),
                        ActiveFlag: role.ActiveFlag,
                      }
                      await updateRole(updatedRole).then((object: any) => {
                        if(object.statusCode == 200) {
                          onClose();
                          setIsEdit(false);
                          setRole(defaultRole);
                          fetchRoles().then((object: any) => {
                            setRoles(object.data || [] as MsRole[]);
                          })
                          setErrorMessage("");
                        }else{
                          setErrorMessage(object.message)
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
                      await deleteRole(roleId).then((object: any) => {
                        if(object.statusCode == 200){
                          onClose();
                          setIsDelete(false);
                          setRole(defaultRole);
                          fetchRoles().then((object: any) => {
                            setRoles(object.data || []);
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
        <TableBody isLoading={isFetchingRoles} loadingContent={<Spinner label="Loading ..."/>} emptyContent={"No roles found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.RoleId}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}

export default ManageRoles;
