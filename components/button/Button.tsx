import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
};

export default function Button({ className, children, ...props }: ButtonProps) {
  return (
    <button className={[styles.button, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </button>
  );
}
