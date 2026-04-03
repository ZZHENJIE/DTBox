import { Group, Menu, UnstyledButton } from "@mantine/core";
import { Link, useLocation } from "@tanstack/react-router";

interface NavItem {
  path?: string;
  label: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    label: "Tools",
    children: [
      { path: "/tool/chart", label: "Chart" },
      { path: "/tool/screener_finviz", label: "Screener Finviz" },
    ],
  },
  {
    label: "Calendar",
    children: [
      { path: "/calendar/economy_finviz", label: "Economy Finviz" },
      { path: "/calendar/ipo_scoop", label: "IPO Scoop" },
      { path: "/calendar/spac_research", label: "SPAC Research" },
    ],
  },
  { path: "/about", label: "About" },
];

function HeaderNav() {
  const pathname = useLocation().pathname;

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const renderNavItem = (item: NavItem) => {
    if (item.children) {
      const hasActiveChild = item.children.some((child) =>
        isActive(child.path),
      );
      return (
        <Menu trigger="hover" key={item.label}>
          <Menu.Target>
            <UnstyledButton
              c={hasActiveChild ? "blue" : "gray.4"}
              fw={hasActiveChild ? 600 : 400}
            >
              {item.label}
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            {item.children.map((child) => (
              <Menu.Item
                key={child.path}
                component={Link}
                to={child.path}
                c={isActive(child.path) ? "blue" : undefined}
              >
                {child.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      );
    }

    return (
      <UnstyledButton
        key={item.path}
        component={Link}
        to={item.path}
        c={isActive(item.path) ? "blue" : "gray.4"}
        fw={isActive(item.path) ? 600 : 400}
      >
        {item.label}
      </UnstyledButton>
    );
  };

  return <Group gap="md">{navItems.map(renderNavItem)}</Group>;
}

export default HeaderNav;
