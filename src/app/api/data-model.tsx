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

export type ForumPost = {
    ForumId: string;
    SessionId: string;
    ContentTitle: string;
    Content: string;
    ContentUrl: string;
    CreatorId: string;
    CreatorType: string;
    CreatedDate: any;
    UpdatedDate: any;
}

export type ForumPostResponse = ForumPost & {
    CreatorName: string;
    CreatorEmail: string;
    CreatorImage: string;
    File: File | null;
    NumOfReplies: number;
}

export type ForumThread = {
    ThreadId: string;
    ForumId: string;
    Content: string;
    ContentUrl: string;
    CreatorId: string;
    CreatorType: string;
    CreatedDate: any;
    UpdatedDate: any;
}

export type ForumThreadResponse = ForumThread & {
    CreatorName: string;
    CreatorEmail: string;
    CreatorImage: string;
    File: File | null;
}

export type StudentAttendanceLog = {
    StudentId: string;
    SessionId: string;
    TimeIn: any;
    Status: boolean;
    Remarks: string;
}

export type StudentSessionLog = {
    SessionId: string;
    StudentId: string;
    IsContentClicked: boolean;
    IsAssignmentClicked: boolean;
    CreatedDate: any;
    UpdatedDate: any | null;
}

export type StudentActivityLog = {
    StudentId: string;
    SessionId: string;
    LearningStyleId: string;
    TimeSpent: number;
    Rating: number;
    CreatedDate: any;
}

export type MsCourse = {
    CourseId: string;
    CourseName: string;
    CourseImage: string;
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
    LearningOutcome: string;
    CreatedBy: string;
    CreatedDate: any;
    UpdatedBy: string | null;
    UpdatedDate: any;
    ActiveFlag: boolean;
}

export type ContentLearningStyle = {
    SessionId: string;
    LearningStyleId: string;
    ContentUrl: string;
    CreatedBy: string;
    CreatedDate: any;
    UpdatedBy: string | null;
    UpdatedDate: any;
}

export type SessionSchedule = {
    SessionId: string;
    ClassId: string;
    SessionDate: any;
    Classroom: string;
    OnlineMeetingUrl: string | null;
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
    Chances: number;
    AcademicPeriodId: string;
    SessionNumber: number;
    SessionId: string;
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
    AssessmentId: string; 
    AnswerUrl: string;
    CreatedDate: any;
    UpdatedDate: any;
    Chances: number;
}

export type AssessmentAnswerResponse = AssessmentAnswer & {
    Score: number;
    StudentName: string;
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
    PhoneNumber: string;
    BirthDate: any;
    Address: string;
    RoleId: string;   
    Gender: string;
    ProfilePictureUrl: string | null; 
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
    PhoneNumber: string;
    BirthDate: any;
    Address: string;
    AcadYear: string;
    RoleId: string;
    Gender: string;
    ProfilePictureUrl: string | null;
    LearningStyleId: string | null;
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