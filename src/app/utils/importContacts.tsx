import Papa, { ParseResult } from "papaparse";
import * as XLSX from "xlsx";

export interface Contact {
  name: string;
  phone: string;
}

export function parseCSV(
  file: File
): Promise<{ name: string; phone: string }[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: false,
      complete: (result: ParseResult<string[]>) => {
        const rows = result.data;
        const contacts = rows
          .filter((r) => r.length >= 2)
          .map(([name, phone]) => ({ name, phone }));
        resolve(contacts);
      },
      error: reject,
    });
  });
}

export function parseExcel(
  file: File
): Promise<{ name: string; phone: string }[]> {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return reject("No data found in Excel file.");

      const workbook = XLSX.read(data, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
      const contacts = rows
        .filter((r) => r.length >= 2)
        .map(([name, phone]) => ({ name, phone }));
      resolve(contacts);
    };

    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}
