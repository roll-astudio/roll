import type { Metadata } from "next";
import Footer from "../../components/site-footer/SiteFooter";
import SiteHeader from "../../components/site-header/SiteHeader";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Sobre nós — Roll",
};

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <SiteHeader />
<section className={styles.about} id="sobre">
  <div className={styles.aboutHeader}>

    <div className={styles.aboutTop}>
      <p className={styles.sectionEyebrow}>sobre nós</p>
      <span className={styles.aboutLine}></span>
    </div>

    <div className={styles.aboutMain}>
      <h2>
        Damos espaço a histórias <br /> <em>independentes.</em>
      </h2>

      <p className={styles.aboutIntro}>
        A Roll é uma estrutura dedicada à distribuição e comercialização de
        conteúdos audiovisuais, aproximando filmes e projectos independentes
        do público e do mercado.
      </p>
    </div>

  </div>

  <div className={styles.aboutContent}>
    <div className={styles.aboutStatement}>
      <span className={styles.aboutNumber}> </span>

      <div>
        <h3>A aStudio cria. A Roll faz chegar mais longe.</h3>

        <p>
          Trabalhamos com conteúdos produzidos pela aStudio e com produtores
          independentes que procuram novas formas de apresentar e comercializar
          os seus trabalhos.
        </p>

        <p>
          Através da Roll, filmes, documentários e outros conteúdos audiovisuais
          podem encontrar novos públicos e oportunidades de distribuição,
          criando uma ponte entre quem produz e quem procura novas histórias.
        </p>
      </div>
    </div>

    <div className={styles.aboutServices}>
      <div className={styles.aboutService}>
        <span>01</span>

        <div>
          <h4>Produção</h4>

          <p>
            A aStudio desenvolve e produz conteúdos audiovisuais para diferentes
            formatos e públicos.
          </p>
        </div>
      </div>

      <div className={styles.aboutService}>
        <span>02</span>

        <div>
          <h4>Distribuição</h4>

          <p>
            A Roll disponibiliza e promove conteúdos da aStudio e de produtores
            independentes, aproximando-os de novos públicos.
          </p>
        </div>
      </div>

      <div className={styles.aboutService}>
        <span>03</span>

        <div>
          <h4>Comercialização</h4>

          <p>
            Criamos oportunidades para que conteúdos independentes possam
            chegar ao mercado e ser comercializados.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
      <Footer />
    </main>
  );
}
