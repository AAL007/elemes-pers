export type MsRole = {
    RoleId: string;
    RoleName: string;
    RoleCategoryId: string;
    CreatedBy: string;
    CreatedDate: any;
    UpdatedBy: string | null;
    UpdatedDate: any;
    ActiveFlag: boolean;
}

export type MsClass = {
    ClassId: string;
    ClassName: string;
    DepartmentId: string;
    AcademicPeriodId: string;
    CreatedBy: string;
    CreatedDate: any;
    UpdatedBy: string | null;
    UpdatedDate: any;
    ActiveFlag: boolean;
}

export type LecturerClass = {
    ClassId: string;
    StaffId: string;
    CreatedBy: string;
    CreatedDate: any;
    UpdatedBy: string | null;
    UpdatedDate: any;
    ActiveFlag: boolean;
}

export type MsFaculty = {
    FacultyId: string;
    FacultyName: string;
    CreatedBy: string;
    CreatedDate: any;
    UpdatedBy: string | null;
    UpdatedDate: any;
    ActiveFlag: boolean;
}

export type MsDepartment = {
    DepartmentId: string;
    DepartmentName: string;
    FacultyId: string;
    CreatedBy: string;
    CreatedDate: any;
    UpdatedBy: string | null;
    UpdatedDate: any;
    ActiveFlag: boolean;
}

export type DepartmentCourse = {
    DepartmentId: string;
    CourseId: string;
    CreatedBy: string;
    CreatedDate: any;
    UpdatedBy: string | null;
    UpdatedDate: any;
    ActiveFlag: boolean;
}

export type LecturerCourse = {
    StaffId: string;
    CourseId: string;
    CreatedBy: string;
    CreatedDate: any;
    UpdatedBy: string | null;
    UpdatedDate: any;
    ActiveFlag: boolean;
}

export type Enrollment = {
    ClassId: string;
    StudentId: string;
    CreatedBy: string;
    CreatedDate: any;
    UpdatedBy: string | null;
    UpdatedDate: any;
    ActiveFlag: boolean;
}

export type MsRoleCategory = {
    RoleCategoryId: string;
    RoleCategoryName: string;
    CreatedBy: string;
    CreatedDate: any;
    UpdatedBy: string | null;
    UpdatedDate: any;
    ActiveFlag: boolean;
}

export type MsLearningStyle = {
    LearningStyleId: string;
    LearningStyleName: string;
    CreatedBy: string;
    CreatedDate: any;
    UpdatedBy: string | null;
    UpdatedDate: any;
    ActiveFlag: boolean;
}

export type MsAcademicPeriod = {
    AcademicPeriodId: string;
    AcademicPeriodName: string;
    EffectiveStartDate: any;
    EffectiveEndDate: any;
    CreatedBy: string;
    CreatedDate: any;
    ActiveFlag: boolean;
}

export type MsCourse = {
    CourseId: string;
    CourseName: string;
    NumOfSession: number;
    TotalCredits: number;
    CreatedBy: string;
    CreatedDate: any;
    UpdatedBy: string | null;
    UpdatedDate: any;
    ActiveFlag: boolean;
}

export type CourseDetail = {
    CourseId: string;
    SessionId: string;
    SessionNumber: number;
    SessionName: string;
    ContentUrl: string;
    LearningOutcome: string;
    CreatedBy: string;
    CreatedDate: any;
    UpdatedBy: string | null;
    UpdatedDate: any;
    ActiveFlag: boolean;
}

export type SessionSchedule = {
    SessionId: string;
    ClassId: string;
    SessionDate: any;
    Classroom: string;
    OnlineMeetingUrl: string;
    CreatedDate: any;
    CreatedBy: string;
    UpdatedDate: any;
    UpdatedBy: string | null;
    ActiveFlag: boolean;
}

export type SessionScheduleResponse= {
    SessionId: string;
    SessionName: string;
    SessionNumber: number;
    ClassId: string;
    SessionDate: any;
    Classroom: string;
    OnlineMeetingUrl: string;
    CreatedDate: any;
    CreatedBy: string;
    UpdatedDate: any;
    UpdatedBy: string | null;
    ActiveFlag: boolean;
}

export type MsAssessment = {
    AssessmentId: string;
    AssessmentName: string;
    AssessmentUrl: string;
    CourseId: string;
    ClassId: string;
    AcademicPeriodId: string;
    SessionNumber: number;
    EffectiveStartDate: any;
    EffectiveEndDate: any;
    CreatedBy: string;
    CreatedDate: any;
    UpdatedBy: string | null;
    UpdatedDate: any;
    ActiveFlag: boolean;
}

export type AssessmentAnswer = {
    StudentId: string;
    StudentName: string;
    AssessmentId: string; 
    AnswerUrl: string;
    Score: number;
    CreatedDate: string;
    UpdatedDate: string;
    Chances: number;
}

export type Score = {
    StudentId: string;
    AssessmentId: string;
    Score: number;
    CreatedBy: string;
    CreatedDate: any;
    UpdatedBy: string | null;
    UpdatedDate: any;
}

export type SelectList = {
    key: string;
    label: string;
}

export type MsStaff = {
    StaffId: string;
    StaffName: string;
    StaffEmail: string;
    BirthDate: any;
    Address: string;
    RoleId: string;    
    CreatedBy: string;
    CreatedDate: any;
    UpdatedBy: string | null;
    UpdatedDate: any;
    ActiveFlag: boolean;
}

export type MsStudent = {
    StudentId: string;
    StudentName: string;
    StudentEmail: string;
    BirthDate: any;
    Address: string;
    AcadYear: string;
    RoleId: string;
    LearningStyleId: string;
    DepartmentId: string;
    CreatedBy: string;
    CreatedDate: any;
    UpdatedBy: string | null;
    UpdatedDate: any;
    ActiveFlag: boolean;
}

export type UserList = {
    UserId: string;
    UserName: string;
    UserEmail: string;
    UserRole: string;
    CreatedBy: string;
    UpdatedBy: string;
    ActiveFlag: boolean;
    IsStaff: boolean;
}