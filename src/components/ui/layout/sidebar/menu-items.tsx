import {
  IconBook2,
  IconCertificate,
  IconCertificate2,
  IconLayoutDashboard,
  IconSchool,
  IconSettings,
  IconUserPlus,
  IconBooks,
  IconMicroscope,
  IconClipboard,
  IconCalendarTime
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const Menuitems = [
  {
    navlabel: true,
    subheader: "Home",
    roles: ["administrator", "lecturer", "student"],
  },

  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/",
    roles: ["administrator", "lecturer", "student"],
  },
  {
    navlabel: true,
    subheader: "Assignment",
    roles: ["lecturer"],
  },
  {
    id: uniqueId(),
    title: "Assignment Management",
    icon: IconClipboard,
    href: "/assignment/assignment-management",
    roles: ["lecturer"],
  },
  {
    navlabel: true,
    subheader: "User Management",
    roles: ["administrator"],
  },
  {
    id: uniqueId(),
    title: "Manage Roles",
    icon: IconSettings,
    href: "/user-management/manage-roles",
    roles: ["administrator"],
  },
  {
    id: uniqueId(),
    title: "Manage Users",
    icon: IconUserPlus,
    href: "/user-management/manage-users",
    roles: ["administrator"],
  },
  {
    navlabel: true,
    subheader: "Enrollment",
    roles: ["administrator"],
  },
  {
    id: uniqueId(),
    title: "Manage Courses",
    icon: IconCertificate,
    href: "/enrollment/manage-courses",
    roles: ["administrator"],
  },
  {
    id: uniqueId(),
    title: "Manage Course Detail",
    icon: IconCertificate2,
    href: "/enrollment/manage-course-detail",
    roles: ["administrator"],
  },
  {
    id: uniqueId(),
    title: "Manage Session Schedule",
    icon: IconCalendarTime,
    href: "/enrollment/manage-session-schedule",
    roles: ["administrator"],
  },
  {
    id: uniqueId(),
    title: "Manage Faculties",
    icon: IconMicroscope,
    href: "/enrollment/manage-faculties",
    roles: ["administrator"],
  },
  {
    id: uniqueId(),
    title: "Manage Departments",
    icon: IconBooks,
    href: "/enrollment/manage-departments",
    roles: ["administrator"],
  },
  {
    id: uniqueId(),
    title: "Manage Classes",
    icon: IconBook2,
    href: "/enrollment/manage-classes",
    roles: ["administrator"],
  },
  {
    id: uniqueId(),
    title: "Manage Students",
    icon: IconSchool,
    href: "/enrollment/manage-students",
    roles: ["administrator"],
  },
  {
    navlabel: true,
    subheader: "Course",
    roles: ["student", "lecturer"],
  },
  {
    id: uniqueId(),
    title: "Course List",
    icon: IconCertificate,
    href: "/course/course-list",
    roles: ["student", "lecturer"],
  },
];

export default Menuitems;
