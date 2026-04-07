"use client";

import { useState } from "react";
import type { PropertyAction, PropertyClass, PropertyField } from "@/lib/property-data";

type TabKey = "fields" | "actions";

function FieldsTab({ fields }: { fields: PropertyField[] }) {
  return (
    <div className="field-table-wrap">
      <div className="field-table">
        <div className="field-table-head">
          <div>Tên trường</div>
          <div>Ý nghĩa</div>
        </div>
        {fields.map((field) => (
          <article className="field-row" key={field.name}>
            <div className="field-name">{field.name}</div>
            <div className="field-meaning">
              {field.details.map((detail, index) => (
                <p key={`${field.name}-${index}`}>{detail}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ActionsTab({ actions }: { actions: PropertyAction[] }) {
  return (
    <div className="stack">
      {actions.map((action) => (
        <article className="detail-card" key={action.name}>
          <strong>{action.name}</strong>
          {action.routine ? (
            <p>
              <b>Routine nguồn:</b> {action.routine}
            </p>
          ) : null}
          <p>
            <b>Ý nghĩa:</b> {action.summary}
          </p>
          <div className="detail-subsection">
            <b>Các bước thực hiện:</b>
            <ol className="number-list">
              {action.steps.map((step, index) => (
                <li key={`${action.name}-step-${index}`}>{step}</li>
              ))}
            </ol>
          </div>
          <div className="detail-subsection">
            <b>Luồng xử lý nổi bật:</b>
            <ul className="plain-list">
              {action.flow.map((step, index) => (
                <li key={`${action.name}-flow-${index}`}>{step}</li>
              ))}
            </ul>
          </div>
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
