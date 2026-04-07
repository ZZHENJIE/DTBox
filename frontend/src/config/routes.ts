import { ElementType } from "react";
import { HomePage } from "../pages/Home";
import { LoginPage } from "../pages/Login";
import { RegisterPage } from "../pages/Register";
import { ProfilePage } from "../pages/Profile";
import { SettingsPage } from "../pages/Settings";
import { NotFoundPage } from "../pages/NotFound";
import { NoPermissionPage } from "../pages/NoPermission";
import { AboutPage } from "../pages/About";

// 工具
import { FinvizScreenerPage } from "../pages/Tool/Screener/Finviz";
import { QuotePage } from "../pages/Tool/Quote";
// 日历
import { FinvizEconomyPage } from "../pages/Calendar/Economy/Finviz";
import { IPOScoopPage } from "../pages/Calendar/IPO/Scoop";
import { SPACResearchPage } from "../pages/Calendar/SPAC/Research";

// 用户权限等级
export type UserRole = 0 | 1 | 5;

// 路由配置
export interface RouteConfig {
  path: string;
  component: ElementType;
  // 访问权限: undefined=只要登录, false=公开, number=需要该权限等级以上
  auth?: boolean | number;
  redirect?: string;
}

export const routes: RouteConfig[] = [
  // 公开路由
  { path: "/login", component: LoginPage, auth: false },
  { path: "/register", component: RegisterPage, auth: false },
  { path: "/about", component: AboutPage, auth: false },

  // 受保护的路由
  { path: "/", component: HomePage, auth: true },
  { path: "/profile", component: ProfilePage, auth: true },
  { path: "/settings", component: SettingsPage, auth: true },

  // 工具
  { path: "/screener/finviz", component: FinvizScreenerPage, auth: 1 },
  { path: "/quote", component: QuotePage, auth: 1 },

  // 日历
  { path: "/economy/finviz", component: FinvizEconomyPage, auth: 1 },
  { path: "/ipo/scoop", component: IPOScoopPage, auth: 1 },
  { path: "/spac/research", component: SPACResearchPage, auth: 1 },

  // 无权限页面
  { path: "/no-permission", component: NoPermissionPage, auth: false },

  // 404
  { path: "/404", component: NotFoundPage, auth: false },
  { path: "*", component: NotFoundPage, auth: false, redirect: "/404" },
];

// 公开路由路径集合
export const publicPaths = [
  "/login",
  "/register",
  "/404",
  "/no-permission",
  "/about",
];

// 权限名称映射
export const roleNames: Record<number, string> = {
  0: "普通用户",
  1: "高级用户",
  5: "管理员",
};
