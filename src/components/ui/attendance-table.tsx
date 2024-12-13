'use client'
import * as React from "react";
import "@/components/ui/component.css"
import { 
    Pagination, 
    Button, 
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Input,
    DropdownTrigger,
    Dropdown,
    DropdownMenu,
    DropdownItem,
    Chip,
    Selection,
    ChipProps,
    SortDescriptor,
    Spinner,
} from "@nextui-org/react";
import { ChevronDownIcon } from "@/components/icon/chevron-down-icon";
import { SearchIcon } from "@/components/icon/search-icon";
import { Attendance } from "@/app/(AddMorePageWithinThisFolder)/course/[...parameters]/page";
import { IconVideo } from "@tabler/icons-react";
import { createAttendanceLog, fetchAttendanceList } from "@/app/api/course/course-detail-list";
import { StudentAttendanceLog } from "@/app/api/data-model";

const statusColorMap: Record<string, ChipProps["color"]>  = {
    present: "success",
    absent: "danger",
    notStarted: "default"
};
  
const statusOptions = [
    {name: "Present", uid: "present"},
    {name: "Absent", uid: "absent"},
    {name: "Not Started", uid: "notStarted"},
];

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const columns = [
  {name: "SESSION NUMBER", uid: "number", sortable: true},
  {name: "SESSION NAME", uid: "name", sortable: true},
  {name: "DATE", uid: "date", sortable: true},
  {name: "TIME", uid: "time", sortable: true},
  {name: "ONLINE MEETING URL", uid: "url", sortable: true},
  {name: "ROOM", uid: "classroom", sortable: true},
  {name: "ATTEND CLASS", uid: "attendClass"},
  {name: "STATUS", uid: "status", sortable: true},
];

const INITIAL_VISIBLE_COLUMNS = ["name", "date", "time", "url", "classroom", "attendClass", "status"];

const AttendanceTableComponent = ({
    attendances,
    studentId,
    fetchAttendanceList,
}: {
    attendances: Attendance[];
    studentId: string;
    fetchAttendanceList: () => void;
}) => {
    const [filterValue, setFilterValue] = React.useState("");
    const [visibleColumns, setVisibleColumns] = React.useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
    const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
      column: "SessionNumber",
      direction: "ascending",
    });
    const [page, setPage] = React.useState(1);
    const [isButtonClicked, setIsButtonClicked] = React.useState(false);

    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      date.setHours(date.getHours());
  
      const startHour = date.getHours();
      const startMinute = date.getMinutes();
      const endHour = startHour + 1;
      const endMinute = startMinute + 30;
  
      const format = (hour: number, minute: number) => {
          const h = hour % 24;
          const m = minute % 60;
          return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      };
  
      return `${format(startHour, startMinute)} - ${format(endHour, endMinute)}`;
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    };

    const clockIn = async (sessionId: string) => {
      const newLog: StudentAttendanceLog = {
        SessionId: sessionId,
        StudentId: studentId,
        TimeIn: new Date(),
        Status: true,
        Remarks: "Clocked in"
      }
      const res = await createAttendanceLog(newLog);
      if(!res.success){
        alert(res.message);
        return;
      }
      setIsButtonClicked(false);    
      alert("Clocked in successfully!");
      await fetchAttendanceList();
    }

    const isButtonDisabled = (sessionStartDate: string) => {
      const sessionDate = new Date(sessionStartDate)
      const sessionEndDate = new Date(sessionDate.getTime() + 1.5 * 60 * 60 * 1000)
      const currentDate = new Date()

      return currentDate < sessionDate || currentDate > sessionEndDate
    }

    const hasSearchFilter = Boolean(filterValue);

    const headerColumns = React.useMemo(() => {
        if (visibleColumns === "all") return columns;

        return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
    }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredAttendance = [...attendances];

    if (hasSearchFilter) {
      filteredAttendance = filteredAttendance.filter((object) =>
        object?.sessionName.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }
    if (statusFilter !== "all" && Array.from(statusFilter).length !== statusOptions.length) {
      filteredAttendance = filteredAttendance.filter((object) =>
        Array.from(statusFilter).includes(object?.status == null ? "notStarted" : object?.status ? "present" : "absent"),
      );
    }

    return filteredAttendance;
  }, [attendances, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof Attendance];
      const second = b[sortDescriptor.column as keyof Attendance];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((attendance: Attendance, columnKey: React.Key) => {
    const cellValue = attendance[columnKey as keyof Attendance];

    switch (columnKey) {
      case "number":
        return (
          <div className="flex flex-col">
            {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
            <p className="text-bold text-tiny capitalize text-default-400">{attendance.sessionNumber}</p>
          </div>
        );
      case "name":
        return (
          <div className="flex flex-col">
            {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
            <p className="text-bold text-tiny capitalize text-default-400">{attendance.sessionName}</p>
          </div>
        );
      case "date":
        return (
          <div className="flex flex-col">
            {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
            <p className="text-bold text-tiny capitalize text-default-400">{formatDate(attendance.sessionDate)}</p>
          </div>
        );
      case "time":
        return (
          <div className="flex flex-col">
            {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
            <p className="text-bold text-tiny capitalize text-default-400">{formatTime(attendance.sessionDate)}</p>
          </div>
        );
      case "url":
        return (
          <div className="flex flex-col">
            {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
            <Button isDisabled={isButtonDisabled(attendance.sessionDate) || attendance.status} onClick={() => {setIsButtonClicked(true); window.location.href = `${attendance.onlineMeetingUrl}`}} color="primary"><IconVideo color="white"/> Join Meeting</Button>
          </div>
        );
      case "classroom":
        return (
          <div className="flex flex-col">
            {/* <p className="text-bold text-small capitalize">{role.UpdatedBy ?? "N/A"}</p> */}
            <p className="text-bold text-tiny capitalize text-default-400">{attendance.classroom}</p>
          </div>
        );
      case "attendClass":
        return (
          <div className="flex flex-col">
            <Button isLoading={isButtonClicked} className="text-white" isDisabled={isButtonDisabled(attendance.sessionDate) || attendance.status} onClick={() => {setIsButtonClicked(true); clockIn(attendance.sessionId)}} color="success">Clock In</Button>
          </div>
        )
      case "status":
        return (
          <Chip className="capitalize" color={statusColorMap[attendance.status == null ? "notStarted" : attendance.status ? "present" : "absent"]} size="sm" variant="flat">
            {attendance.status == null ? "not Started" : attendance.status ? "present" : "absent"}
          </Chip>
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
            placeholder="Search attendance..."
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
          <span className="text-default-400 text-small">Total {attendances.length} Attendances</span>
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
    attendances.length,
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
  }, [items.length, page, pages, hasSearchFilter]);

    return (
        <Table
            color="primary"
            className="mt-3 px-6 py-4"
            aria-label="Example table with custom cells, pagination and sorting"
            isHeaderSticky
            bottomContent={bottomContent}
            bottomContentPlacement="outside"
            classNames={{
                wrapper: "max-h-[382px]",
            }}
            // selectedKeys={[selectedKey]}
            // selectionMode="single"
            sortDescriptor={sortDescriptor}
            topContent={topContent}
            topContentPlacement="outside"
            // onSelectionChange={setSelectedKey}
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
            <TableBody loadingContent={<Spinner label="Loading ..."/>} emptyContent={"No attendance found"} items={sortedItems}>
                {(item) => (
                    <TableRow key={item.sessionNumber}>
                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}

export default AttendanceTableComponent;