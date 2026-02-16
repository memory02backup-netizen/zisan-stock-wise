/**
 * Bengali to English (Roman) transliteration utility.
 * Converts Bengali script text to romanized English for PDF reports.
 */

const vowelMap: Record<string, string> = {
  "অ": "o", "আ": "a", "ই": "i", "ঈ": "ee", "উ": "u", "ঊ": "oo",
  "ঋ": "ri", "এ": "e", "ঐ": "oi", "ও": "o", "ঔ": "ou",
};

const consonantMap: Record<string, string> = {
  "ক": "k", "খ": "kh", "গ": "g", "ঘ": "gh", "ঙ": "ng",
  "চ": "ch", "ছ": "chh", "জ": "j", "ঝ": "jh", "ঞ": "n",
  "ট": "t", "ঠ": "th", "ড": "d", "ঢ": "dh", "ণ": "n",
  "ত": "t", "থ": "th", "দ": "d", "ধ": "dh", "ন": "n",
  "প": "p", "ফ": "ph", "ব": "b", "ভ": "bh", "ম": "m",
  "য": "j", "র": "r", "ল": "l", "শ": "sh", "ষ": "sh",
  "স": "s", "হ": "h", "ড়": "r", "ঢ়": "rh", "য়": "y",
  "ৎ": "t", "ং": "ng", "ঃ": "h", "ঁ": "n",
};

const matraMap: Record<string, string> = {
  "া": "a", "ি": "i", "ী": "ee", "ু": "u", "ূ": "oo",
  "ৃ": "ri", "ে": "e", "ৈ": "oi", "ো": "o", "ৌ": "ou",
  "্": "", // hasanta - kills inherent vowel
};

const digitMap: Record<string, string> = {
  "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
  "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
};

// Common conjuncts (যুক্তাক্ষর)
const conjunctMap: Record<string, string> = {
  "ক্ক": "kk", "ক্ত": "kt", "ক্র": "kr", "ক্ষ": "kkh", "ক্স": "ks",
  "গ্গ": "gg", "গ্ধ": "gdh", "গ্ন": "gn", "গ্র": "gr",
  "ঙ্ক": "nk", "ঙ্গ": "ngg",
  "চ্চ": "chch", "চ্ছ": "chchh",
  "জ্জ": "jj", "জ্ঞ": "ggy",
  "ট্ট": "tt", "ণ্ড": "nd", "ণ্ট": "nt",
  "ত্ত": "tt", "ত্র": "tr", "ত্ন": "tn",
  "দ্দ": "dd", "দ্ধ": "ddh", "দ্ব": "dw", "দ্র": "dr",
  "ন্ত": "nt", "ন্দ": "nd", "ন্ধ": "ndh", "ন্ন": "nn", "ন্ম": "nm", "ন্র": "nr",
  "প্প": "pp", "প্র": "pr", "প্ত": "pt",
  "ব্ব": "bb", "ব্র": "br", "ব্দ": "bd", "ব্ল": "bl",
  "ম্প": "mp", "ম্ব": "mb", "ম্ম": "mm", "ম্র": "mr",
  "ল্ল": "ll", "ল্প": "lp",
  "শ্র": "shr", "শ্ব": "shw",
  "ষ্ট": "sht", "ষ্ণ": "shn", "ষ্প": "shp",
  "স্ক": "sk", "স্ত": "st", "স্থ": "sth", "স্ন": "sn", "স্প": "sp", "স্র": "sr", "স্ব": "sw",
  "হ্ন": "hn", "হ্র": "hr", "হ্ম": "hm",
  "র্": "r", // reph
};

export function transliterateBengali(text: string): string {
  if (!text) return "";
  
  // Check if text contains any Bengali characters
  if (!/[\u0980-\u09FF]/.test(text)) return text;

  let result = "";
  let i = 0;
  const chars = [...text]; // handle surrogate pairs properly
  
  while (i < chars.length) {
    const ch = chars[i];
    const next = chars[i + 1] || "";
    const next2 = chars[i + 2] || "";
    
    // Bengali digit
    if (digitMap[ch]) {
      result += digitMap[ch];
      i++;
      continue;
    }

    // Try 3-char conjunct (consonant + hasanta + consonant)
    if (consonantMap[ch] && next === "্" && consonantMap[next2]) {
      const conjunct = ch + next + next2;
      if (conjunctMap[conjunct]) {
        result += conjunctMap[conjunct];
        i += 3;
        // Check for matra after conjunct
        if (i < chars.length && matraMap[chars[i]] !== undefined) {
          result += matraMap[chars[i]];
          i++;
        } else if (i < chars.length && consonantMap[chars[i]]) {
          // no matra, inherent 'o' only if next is not hasanta
          result += "o";
        }
        continue;
      }
    }

    // Vowel (standalone)
    if (vowelMap[ch]) {
      result += vowelMap[ch];
      i++;
      continue;
    }

    // Consonant
    if (consonantMap[ch]) {
      result += consonantMap[ch];
      i++;
      // Check for hasanta (virama)
      if (i < chars.length && chars[i] === "্") {
        // hasanta - skip inherent vowel, handled by next iteration
        i++; // skip hasanta
        continue;
      }
      // Check for matra
      if (i < chars.length && matraMap[chars[i]] !== undefined) {
        result += matraMap[chars[i]];
        i++;
      } else {
        // Add inherent vowel 'o' if not at end and next char is Bengali
        if (i < chars.length && /[\u0980-\u09FF]/.test(chars[i])) {
          result += "o";
        } else if (i < chars.length && chars[i] === " ") {
          result += "o";
        }
      }
      continue;
    }

    // Matra without consonant (shouldn't happen but handle gracefully)
    if (matraMap[ch] !== undefined) {
      result += matraMap[ch];
      i++;
      continue;
    }

    // Pass through non-Bengali characters (space, punctuation, English, etc.)
    result += ch;
    i++;
  }

  // Capitalize first letter of each word
  return result.replace(/\b\w/g, (c) => c.toUpperCase());
}
