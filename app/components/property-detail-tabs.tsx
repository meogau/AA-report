"use client";

import { useState } from "react";
import type { PropertyAction, PropertyClass, PropertyField } from "@/lib/property-data";

type TabKey = "fields" | "actions";

function FieldsTab({ fields }: { fields: PropertyField[] }) {
  return (
    <div className="stack">
      {fields.map((field) => (
        <article className="detail-card" key={field.name}>
          <strong>{field.name}</strong>
          <p>{field.meaning}</p>
        </article>
      ))}
    </div>
  );
}

function ActionsTab({ actions }: { actions: PropertyAction[] }) {
  return (
    <div className="stack">
      {actions.map((action) => (
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
  );
}

export function PropertyDetailTabs({ item }: { item: PropertyClass }) {
  const [tab, setTab] = useState<TabKey>("fields");

  return (
    <div className="detail-page-body">
      <div className="detail-tabs" role="tablist" aria-label="Property detail tabs">
        <button
          className={`detail-tab ${tab === "fields" ? "active" : ""}`}
          onClick={() => setTab("fields")}
          role="tab"
          aria-selected={tab === "fields"}
        >
          Các trường và ý nghĩa
        </button>
        <button
          className={`detail-tab ${tab === "actions" ? "active" : ""}`}
          onClick={() => setTab("actions")}
          role="tab"
          aria-selected={tab === "actions"}
        >
          Các action và logic chi tiết
        </button>
      </div>

      <section className="detail-tab-panel">
        {tab === "fields" ? <FieldsTab fields={item.fields} /> : null}
        {tab === "actions" ? <ActionsTab actions={item.actions} /> : null}
      </section>
    </div>
  );
}
