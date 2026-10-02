import type { Metadata } from "next";
import Footer from "../../components/site-footer/SiteFooter";
import SiteHeader from "../../components/site-header/SiteHeader";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Contacto — Roll",
};

export default function ContactPage() {
  return (
    <main className={styles.page}>
      <SiteHeader />
<section className={styles.contact} id="contacto">
        <div className={styles.contactTop}>
          <p className={styles.sectionEyebrow}>vamos conversar</p>

          <span className={styles.contactIndex}></span>
        </div>

        <div className={styles.contactMain}>
          <div className={styles.contactHeadline}>
            <h2>
              Tem uma história?
              <br />
              <em>Conte-nos.</em>
            </h2>

            <p>
              Estamos sempre à procura de novas histórias, parceiros e projectos
              com significado. Se tem uma ideia, um projecto ou simplesmente
              quer saber mais sobre o nosso trabalho, fale connosco.
            </p>
          </div>

          <div className={styles.contactDetails}>
            <a href="mailto:contacto@roll.pt" className={styles.contactItem}>
              <span className={styles.contactLabel}>email</span>
              <span className={styles.contactValue}>contacto@roll.pt</span>
              <span className={styles.contactArrow}>↗</span>
            </a>

            <a href="tel:+351210000000" className={styles.contactItem}>
              <span className={styles.contactLabel}>telefone</span>
              <span className={styles.contactValue}>+351 210 000 000</span>
              <span className={styles.contactArrow}>↗</span>
            </a>

            <div className={styles.contactItem}>
              <span className={styles.contactLabel}>estúdio</span>
              <span className={styles.contactValue}>Ponta do Sol, Madeira</span>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
