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
  ModalBody,
  ModalHeader,
  ModalFooter,
  Modal, 
  ModalContent,
  useDisclosure,
  Tooltip,
  Spinner,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { EyeIcon } from '@/components/icon/eye-icon';
import { ChevronDownIcon } from '@/components/icon/chevron-down-icon';
import { SearchIcon } from '@/components/icon/search-icon';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { loadUserFromStorage } from "@/lib/user-slice";
import { SelectList, Score } from "@/app/api/data-model";
import { Box, Grid } from "@mui/material";
import { fetchActivePeriod, fetchLecturerClassCourse, fetchAssessment } from "@/app/api/assignment/assignment-management";
import { fetchStudentsAnswer, createOrUpdateScore, fetchStudentScore } from "@/app/api/score/student-result";
import { AssessmentAnswer } from "@/app/api/data-model";
import { ScoreIcon } from "@/components/icon/score-icon";
import { fetchStudent } from "@/app/api/user-management/manage-users";

const columns = [
  {name: "STUDENT NAME", uid: "StudentId", sortable: true},
  {name: "REMAINING CHANCES", uid: "Chances"},
  {name: "SCORE", uid: "Score"},
  {name: "CREATED DATE", uid: "CreatedDate"},
  {name: "UPDATED DATE", uid: "UpdatedDate"},
  {name: "ACTIONS", uid: "Actions"},
];

