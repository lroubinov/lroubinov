export function resolveText(text: string, myGender: 'M' | 'F', partnerGender: 'M' | 'F'): string {
  return text
    .replace(/\{m:([^|]*)\|f:([^}]*)\}/g, (_, m, f) => myGender === 'M' ? m : f)
    .replace(/\{pm:([^|]*)\|pf:([^}]*)\}/g, (_, m, f) => partnerGender === 'M' ? m : f);
}
