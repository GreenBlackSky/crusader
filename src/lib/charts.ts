/* The Progress charts, as SVG markup (inserted with {@html}). Sizes are in
   viewBox units; the SVG scales to the card's width. */

const esc = (text: string): string =>
  text.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

export interface ChartPoint {
  x: number;
  y: number;
  /** label under the first and last point */
  l?: string;
}

export interface LineOptions {
  /** never go below zero */
  zero?: boolean;
  label?: string;
  fmt?: (value: number) => string | number;
}

/** A line with dots, three gridlines and the first and last date. */
export function lineChart(points: ChartPoint[], options: LineOptions = {}): string {
  if (points.length < 1) {
    return '<p class="empty small">Not enough data yet.</p>';
  }
  const W = 320;
  const H = 130;
  const left = 30;
  const right = 10;
  const top = 12;
  const bottom = 20;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  let y0 = Math.min(...ys);
  let y1 = Math.max(...ys);
  if (y0 === y1) {
    y0 -= 1;
    y1 += 1;
  }
  const padY = (y1 - y0) * 0.15;
  y0 -= padY;
  y1 += padY;
  if (options.zero) {
    y0 = Math.max(0, y0);
  }
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs) === x0 ? x0 + 1 : Math.max(...xs);
  const X = (x: number): number => left + ((x - x0) / (x1 - x0)) * (W - left - right);
  const Y = (y: number): number => top + (1 - (y - y0) / (y1 - y0)) * (H - top - bottom);
  const path = points
    .map((p, i) => (i ? 'L' : 'M') + X(p.x).toFixed(1) + ' ' + Y(p.y).toFixed(1))
    .join('');
  const ticks = [y0 + padY, (y0 + y1) / 2, y1 - padY]
    .map(
      (v) =>
        `<text x="${left - 5}" y="${Y(v) + 3}" class="tk" text-anchor="end">${options.fmt ? options.fmt(v) : Math.round(v * 10) / 10}</text><line x1="${left}" x2="${W - right}" y1="${Y(v)}" y2="${Y(v)}" class="gl"/>`,
    )
    .join('');
  const dots = points
    .map((p) => `<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="3.2" class="pt"/>`)
    .join('');
  return (
    `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="${esc(options.label || 'Chart')}">` +
    `${ticks}<path d="${path}" class="ln"/>${dots}` +
    `<text x="${left}" y="${H - 4}" class="tk">${points[0].l || ''}</text>` +
    `<text x="${W - right}" y="${H - 4}" class="tk" text-anchor="end">${points[points.length - 1].l || ''}</text></svg>`
  );
}

/** Bars with their values; the last bar (this week) is highlighted. */
export function barChart(values: number[], labels: string[], label = 'Bar chart'): string {
  const W = 320;
  const H = 120;
  const left = 8;
  const bottom = 20;
  const n = values.length;
  const max = Math.max(10, ...values);
  const bw = (W - left * 2) / n;
  const bars = values
    .map((v, i) => {
      const h = ((H - bottom - 14) * v) / max;
      const x = left + i * bw + bw * 0.18;
      const value = v
        ? `<text x="${x + bw * 0.32}" y="${H - bottom - h - 3}" class="tk" text-anchor="middle">${v}</text>`
        : '';
      return (
        `<rect x="${x}" y="${H - bottom - h}" width="${bw * 0.64}" height="${Math.max(h, v ? 2 : 0)}" rx="3" class="bar ${i === n - 1 ? 'cur' : ''}"/>` +
        `<text x="${x + bw * 0.32}" y="${H - 6}" class="tk" text-anchor="middle">${labels[i]}</text>${value}`
      );
    })
    .join('');
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="${esc(label)}">${bars}</svg>`;
}
