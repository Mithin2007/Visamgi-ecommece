import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ChatbotWidget } from "@/components/chatbot/chatbot-widget";
import styles from "@/components/chatbot/chatbot-widget.module.css";

export default function ChatbotPreviewPage() {
  return (
    <main>
      <SiteHeader />
      <section className={`${styles.preview} shell`} aria-labelledby="chatbot-preview-title">
        <p className={styles.kicker}>VISAMGI · Stage 8</p>
        <h1 id="chatbot-preview-title">A quieter way to explore.</h1>
        <p className={styles.previewIntro}>This isolated preview shows the future collection guide using local mock replies. It is not connected to the live chatbot or catalogue.</p>
        <p className={styles.previewHint}>Open the “Ask VISAMGI” button to begin.</p>
      </section>
      <SiteFooter />
      <ChatbotWidget mode="preview" />
    </main>
  );
}
