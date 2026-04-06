import propertyData from "@/data/property-data.json";

export type PropertyField = {
  name: string;
  slot: number;
  details: string[];
};

export type PropertyAction = {
  name: string;
  routine: string;
  summary: string;
  steps: string[];
  flow: string[];
};

export type PropertyClass = {
  name: string;
  slug: string;
  fields: PropertyField[];
  actions: PropertyAction[];
};

type PropertyPayload = {
  summary: {
    propertyClassCount: number;
    actionCount: number;
    totalActionEntries: number;
  };
  items: PropertyClass[];
};

const payload = propertyData as PropertyPayload;

export function getPropertySummary() {
  return payload.summary;
}

export function getPropertyClasses() {
  return payload.items;
}

export function searchPropertyClasses(query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return payload.items;
  }

  return payload.items.filter((item) => {
    const haystack = [
      item.name,
      item.fields.map((field) => field.name).join(" "),
      item.actions.map((action) => action.name).join(" ")
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export function getPropertyClassBySlug(slug: string) {
  return payload.items.find((item) => item.slug === slug) ?? null;
}
