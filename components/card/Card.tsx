import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Card.module.css";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export default function Card({ className, children, ...props }: CardProps) {
  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}
