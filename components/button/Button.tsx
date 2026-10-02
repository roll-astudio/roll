import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

// Estilos de botão da Roll. Sem `variant` o botão fica "cru" (usado em
// ícones e filtros que têm o seu próprio estilo).
//   primary   — ação principal (Ver filme, Comprar, Aprovar, Entrar)
//   secondary — ação secundária (Saber mais, Cancelar, Voltar, Terminar sessão)
export type ButtonVariant = "primary" | "secondary";

type BaseProps = {
  variant?: ButtonVariant;
  className?: string;
  children?: ReactNode;
};

type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type LinkButtonProps = BaseProps & { href: string; prefetch?: boolean };

export default function Button(props: ButtonProps | LinkButtonProps) {
  const { variant, className, children } = props;
  const classes = [
    styles.button,
    variant && styles.styled,
    variant && styles[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (props.href !== undefined) {
    return (
      <Link className={classes} href={props.href} prefetch={props.prefetch}>
        {children}
      </Link>
    );
  }

  const { variant: _variant, className: _className, href: _href, ...rest } = props;
  void _variant;
  void _className;
  void _href;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
