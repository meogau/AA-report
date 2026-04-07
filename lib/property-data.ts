import propertyData from "@/data/property-data.json";
import { manualCoreOverrides } from "@/lib/manual-core-overrides";
import { manualFifthOverrides } from "@/lib/manual-fifth-overrides";
import { manualNextOverrides } from "@/lib/manual-next-overrides";
import { manualFourthOverrides } from "@/lib/manual-fourth-overrides";
import { manualSeventhOverrides } from "@/lib/manual-seventh-overrides";
import { manualSixthOverrides } from "@/lib/manual-sixth-overrides";
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
  ...manualFourthOverrides,
  ...manualFifthOverrides,
  ...manualSixthOverrides,
  ...manualSeventhOverrides
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

  const ranked = items
    .map((item) => {
      const normalizedName = item.name.toLowerCase();
      const normalizedSlug = item.slug.toLowerCase();
      const fieldHaystack = item.fields.map((field) => field.name).join(" ").toLowerCase();
      const actionHaystack = item.actions.map((action) => action.name).join(" ").toLowerCase();

      let rank = -1;

      if (normalizedName === normalized) {
        rank = 0;
      } else if (normalizedName.startsWith(normalized)) {
        rank = 1;
      } else if (normalizedSlug.startsWith(normalized)) {
        rank = 2;
      } else if (normalizedName.includes(normalized)) {
        rank = 3;
      } else if (fieldHaystack.includes(normalized)) {
        rank = 4;
      } else if (actionHaystack.includes(normalized)) {
        rank = 5;
      }

      return { item, rank };
    })
    .filter((entry) => entry.rank >= 0)
    .sort((left, right) => {
      if (left.rank !== right.rank) {
        return left.rank - right.rank;
      }

      return left.item.name.localeCompare(right.item.name);
    });

  return ranked.map((entry) => entry.item);
}

export function getPropertyClassBySlug(slug: string) {
  return items.find((item) => item.slug === slug) ?? null;
}
