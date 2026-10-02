"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "../header/Header";
import Nav from "../nav/Nav";
import Button from "../button/Button";
import { createClient } from "../../lib/supabase/client";
import { getProducerIdForUser } from "../../lib/producers";
import styles from "./SiteHeader.module.css";

function Icon({ name, size = 20 }: { name: "user" | "menu"; size?: number }) {
  const paths = {
    user: (
      <>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20c.6-3.3 3-5 7-5s6.4 1.7 7 5" />
      </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<{ userId: string; admin: boolean } | null>(null);
  const showAdmin = isAdmin && isAdmin.userId === userId ? isAdmin.admin : false;
  const [producer, setProducer] = useState<{ userId: string; id: string | null } | null>(null);
  const producerId = producer && producer.userId === userId ? producer.id : null;

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setUserId(user?.id ?? null);
      setUserName(
        user ? String(user.user_metadata?.name || user.email || "") : null,
      );
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // Administradores têm um link para a página de gestão
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    createClient()
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setIsAdmin({ userId, admin: data?.role === "admin" });
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Produtores têm um link para o seu painel de vendas
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    getProducerIdForUser(createClient(), userId).then((id) => {
      if (!cancelled) setProducer({ userId, id });
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);
  const closeMenu = () => setMobileMenuOpen(false);
  const isActive = (path: string) => pathname === path;

  return (
    <Header>
      <Button
        className={styles.mobileMenuButton}
        aria-label="Abrir menu"
        aria-expanded={mobileMenuOpen}
        onClick={() => setMobileMenuOpen((open) => !open)}
      >
        <Icon name="menu" size={19} />
      </Button>
      <Nav
        className={mobileMenuOpen ? styles.mobileNavOpen : undefined}
        data-mobile-open={mobileMenuOpen}
      >
        <Link href="/" onClick={closeMenu}>
          Roll
        </Link>
        <Link
          className={isActive("/sobre-nos") || isActive("/contacto") ? undefined : styles.active}
          href="/#catalogo"
          onClick={closeMenu}
        >
          Filmes
        </Link>
        <Link
          className={isActive("/sobre-nos") ? styles.active : undefined}
          href="/sobre-nos"
          onClick={closeMenu}
        >
          Sobre nós
        </Link>
        <Link
          className={isActive("/contacto") ? styles.active : undefined}
          href="/contacto"
          onClick={closeMenu}
        >
          Contacto
        </Link>
      </Nav>
      <Link className={styles.brand} href="/" aria-label="Roll — início">
        <Image src="/logos/ROLL_CORES.png" alt="Roll" width={160} height={65} />
      </Link>
      <div className={styles.headerTools}>
        {showAdmin && (
          <Link href="/gestao" className={styles.panelLink}>
            Gestão
          </Link>
        )}
        {producerId && (
          <Link href={`/admin/${producerId}`} className={styles.panelLink}>
            Painel
          </Link>
        )}
        {userName && <span className={styles.userName}>{userName}</span>}
        <Link
          href="/conta" prefetch={false}
          className={styles.accountLink}
          aria-label={userName ? `Abrir conta de ${userName}` : "Abrir conta"}
        >
          <Icon name="user" size={19} />
        </Link>
      </div>
    </Header>
  );
}
