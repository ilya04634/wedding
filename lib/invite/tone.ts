function matchCase(source: string, replacement: string) {
  if (source === source.toUpperCase()) return replacement.toUpperCase();
  if (source[0] === source[0].toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

function replaceRussianWord(text: string, word: string, replacement: string) {
  return text.replace(
    new RegExp(`(^|[^\\p{L}])(${word})(?=$|[^\\p{L}])`, "giu"),
    (_match, prefix: string, source: string) =>
      `${prefix}${matchCase(source, replacement)}`,
  );
}

export function applyInformalTone(text: string, informalTone: boolean) {
  if (!informalTone) return text;

  return [
    ["вас", "тебя"],
    ["вам", "тебе"],
    ["вами", "тобой"],
    ["вы", "ты"],
  ].reduce(
    (result, [word, replacement]) =>
      replaceRussianWord(result, word, replacement),
    text,
  );
}
