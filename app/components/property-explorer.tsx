"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

export function PropertyExplorer({
  initialSummary
}: {
  initialSummary: PropertySummary;
}) {
  const router = useRouter();
  const [summary, setSummary] = useState(initialSummary);
  const [query, setQuery] = useState("");
  const [showList, setShowList] = useState(false);
  const [suggestions, setSuggestions] = useState<PropertyListItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);

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

  function openDetail(slug: string) {
    setShowList(false);
    router.push(`/property-classes/${slug}`);
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

      <div className="panel detail-placeholder">
        <p className="empty-state">
          Chọn một property class từ danh sách hoặc suggestion để mở trang chi
          tiết riêng.
        </p>
      </div>
    </div>
  );
}
