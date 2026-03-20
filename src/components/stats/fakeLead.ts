interface LeadFields {
  name?: string;
  email?: string;
  phone?: string;
}

const TEST_NAMES = [
  "test", "teszt", "próba", "proba", "asd", "asdf", "xxx", "abc",
  "qwer", "qwerty", "fake", "hamis", "none", "na", "n/a", "nincs",
];

const TEMP_DOMAINS = [
  "mailinator.com", "yopmail.com", "guerrillamail.com", "tempmail.com",
  "throwaway.email", "sharklasers.com", "grr.la", "dispostable.com",
  "maildrop.cc", "10minutemail.com", "trashmail.com", "guerrillamail.net",
  "guerrillamail.org", "temp-mail.org", "fakeinbox.com", "mailnesia.com",
  "getnada.com", "emailondeck.com", "mohmal.com", "burnermail.io",
];

const TEST_LOCAL_PARTS = [
  "test", "teszt", "asdf", "fake", "xxx", "aaa", "abc", "qwerty",
];

const FAKE_PHONES = ["0612345678", "06301234567", "06201234567", "06701234567"];

const VOWELS = new Set("aáeéiíoóöőuúüű");
const CONSONANTS = new Set("bcdfghjklmnpqrstvwxyz");

function isRepeatingChars(s: string): boolean {
  if (s.length < 2) return false;
  return s.split("").every((c) => c === s[0]);
}

function isSequential(digits: string): boolean {
  if (digits.length < 6) return false;
  const asc = "0123456789";
  const desc = "9876543210";
  for (let i = 0; i <= digits.length - 6; i++) {
    const slice = digits.substring(i, i + 6);
    if (asc.includes(slice) || desc.includes(slice)) return true;
  }
  return false;
}

function hasOnlyVowels(s: string): boolean {
  const lower = s.toLowerCase().replace(/\s/g, "");
  return lower.length >= 3 && [...lower].every((c) => VOWELS.has(c));
}

function hasOnlyConsonants(s: string): boolean {
  const lower = s.toLowerCase().replace(/\s/g, "");
  return lower.length >= 3 && [...lower].every((c) => CONSONANTS.has(c));
}

function checkName(name: string | undefined): boolean {
  if (!name) return false;
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();

  if (trimmed.length < 3) return true;
  if (isRepeatingChars(lower.replace(/\s/g, ""))) return true;
  if (/\d/.test(trimmed)) return true;
  if (TEST_NAMES.includes(lower)) return true;
  if (!trimmed.includes(" ")) return true; // no space = missing first/last name
  if (hasOnlyVowels(lower) || hasOnlyConsonants(lower)) return true;

  // Check each word for repeating chars
  const words = lower.split(/\s+/);
  if (words.some((w) => w.length >= 2 && isRepeatingChars(w))) return true;

  return false;
}

function checkEmail(email: string | undefined, name?: string): boolean {
  if (!email) return false;
  const lower = email.trim().toLowerCase();
  const atIdx = lower.indexOf("@");
  if (atIdx < 0) return true;

  const local = lower.substring(0, atIdx);
  const domain = lower.substring(atIdx + 1);

  if (TEMP_DOMAINS.includes(domain)) return true;
  if (local.length < 3) return true;
  if (isRepeatingChars(local.replace(/[^a-z]/g, ""))) return true;
  if (TEST_LOCAL_PARTS.includes(local)) return true;

  // Name matches email local part
  if (name) {
    const nameLower = name.trim().toLowerCase().replace(/\s/g, "");
    if (nameLower.length >= 3 && local === nameLower) return true;
  }

  return false;
}

function checkPhone(phone: string | undefined): boolean {
  if (!phone) return false;
  const digits = phone.replace(/[^0-9]/g, "");

  if (/[a-zA-Z]/.test(phone)) return true;
  if (digits.length > 0 && digits.length < 7) return true;
  if (digits.length >= 7 && isRepeatingChars(digits)) return true;
  if (isSequential(digits)) return true;
  if (FAKE_PHONES.includes(digits)) return true;

  return false;
}

export function isFakeLead(lead: LeadFields): boolean {
  const nameFlag = checkName(lead.name);
  const emailFlag = checkEmail(lead.email, lead.name);
  const phoneFlag = checkPhone(lead.phone);

  // 2+ suspicious fields = definitely fake
  const suspiciousCount = [nameFlag, emailFlag, phoneFlag].filter(Boolean).length;
  if (suspiciousCount >= 2) return true;

  return false;
}
