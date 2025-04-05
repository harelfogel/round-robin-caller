import Papa, { ParseResult } from "papaparse";
import * as XLSX from "xlsx";

export interface Contact {
  name: string;
  phone: string;
}

export function parseCSV(file: File): Promise<Contact[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: false,
      complete: (result: ParseResult<any>) => {
        const rows = result.data as string[][];
        const contacts = rows
          .filter((r) => r.length >= 2)
          .map(([name, phone]) => ({ name, phone }));
        resolve(contacts);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export function parseExcel(file: File): Promise<Contact[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) {
        reject("No file data found.");
        return;
      }

      try {
        const workbook = XLSX.read(data, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
        }) as string[][];
        const contacts = rows
          .filter((r) => r.length >= 2)
          .map(([name, phone]) => ({ name, phone }));
        resolve(contacts);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}
