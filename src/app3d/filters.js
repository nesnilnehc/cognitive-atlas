export function getModelSearchText(model) {
  return [model.name, model.aliasZh ?? "", model.aliasEn ?? ""].join(" ").toLowerCase();
}

export function toAxisSingleLine(text) {
  return String(text ?? "").split("\n")[0];
}

export function shortenModelName(name, limit = 14) {
  return name.length > limit ? `${name.slice(0, limit - 1)}…` : name;
}

export function sortCellKey(a, b) {
  const [ax, ay, az] = a.split("|").map(Number);
  const [bx, by, bz] = b.split("|").map(Number);
  if (ay !== by) return ay - by;
  if (az !== bz) return az - bz;
  return ax - bx;
}
