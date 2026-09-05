import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Header.module.css";

type HeaderProps = HTMLAttributes<HTMLElement> & {
  children?: ReactNode;
};

export default function Header({ className, children, ...props }: HeaderProps) {
  return (
    <header className={[styles.header, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </header>
  );
}
