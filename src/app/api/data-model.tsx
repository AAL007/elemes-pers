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