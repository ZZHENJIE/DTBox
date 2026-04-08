import {
  IconBrandGithub,
  IconCalendar,
  IconHelp,
  IconInfoCircle,
  IconLogout,
  IconSettings,
  IconTools,
  IconTopologyRing2,
  IconUser,
} from "@tabler/icons-react";
import { Icon } from "@/components/Icon";

export const logo = {
  text: "DTBox",
  link: "/",
};

export const navItems = [
  {
    label: "工具",
    icon: <IconTools width={20} />,
    children: [
      {
        label: "报价",
        path: "/quote",
        icon: <IconTopologyRing2 width={20} />,
      },
      {
        label: "Finviz股票筛选器",
        path: "/screener/finviz",
        icon: <Icon src="/Icon/Finviz.png" />,
      },
    ],
  },
  {
    label: "日历",
    icon: <IconCalendar></IconCalendar>,
    children: [
      {
        label: "Finviz财经",
        path: "/economy/finviz",
        icon: <Icon src="/Icon/Finviz.png" />,
      },
      {
        label: "IPO Scoop",
        path: "/ipo/scoop",
        icon: <Icon src="/Icon/IPOScoop.ico" />,
      },
      {
        label: "SPAC Research",
        path: "/spac/research",
        icon: <Icon src="/Icon/SPACResearch.jpeg" />,
      },
    ],
  },
  {
    label: "帮助",
    icon: <IconHelp width={20} />,
    children: [
      {
        label: "About",
        path: "/about",
        icon: <IconInfoCircle width={20} />,
      },
      {
        label: "GitHub",
        path: "https://github.com/ZZHENJIE/DTBox",
        icon: <IconBrandGithub width={20} />,
      },
    ],
  },
];

export const userMenuItems = [
  {
    label: "个人资料",
    path: "/profile",
    icon: <IconUser width={20} />,
  },
  {
    label: "设置",
    path: "/settings",
    icon: <IconSettings width={20} />,
  },
  {
    type: "divider",
  },
  {
    label: "退出登录",
    action: "logout",
    icon: <IconLogout width={20} />,
    color: "red",
  },
];

export const guestMenuItems = [
  {
    label: "登录",
    path: "/login",
    variant: "subtle",
  },
  {
    label: "注册",
    path: "/register",
  },
];
