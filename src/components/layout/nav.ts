import {
  LayoutDashboard,
  BookOpen,
  Hash,
  Bot,
  HelpCircle,
  Mail,
  Home,
  Tag,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  name: string;
  href: string;
  icon?: LucideIcon;
  children?: { name: string; href: string }[];
};

export const publicNav: NavItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Govi Advisor", href: "/govi", icon: Bot },
  { name: "Pricing", href: "/pricing", icon: Tag },
  { name: "FAQ", href: "/faq", icon: HelpCircle },
  { name: "Contact", href: "/contact", icon: Mail },
];

export const authedNav: NavItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Playbooks", href: "/playbooks", icon: BookOpen },
  { name: "Topics", href: "/topics", icon: Hash },
  { name: "Govi", href: "/govi", icon: Bot },
  { name: "FAQ", href: "/faq", icon: HelpCircle },
  { name: "Contact", href: "/contact", icon: Mail },
];
