import {
  IconBrandGithub,
  IconCalendar,
  IconChartBar,
  IconHelp,
  IconInfoCircle,
  IconLogout,
  IconSettings,
  IconTools,
  IconTopologyRing2,
  IconUser,
} from "@tabler/icons-react";

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
        icon: <IconChartBar width={20} />,
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
        icon: <IconChartBar width={20} />,
      },
      {
        label: "IPO Scoop",
        path: "/ipo/scoop",
        icon: <IconChartBar width={20} />,
      },
      {
        label: "SPAC Research",
        path: "/spac/research",
        icon: <IconChartBar width={20} />,
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
