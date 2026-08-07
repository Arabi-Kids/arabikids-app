import Seo from '../components/Seo.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const SECTION_STYLE = { marginBottom: 28 };
const HEADING_STYLE = { color: 'var(--color-blue)' };
const BODY_STYLE = { color: '#4b5a6a' };
const LIST_STYLE = { color: '#4b5a6a', paddingLeft: 20, margin: '8px 0 0' };

export default function Terms() {
  const { t } = useLanguage();
  const sections = t('terms.sections');

  return (
    <div className="container" style={{ padding: '60px 0', maxWidth: 760, margin: '0 auto' }}>
      <Seo
        title="Terms of Use | ArabiKids"
        description="Read the ArabiKids terms of use governing your family's use of the platform."
        path="/terms"
      />
      <h1 className="page-title">{t('terms.title')}</h1>
      <p style={{ color: '#8ea0b6' }}>{t('terms.lastUpdated')}</p>
      <p style={BODY_STYLE}>{t('terms.intro')}</p>

      {sections.map((section, i) => (
        <section key={i} style={i === sections.length - 1 ? undefined : SECTION_STYLE}>
          <h3 style={HEADING_STYLE}>{section.heading}</h3>
          {section.body.map((item, j) =>
            Array.isArray(item) ? (
              <ul key={j} style={LIST_STYLE}>
                {item.map((li, k) => (
                  <li key={k}>{li}</li>
                ))}
              </ul>
            ) : (
              <p key={j} style={{ ...BODY_STYLE, marginTop: j === 0 ? 0 : 16 }} dangerouslySetInnerHTML={{ __html: item }} />
            )
          )}
        </section>
      ))}
    </div>
  );
}
