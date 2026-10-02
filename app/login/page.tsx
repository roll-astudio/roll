import SiteHeader from "../../components/site-header/SiteHeader";
import AuthForm from "./AuthForm";
import styles from "./page.module.css";

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <SiteHeader />
      <section className={styles.content}>
        <AuthForm mode="login" />
      </section>
    </main>
  );
}
