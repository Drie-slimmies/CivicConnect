import { CATEGORIES, type Category, type PublicRequest, type RequestDetail } from "@/lib/dto";

export const REQUEST_FIELDS = ["title", "category", "location", "description"] as const;
export type RequestFields = Record<(typeof REQUEST_FIELDS)[number], string>;
export type RequestErrors = Partial<Record<keyof RequestFields | "form", string>>;

export const readFields = (get: (key: string) => unknown): RequestFields =>
  Object.fromEntries(
    REQUEST_FIELDS.map((key) => {
      const value = get(key);
      return [key, typeof value === "string" ? value.trim() : ""];
    }),
  ) as RequestFields;

export function validateRequest(f: RequestFields): RequestErrors {
  const e: RequestErrors = {};
  if (!f.title) e.title = 'Give your request a short title, for example "Pothole outside the school".';
  else if (f.title.length > 120) e.title = "Shorten the title to 120 characters or fewer.";
  if (!CATEGORIES.includes(f.category as Category)) e.category = "Choose a category so the right team sees your request.";
  if (!f.location) e.location = "Tell us where the problem is, for example a street name or landmark.";
  else if (f.location.length > 200) e.location = "Shorten the location to 200 characters or fewer.";
  if (f.description.length < 10) e.description = "Describe the problem in at least 10 characters so the team knows what to look for.";
  else if (f.description.length > 2000) e.description = "Shorten the description to 2000 characters or fewer.";
  return e;
}

export function toPublic(r: RequestDetail): PublicRequest {
  const { trackingId, category, status, createdAt, updatedAt, history } = r;
  return { trackingId, category, status, createdAt, updatedAt, history };
}
