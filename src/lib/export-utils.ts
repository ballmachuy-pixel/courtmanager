import * as XLSX from 'xlsx';

/**
 * Utility to export JSON data to an Excel file (.xlsx)
 * @param data Array of objects representing rows
 * @param fileName Name of the file to be saved
 * @param sheetName Name of the sheet within the workbook
 */
export function exportToExcel(data: Record<string, unknown>[], fileName: string, sheetName: string = 'Sheet1') {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Calculate some basic widths
  const keys = Object.keys(data[0]);
  const wscols = keys.map(key => ({
    wch: Math.max(key.length, ...data.map(row => (row[key] ? row[key].toString().length : 0))) + 5
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Set column widths
  worksheet['!cols'] = wscols;

  // Create workbook and append sheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate binary Excel file and trigger download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
