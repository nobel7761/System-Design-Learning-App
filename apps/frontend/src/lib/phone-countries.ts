import countries from "world-countries";

/** Dial codes (no +). Matching uses longest prefix first. */
export type PhoneCountry = {
  iso: string;
  dial: string;
  name: string;
};

type WorldCountry = {
  cca2?: string;
  name?: { common?: string };
  idd?: { root?: string; suffixes?: string[] };
};

const WORLD_COUNTRIES = countries as WorldCountry[];

const generatedPhoneCountries = WORLD_COUNTRIES.flatMap((country) => {
  const iso = country.cca2?.toUpperCase();
  const name = country.name?.common?.trim();
  const root = country.idd?.root?.replace(/\D/g, "") ?? "";
  const suffixes = country.idd?.suffixes ?? [];

  if (!iso || !name || !root) {
    return [];
  }

  const normalizedSuffixes = suffixes.length > 0 ? suffixes : [""];

  return normalizedSuffixes
    .map((suffix) => suffix.replace(/\D/g, ""))
    .map((suffix) => ({
      iso,
      name,
      dial: `${root}${suffix}`,
    }));
});

// De-duplicate (same iso + dial pair) and keep stable output.
export const PHONE_COUNTRIES: PhoneCountry[] = Array.from(
  new Map(
    generatedPhoneCountries.map((country) => [
      `${country.iso}-${country.dial}`,
      country,
    ]),
  ).values(),
);

/** Longest dial code first — used to match +880 before +8 etc. */
export const PHONE_COUNTRIES_BY_DIAL_DESC: PhoneCountry[] = [
  ...PHONE_COUNTRIES,
].sort((a, b) => {
  if (b.dial.length !== a.dial.length) return b.dial.length - a.dial.length;
  return a.iso.localeCompare(b.iso);
});

export function flagEmoji(iso: string): string {
  const u = iso.trim().toUpperCase();
  if (u.length !== 2) return "🏳️";
  const A = 0x1f1e6;
  try {
    const pts = [...u].map((c) => A + (c.charCodeAt(0) - 65));
    return String.fromCodePoint(...pts);
  } catch {
    return "🏳️";
  }
}

export function findCountryByIso(iso: string): PhoneCountry | undefined {
  const u = iso.trim().toUpperCase();
  return PHONE_COUNTRIES.find((c) => c.iso === u);
}

export const PHONE_COUNTRIES_SORTED_AZ: PhoneCountry[] = [
  ...PHONE_COUNTRIES,
].sort((a, b) => a.name.localeCompare(b.name));

/**
 * All digits after `+`. Match longest dial prefix.
 */
export function matchDialFromDigits(allDigitsAfterPlus: string): {
  country: PhoneCountry;
  nationalDigits: string;
} | null {
  for (const c of PHONE_COUNTRIES_BY_DIAL_DESC) {
    if (allDigitsAfterPlus.startsWith(c.dial)) {
      return {
        country: c,
        nationalDigits: allDigitsAfterPlus.slice(c.dial.length),
      };
    }
  }
  return null;
}

/** Parse stored value like +8801712345678 */
export function parseInternationalNumber(raw: string): {
  country: PhoneCountry | null;
  nationalDigits: string;
  e164: string;
} {
  const t = raw.trim().replace(/\s+/g, " ");
  if (!t) {
    return { country: null, nationalDigits: "", e164: "" };
  }
  let s = t;
  if (!s.startsWith("+")) {
    const d = s.replace(/\D/g, "");
    s = d ? `+${d}` : "";
  }
  if (!s.startsWith("+")) {
    return { country: null, nationalDigits: s.replace(/\D/g, ""), e164: s };
  }
  const digitsOnly = s.slice(1).replace(/\D/g, "");
  if (!digitsOnly) {
    return { country: null, nationalDigits: "", e164: "+" };
  }
  const hit = matchDialFromDigits(digitsOnly);
  if (!hit) {
    return {
      country: null,
      nationalDigits: digitsOnly,
      e164: `+${digitsOnly}`,
    };
  }
  return {
    country: hit.country,
    nationalDigits: hit.nationalDigits,
    e164: `+${digitsOnly}`,
  };
}

export function buildE164(iso: string, nationalDigits: string): string {
  const c = findCountryByIso(iso);
  if (!c) return "";
  const n = nationalDigits.replace(/\D/g, "");
  if (!n && !c.dial) return "";
  return `+${c.dial}${n}`;
}
