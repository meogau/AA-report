import Link from "next/link";
import { notFound } from "next/navigation";
import { PropertyDetailTabs } from "@/app/components/property-detail-tabs";
import { getPropertyClassBySlug } from "@/lib/property-data";

export default async function PropertyClassDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getPropertyClassBySlug(slug);

  if (!item) {
    notFound();
  }

  return (
    <main>
      <section className="hero detail-hero">
        <div className="shell">
          <Link className="back-link" href="/">
            ← Quay lại trang tìm kiếm
          </Link>

          <div className="panel detail-page-shell">
            <div className="detail-head">
              <div>
                <span className="eyebrow">Property Class</span>
                <h1 className="detail-title">{item.name}</h1>
              </div>
              <div className="detail-stats">
                <span>{item.fields.length} fields</span>
                <span>{item.actions.length} actions</span>
              </div>
            </div>

            <PropertyDetailTabs item={item} />
          </div>
        </div>
      </section>
    </main>
  );
}
