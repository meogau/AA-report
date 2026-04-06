"use client";

import { useEffect, useMemo, useState } from "react";

type PropertySummary = {
  propertyClassCount: number;
  actionCount: number;
  totalActionEntries: number;
};

type PropertyListItem = {
  name: string;
  slug: string;
  fieldCount: number;
  actionCount: number;
};

type PropertyField = {
  name: string;
  meaning: string;
};

type PropertyAction = {
  name: string;
  summary: string;
  steps: string;
  flow: string;
};

type PropertyDetail = {
  name: string;
  slug: string;
  fields: PropertyField[];
  actions: PropertyAction[];
};

type SummaryResponse = {
  ok: boolean;
  summary: PropertySummary;
};

type ListResponse = {
  ok: boolean;
  query: string;
  total: number;
  items: PropertyListItem[];
};

type DetailResponse = {
  ok: boolean;
  item: PropertyDetail | null;
};

export function PropertyExplorer({
  initialSummary
}: {
  initialSummary: PropertySummary;
}) {
  const [summary, setSummary] = useState(initialSummary);
  const [query, setQuery] = useState("");
  const [showList, setShowList] = useState(false);
  const [suggestions, setSuggestions] = useState<PropertyListItem[]>([]);
  const [selected, setSelected] = useState<PropertyDetail | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/summary")
      .then((response) => response.json())
      .then((payload: SummaryResponse) => {
        if (active && payload.ok) {
          setSummary(payload.summary);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoadingList(true);

      try {
        const response = await fetch(
          `/api/property-classes?q=${encodeURIComponent(query)}`,
          {
            signal: controller.signal
          }
        );
        const payload: ListResponse = await response.json();
        setSuggestions(payload.items);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setSuggestions([]);
        }
      } finally {
        setLoadingList(false);
      }
    }, 160);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query]);

  const visibleSuggestions = useMemo(() => suggestions.slice(0, 10), [suggestions]);

  async function openDetail(slug: string) {
    setLoadingDetail(true);
    setShowList(false);

    try {
      const response = await fetch(`/api/property-classes/${slug}`);
      const payload: DetailResponse = await response.json();
      setSelected(payload.item);
    } finally {
      setLoadingDetail(false);
    }
  }

  return (
    <div className="explorer-layout">
      <div className="summary-row">
        <button className="summary-card" onClick={() => setShowList((value) => !value)}>
          <span className="summary-label">Property Classes</span>
          <strong>{summary.propertyClassCount}</strong>
          <p>Click to show the full list of property classes.</p>
        </button>

        <div className="summary-card secondary">
          <span className="summary-label">Actions</span>
          <strong>{summary.actionCount}</strong>
          <p>Direct action-logic entries parsed from the report dataset.</p>
        </div>
      </div>

      {showList ? (
        <div className="panel list-panel">
          <div className="list-grid">
            {suggestions.map((item) => (
              <button
                key={item.slug}
                className="list-item"
                onClick={() => openDetail(item.slug)}
              >
                <strong>{item.name}</strong>
                <span>
                  {item.fieldCount} fields · {item.actionCount} actions
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="search-shell panel">
        <div className="search-center">
          <input
            aria-label="Search property class"
            placeholder="Nhập property class, ví dụ: INTEREST hoặc BALANCE.AVAILABILITY"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="search-meta">
            {loadingList ? "Searching..." : `${suggestions.length} suggestion(s)`}
          </div>
        </div>

        {visibleSuggestions.length ? (
          <div className="suggestions">
            {visibleSuggestions.map((item) => (
              <button
                key={item.slug}
                className="suggestion"
                onClick={() => openDetail(item.slug)}
              >
                <strong>{item.name}</strong>
                <span>
                  {item.fieldCount} fields · {item.actionCount} actions
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="panel detail-panel">
        {loadingDetail ? <p className="empty-state">Loading property class...</p> : null}

        {!loadingDetail && !selected ? (
          <p className="empty-state">
            Chọn một property class từ danh sách hoặc từ suggestion bên dưới
            ô tìm kiếm để xem chi tiết.
          </p>
        ) : null}

        {selected ? (
          <div className="detail-content">
            <div className="detail-head">
              <div>
                <span className="eyebrow">Property Class</span>
                <h3>{selected.name}</h3>
              </div>
              <div className="detail-stats">
                <span>{selected.fields.length} fields</span>
                <span>{selected.actions.length} actions</span>
              </div>
            </div>

            <div className="detail-columns">
              <section className="detail-section">
                <h4>Các trường và ý nghĩa</h4>
                <div className="stack">
                  {selected.fields.map((field) => (
                    <article className="detail-card" key={field.name}>
                      <strong>{field.name}</strong>
                      <p>{field.meaning}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="detail-section">
                <h4>Các action và logic chi tiết</h4>
                <div className="stack">
                  {selected.actions.map((action) => (
                    <article className="detail-card" key={action.name}>
                      <strong>{action.name}</strong>
                      <p>
                        <b>Ý nghĩa:</b> {action.summary}
                      </p>
                      <p>
                        <b>Các bước:</b> {action.steps}
                      </p>
                      <p>
                        <b>Luồng xử lý:</b> {action.flow}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
