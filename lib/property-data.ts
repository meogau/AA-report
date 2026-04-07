import propertyData from "@/data/property-data.json";
import { manualCoreOverrides } from "@/lib/manual-core-overrides";
import { manualNextOverrides } from "@/lib/manual-next-overrides";
import { manualFourthOverrides } from "@/lib/manual-fourth-overrides";
import { manualThirdOverrides } from "@/lib/manual-third-overrides";

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
const manualOverrides = {
  ...manualCoreOverrides,
  ...manualNextOverrides,
  ...manualThirdOverrides,
  ...manualFourthOverrides
};
const items = payload.items.map((item) => manualOverrides[item.slug] ?? item);
const summary = {
  propertyClassCount: items.length,
  actionCount: new Set(items.flatMap((item) => item.actions.map((action) => action.name))).size,
  totalActionEntries: items.reduce((total, item) => total + item.actions.length, 0)
};

export function getPropertySummary() {
  return summary;
}

export function getPropertyClasses() {
  return items;
}

export function searchPropertyClasses(query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return items;
  }

  return items.filter((item) => {
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
  return items.find((item) => item.slug === slug) ?? null;
}
