export const applyBionicReading = (text: string): string => {
  return text.replace(/(\S+)(\s*)/g, (match, word, space) => {
    const firstLetter = word.charAt(0);
    const rest = word.slice(1);
    if (rest.length === 0) return match;
    return `<strong>${firstLetter}</strong>${rest}${space}`;
  });
};
