export const openUrl = (url: string) => {
  window.open(url, "_blank");
};

//return 2025-12-08,2025-12-14
export const weekRange = (date: Date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay() || 7;
  const mon = new Date(d);
  mon.setDate(d.getDate() - day + 1);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);

  const fmt = (t: Date) => t.toISOString().slice(0, 10);
  return [fmt(mon), fmt(sun)];
};
