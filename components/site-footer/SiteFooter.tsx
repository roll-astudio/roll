import Image from "next/image";
import Link from "next/link";
import FooterShell from "../footer/Footer";
import styles from "./SiteFooter.module.css";

function Icon({
  name,
  size = 20,
}: {
  name: "instagram" | "facebook" | "vimeo";
  size?: number;
}) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const icons: Record<string, React.ReactNode> = {
    instagram: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <circle cx="12" cy="12" r="3" />
        <path d="M17.5 6.5h.01" />
      </>
    ),
    facebook: (
      <path
        d="M14 8h3V4h-3a5 5 0 0 0-5 5v3H6v4h3v4h4v-4h3l1-4h-4V9a1 1 0 0 1 1-1Z"
        fill="currentColor"
        stroke="none"
      />
    ),
    vimeo: (
      <path
        d="M4 8c1.5-1.8 4.1-3.4 5.4-1.8 1 1.3.7 4.2 1.8 6.7.8 1.8 1.3 1.8 2.2.4.9-1.4 1.8-3.1 1.4-3.5-.4-.4-1.3.2-1.7.7.3-2.5 3.6-4.5 5.5-2.7 1.8 1.8-1.3 7-3.8 9.5-2.3 2.3-4.4 3.1-6.2.1C7.2 14.8 7 10.3 5.6 9.3 5 8.9 4.5 9.4 4 10V8Z"
        fill="currentColor"
        stroke="none"
      />
    ),
  };
  return (
    <svg {...p} aria-hidden="true">
      {icons[name]}
    </svg>
  );
}

export default function SiteFooter() {
  return (
      <FooterShell id="footer">
        <div className={styles.footerTop}>
          <div className={styles.footerIntro}>
            <Link
              className={styles.footerBrand}
              href="/"
              aria-label="Roll — voltar ao início"
            >
              <Image src="/logos/ROLL_CORES.png" alt="Roll" width={160} height={65} />
            </Link>
            <p>Filmes com tempo, intenção e espaço para ficar.</p>
          </div>

          <div className={styles.footerColumn}>
            <span className={styles.footerLabel}>explorar</span>
            <Link href="/#catalogo">Catálogo</Link>
            <Link href="/sobre-nos">Sobre nós</Link>
            <Link href="/contacto">Contacto</Link>
          </div>

          <div className={styles.footerColumn}>
            <span className={styles.footerLabel}>fale connosco</span>
            <a href="mailto:contacto@roll.pt">contacto@roll.pt</a>
            <span>Ponta do Sol, Madeira</span>
          </div>

          <div className={styles.footerColumn}>
            <span className={styles.footerLabel}>acompanhe</span>
            <div className={styles.socials}>
              <a href="#footer" aria-label="Instagram">
                <Icon name="instagram" size={17} />
              </a>
              <a href="#footer" aria-label="Facebook">
                <Icon name="facebook" size={17} />
              </a>
              <a href="#footer" aria-label="Vimeo">
                <Icon name="vimeo" size={19} />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>© 2024 Roll</span>
          <span>Cinema independente, perto de si.</span>
          <Link href="/">
            Voltar ao início <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </FooterShell>
  );
}
