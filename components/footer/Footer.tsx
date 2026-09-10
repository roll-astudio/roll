import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Footer.module.css";

type FooterProps = HTMLAttributes<HTMLElement> & {
  children?: ReactNode;
};

export default function Footer({ className, children, ...props }: FooterProps) {
  return (
    <footer className={[styles.footer, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </footer>
  );
}
