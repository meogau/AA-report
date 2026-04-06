import { PropertyExplorer } from "@/app/components/property-explorer";
import { getPropertySummary } from "@/lib/property-data";

export default function HomePage() {
  const summary = getPropertySummary();

  return (
    <main>
      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-card">
            <div className="eyebrow">AA Property Explorer</div>
            <h1>Search property classes and inspect action logic.</h1>
            <p>
              One page, serverless-first. The search box suggests property
              classes, clicking a result opens its fields and meanings, and the
              related actions show the detailed logic captured in the report
              dataset.
            </p>
          </div>

          <div className="hero-side">
            <div className="hero-card metric">
              <strong>{summary.propertyClassCount}</strong>
              <span>
                total property classes available from the dataset and exposed by
                serverless routes
              </span>
            </div>
            <div className="hero-card metric">
              <strong>{summary.actionCount}</strong>
              <span>
                total action entries with direct logic sections, excluding
                `NO DIRECT ACTION`
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="explorer">
        <div className="shell">
          <div className="section-head">
            <div>
              <h2>Interactive Property Explorer</h2>
              <p>
                Click the property-class total to open the full list. Or search
                from the center input, choose a suggestion, and inspect field
                definitions plus detailed action logic.
              </p>
            </div>
          </div>

          <PropertyExplorer initialSummary={summary} />
        </div>
      </section>

      <footer className="footer">
        <div className="shell">
          Deploy on Vercel with project root <code>AA-report</code>. Data is
          regenerated during <code>npm run build</code> from
          <code> ../aa_property_final_report.md</code>.
        </div>
      </footer>
    </main>
  );
}
