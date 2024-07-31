import { iconClasses } from "@mui/material";
import {
  IconBook2,
  IconLayoutDashboard,
  IconSchool,
  IconSettings,
  IconUserPlus,
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const Menuitems = [
  {
    navlabel: true,
    subheader: "Home",
  },

  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/",
    roles: ["admin", "lecturer", "student"],
  },
  {
    navlabel: true,
    subheader: "User Management",
  },
  {
    id: uniqueId(),
    title: "Manage Roles",
    icon: IconSettings,
    href: "/user-management/manage-roles",
    roles: ["admin"],
  },
  {
    id: uniqueId(),
    title: "Manage Users",
    icon: IconUserPlus,
    href: "/user-management/manage-users",
    roles: ["admin"],
  },
  {
    navlabel: true,
    subheader: "Enrollment",
  },
  {
    id: uniqueId(),
    title: "Manage Classes",
    icon: IconBook2,
    href: "/enrollment/manage-classes",
    roles: ["admin"],
  },
  {
    id: uniqueId(),
    title: "Manage Students",
    icon: IconSchool,
    href: "/enrollment/manage-students",
    roles: ["admin"],
  },
  // {
  //   navlabel: true,
  //   subheader: "Extra",
  // },
  // {
  //   id: uniqueId(),
  //   title: "Icons",
  //   icon: IconMoodHappy,
  //   href: "/icons",
  // },
  // {
  //   id: uniqueId(),
  //   title: "Sample Page",
  //   icon: IconAperture,
  //   href: "/sample-page",
  // },
];

export default Menuitems;
