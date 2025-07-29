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
  Pagination,
  Selection,
  SortDescriptor,
  Spinner,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { ChevronDownIcon } from '@/components/icon/chevron-down-icon';
import { SearchIcon } from '@/components/icon/search-icon';
import { fetchStudentsAnswer } from "@/app/api/score/student-result";
import { ScoreResponse } from "@/app/api/data-model";

const columns = [
  {name: "STUDENT NAME", uid: "StudentName", sortable: true},
  {name: "SCORE", uid: "Score"},
  {name: "CREATED DATE", uid: "CreatedDate"},
  // {name: "ACTIONS", uid: "Actions"},
];

const INITIAL_VISIBLE_COLUMNS = ["StudentName", "Score", "CreatedDate"];

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const StudentResult = ({assessmentId} : {assessmentId: string}) => {
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "StudentName",
    direction: "ascending",
  });
  const [isFetchingStudentAnswer, setIsFetchingStudentAnswer] = React.useState(true);
  const [assessmentAnswers, setAssessmentAnswers] = React.useState<ScoreResponse[]>([]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    return `${formattedDate} ${formattedTime}`;
  };

    const fetchingStudentsAnswerScore = async () => {
      fetchStudentsAnswer(assessmentId).then((object: any) => {
        const newAssessmentAnswers = object.data.map((z: any) => {
          return {
              StudentId: z.studentId,
              StudentName: z.studentName,
              AssessmentId: z.assessmentId,
              Score: z.score,
              CreatedDate: z.createdDate,
          }
        })
        setAssessmentAnswers(newAssessmentAnswers|| []);
        setIsFetchingStudentAnswer(false);
      })
    }

    useEffect(() => {
        setIsFetchingStudentAnswer(true);
        setAssessmentAnswers([]);
        fetchingStudentsAnswerScore();
    }, [assessmentId])

  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredAssessmentAnswers = [...assessmentAnswers];

    if (hasSearchFilter) {
      filteredAssessmentAnswers = filteredAssessmentAnswers.filter((assessmentAnswer) =>
        assessmentAnswer.StudentName.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }

    return filteredAssessmentAnswers;
  }, [assessmentAnswers, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof ScoreResponse];
      const second = b[sortDescriptor.column as keyof ScoreResponse];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((assessmentAnswer: ScoreResponse, columnKey: React.Key) => {
    const cellValue = assessmentAnswer[columnKey as keyof ScoreResponse];

    switch (columnKey) {
      case "StudentName":
        return (
          <div className="flex flex-col">
            {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
            <p className="text-bold text-tiny capitalize text-default-400">{assessmentAnswer.StudentName}</p>
          </div>
        );
      case "Score":
        return (
            <div className="flex flex-col">
                {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
                <p className="text-bold text-tiny capitalize text-default-400">{assessmentAnswer.Score}</p>
            </div>
        );
      case "CreatedDate":
        return (
          <div className="flex flex-col">
            {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
            <p className="text-bold text-tiny capitalize text-default-400">{formatDate(assessmentAnswer.CreatedDate)}</p>
          </div>
        );
      default:
        return cellValue;
    }
  }, [assessmentAnswers]);

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
          <span className="text-default-400 text-small">Total {assessmentAnswers.length} Students</span>
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
    assessmentAnswers,
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    assessmentAnswers,
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
        <TableBody isLoading={isFetchingStudentAnswer} loadingContent={<Spinner label="Loading ..."/>} emptyContent={"No students found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.StudentId}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}

export default StudentResult;
