// UTF-8 BOM so Excel (especially on Windows) renders non-ASCII characters correctly.
export const CSV_BOM = '﻿';

const escapeCSVField = (value: unknown): string => {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const buildCSV = (headers: string[], rows: unknown[][]): string => {
  const lines = [headers, ...rows].map(row => row.map(escapeCSVField).join(','));
  return CSV_BOM + lines.join('\r\n');
};
