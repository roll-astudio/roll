import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Nav.module.css";

type NavProps = HTMLAttributes<HTMLElement> & {
  children?: ReactNode;
};

export default function Nav({ className, children, ...props }: NavProps) {
  return (
    <nav className={[styles.nav, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </nav>
  );
}
