export function formatDZD(amount: number): string {
  return `${Math.round(amount).toLocaleString('fr-DZ')} دج`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-DZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
