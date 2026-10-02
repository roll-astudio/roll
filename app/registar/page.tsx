import SiteHeader from "../../components/site-header/SiteHeader";
import AuthForm from "../login/AuthForm";
import styles from "../login/page.module.css";

export default function RegisterPage() {
  return (
    <main className={styles.page}>
      <SiteHeader />
      <section className={styles.content}>
        <AuthForm mode="register" />
      </section>
    </main>
  );
}
