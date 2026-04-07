import { PropertyExplorer } from "@/app/components/property-explorer";
import { getPropertySummary } from "@/lib/property-data";

export default function HomePage() {
  const summary = getPropertySummary();

  return (
    <main>
      <section className="hero">
        <div className="shell hero-simple">
          <div className="hero-intro">
            <div className="eyebrow">AA Property Explorer</div>
            <h1>Tra cứu property class</h1>
          </div>
        </div>
      </section>

      <section className="section" id="explorer">
        <div className="shell">
          <PropertyExplorer initialSummary={summary} />
        </div>
      </section>

      <footer className="footer">
        <div className="shell">
          Deploy on Vercel with project root <code>AA-report</code>.
        </div>
      </footer>
    </main>
  );
}
