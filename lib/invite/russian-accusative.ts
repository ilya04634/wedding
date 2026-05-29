const WORD_EXCEPTIONS: Record<string, string> = {
  лев: "льва",
  любовь: "любовь",
  павел: "павла",
  петр: "петра",
  пётр: "петра",
};

const UNCHANGED_WORDS = new Set([
  "и",
  "й",
  "с",
  "со",
  "для",
  "the",
  "and",
]);

function preserveCapitalization(source: string, value: string) {
  if (source.toUpperCase() === source) return value.toUpperCase();
  if (source[0]?.toUpperCase() === source[0]) {
    return value[0].toUpperCase() + value.slice(1);
  }

  return value;
}

function declineWordToAccusative(word: string) {
  const lower = word.toLowerCase();
  if (UNCHANGED_WORDS.has(lower)) return word;

  const exception = WORD_EXCEPTIONS[lower];
  if (exception) return preserveCapitalization(word, exception);
  if (lower.endsWith("ых") || lower.endsWith("их")) return word;

  let declined = lower;

  if (lower === "семья") {
    declined = "семью";
  } else if (/[бвгджзклмнпрстфхцчшщ]$/.test(lower)) {
    declined = `${lower}а`;
  } else if (lower.endsWith("ий")) {
    declined = `${lower.slice(0, -2)}ия`;
  } else if (lower.endsWith("й") || lower.endsWith("ь")) {
    declined = `${lower.slice(0, -1)}я`;
  } else if (lower.endsWith("ия")) {
    declined = `${lower.slice(0, -1)}ю`;
  } else if (lower.endsWith("я")) {
    declined = `${lower.slice(0, -1)}ю`;
  } else if (lower.endsWith("а")) {
    declined = `${lower.slice(0, -1)}у`;
  }

  return preserveCapitalization(word, declined);
}

function declineHyphenatedWord(word: string) {
  return word
    .split("-")
    .map((part) => declineWordToAccusative(part))
    .join("-");
}

export function toAccusativeInviteName(name: string) {
  return name.replace(/[А-Яа-яЁё]+(?:-[А-Яа-яЁё]+)*/g, (word) =>
    declineHyphenatedWord(word),
  );
}