const INITIAL_VISIBLE_COLUMNS = ["StudentId", "Chances", "Score", "CreatedDate", "UpdatedDate", "Actions"];

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const StudentResult = () => {
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
  const [isFetchingStudentAnswer, setIsFetchingStudentAnswer] = React.useState(true);
  const [touched, setTouched] = React.useState(false);
  const [touched2, setTouched2] = React.useState(false);
  const [touched3, setTouched3] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [academicPeriod, setAcademicPeriod] = React.useState<string>("");
  const [score, setScore] = React.useState<number>(0);
  const [assessmentAnswer, setAssessmentAnswer] = React.useState<AssessmentAnswer | null>(null);
  const [assessmentAnswers, setAssessmentAnswers] = React.useState<AssessmentAnswer[]>([]);
  const [classes, setClasses] = React.useState<SelectList[]>([]);
  const [classId, setClassId] = React.useState<string>("");
  const [courses, setCourses] = React.useState<SelectList[]>([]);
  const [courseId, setCourseId] = React.useState<string>("");
  const [assessments, setAssessments] = React.useState<SelectList[]>([]);
  const [assessmentId, setAssessmentId] = React.useState<string>("");
  const isValid = classId !==""
  const isValid2 = courseId !== ""
  const isValid3 = assessmentId !== ""

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

  useEffect(() => {
    dispatch(loadUserFromStorage());
    setIsFetchingStudentAnswer(true);
    fetchActivePeriod().then((object: any) => {
        setAcademicPeriod(object.data[0].Key);
    })
  }, [dispatch]);

  useEffect(() => {
    setIsFetchingStudentAnswer(true);
    fetchLecturerClassCourse(userData.name, academicPeriod).then((object: any) => {
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
        setIsFetchingStudentAnswer(true);
        fetchAssessment(courseId, classId, academicPeriod).then((object: any) => {
          const assessments = object.data.map((z: any) => {
            return {
                key: z.AssessmentId,
                label: z.AssessmentName,
            }
          })
          setAssessments(assessments || []);
          setAssessmentId(assessments[0]?.key ?? "");
        })
    }
    
    useEffect(() => {
        fetchingAssessment(courseId, classId, academicPeriod);
    }, [classId, courseId])

    const fetchingStudentsAnswerScore = async () => {
      setAssessmentAnswers([]);
      setIsFetchingStudentAnswer(true);
      let res = await fetchStudentScore(assessmentId)
      let studentScore = res.data.map((z: any) => {
        return {
          StudentId: z.StudentId,
          AssessmentId: z.AssessmentId,
          Score: z.Score,
        }
      })
      fetchStudentsAnswer(assessmentId).then((object: any) => {
        const assessmentAnswers = object.data.map((z: any) => {
          return {
              StudentId: z.studentId,
              StudentName: z.studentName,
              AssessmentId: z.assessmentId,
              AnswerUrl: z.answerUrl,
              Score: studentScore.find((x: any) => x.StudentId === z.studentId && x.AssessmentId === z.assessmentId)?.Score || 0,
              CreatedDate: z.createdDate,
              UpdatedDate: z.updatedDate,
              Chances: z.chances,
          }
        })
        setAssessmentAnswers(assessmentAnswers|| []);
        setIsFetchingStudentAnswer(false);
      })
    }

    useEffect(() => {
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
      const first = a[sortDescriptor.column as keyof AssessmentAnswer];
      const second = b[sortDescriptor.column as keyof AssessmentAnswer];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((assessmentAnswer: AssessmentAnswer, columnKey: React.Key) => {
    const cellValue = assessmentAnswer[columnKey as keyof AssessmentAnswer];

    switch (columnKey) {
      case "StudentId":
        return (
          <div className="flex flex-col">
            {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
            <p className="text-bold text-tiny capitalize text-default-400">{assessmentAnswer.StudentName}</p>
          </div>
        );
      case "Chances":
        return (
            <div className="flex flex-col">
                {/* <p className="text-bold text-small capitalize">{cellValue}</p> */}
                <p className="text-bold text-tiny capitalize text-default-400">{assessmentAnswer.Chances}</p>
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
        case "UpdatedDate":
          return (
            <div className="flex flex-col">
              {/* <p className="text-bold text-small capitalize">{role.UpdatedBy ?? "N/A"}</p> */}
              <p className="text-bold text-tiny capitalize text-default-400">{assessmentAnswer.UpdatedDate == null ?  "N/A" : formatDate(assessmentAnswer.UpdatedDate)}</p>
            </div>
          );
      case "Actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Preview Assignment">
                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                  <EyeIcon onClick={() => {window.open(assessmentAnswer.AnswerUrl, '_blank')}}/>
                </span>
            </Tooltip>
            <Tooltip color="warning" content="Score the Assignment">
                <span className="text-lg text-warning-400 cursor-pointer active:opacity-50">
                  <ScoreIcon onClick={() => {setScore(assessmentAnswer.Score); setAssessmentAnswer(assessmentAnswer); onOpen()}}/>
                </span>
            </Tooltip>
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
          setScore(0);
          setAssessmentAnswer(null);
          onOpenChange()
        }}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Insert {assessmentAnswer?.StudentName} Score</ModalHeader>
              <ModalBody>
                <Input
                  type="number"
                  autoFocus
                  label={`${assessmentAnswer?.StudentName}'s Score`}
                  placeholder="Enter score"
                  variant="bordered"
                  onChange={(e) => {setScore(Number(e.target.value))}}
                  value={score.toString()}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={() => {
                  setScore(0);
                  setAssessmentAnswer(null);
                  onClose();
                }}>
                  Close
                </Button>
                <Button color="primary" onPress={async() => {
                  setIsLoading(true);
                  try{
                    let scoreObj: Score = {
                      StudentId: assessmentAnswer?.StudentId || "",
                      AssessmentId: assessmentAnswer?.AssessmentId || "",
                      Score: score,
                      CreatedBy: userData.name,
                      CreatedDate: new Date().toISOString(),
                      UpdatedBy: null,
                      UpdatedDate: new Date(0).toISOString(),
                    }
                    await createOrUpdateScore(scoreObj).then((object: any) => {
                      if(!object.success){
                        alert(object.message)
                        setIsLoading(false);
                        return;
                      }
                    })
                    setScore(0);
                    setAssessmentAnswer(null);
                    fetchingStudentsAnswerScore();
                    onClose();
                }finally{
                  setIsLoading(false);
                }
                }}>
                {isLoading ? <Spinner size="sm" color="default"/> : "Submit"}
              </Button>
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
                      label= "Class"
                      variant="bordered"
                      placeholder="Select a class"
                      errorMessage={isValid || !touched ? "" : "You need to select a class"}
                      isInvalid={isValid || !touched ? false: true}
                      className="w-full sm:max-w-[94%]"
                      selectedKeys={[classId]}
                      onChange={(e) => setClassId(e.target.value)}
                      value={classId}
                      onClose={() => setTouched(true)}
                    >
                      {classes.map((classObj) => (
                        <SelectItem key={classObj.key}>
                          {classObj.label}
                        </SelectItem>
                      ))}
                    </Select>
                </Grid>
                <Grid item xs={4} sm={4} md={4} lg={4} className="flex justify-end mb-2">
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
                      onClose={() => setTouched2(true)}
                      value={courseId}
                    >
                      {courses.map((course) => (
                        <SelectItem key={course.key}>
                          {course.label}
                        </SelectItem>
                      ))}
                    </Select>
                </Grid>
                <Grid item xs={4} sm={4} md={4} lg={4} className="flex justify-end mb-2">
                    <Select
                      required
                      label= "Assignment"
                      variant="bordered"
                      placeholder="Select an assignment"
                      errorMessage={isValid3 || !touched3 ? "" : "You need to select an assignment"}
                      isInvalid={isValid3 || !touched3 ? false: true}
                      className="w-full sm:max-w-[94%]"
                      selectedKeys={[assessmentId]}
                      onChange={(e) => setAssessmentId(e.target.value)}
                      value={assessmentId}
                      onClose={() => setTouched3(true)}
                    >
                      {assessments.map((assessment) => (
                        <SelectItem key={assessment.key}>
                          {assessment.label}
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
