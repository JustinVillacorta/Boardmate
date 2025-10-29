import * as XLSX from 'xlsx';

export interface ExcelExportOptions {
  sheetNames?: string[];
  columnWidths?: number[];
  includeDateInFilename?: boolean; // default: true
  includeTimeInFilename?: boolean; // default: true
}

/**
 * Export data to Excel file
 * @param data - Array of data objects or array of arrays for multiple sheets
 * @param filename - Name of the file (without extension)
 * @param options - Additional options like sheet names and column widths
 */
export const exportToExcel = (
  data: any[] | any[][],
  filename: string,
  options?: ExcelExportOptions
) => {
  const workbook = XLSX.utils.book_new();
  
  // If data is array of arrays (multiple sheets), handle each sheet
  if (Array.isArray(data[0]) && data.length > 0 && Array.isArray(data[0][0])) {
    const sheets = data as any[][][];
    const sheetNames = options?.sheetNames || sheets.map((_, i) => `Sheet${i + 1}`);
    
    sheets.forEach((sheetData, index) => {
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
      
      // Set column widths if provided
      if (options?.columnWidths && options.columnWidths.length > 0) {
        const columnWidths = options.columnWidths.map(width => ({ wch: width }));
        worksheet['!cols'] = columnWidths;
      } else {
        // Auto-calculate column widths based on content
        const maxWidth = sheetData.reduce((acc, row) => {
          row.forEach((cell: any, colIndex: number) => {
            const cellLength = cell ? String(cell).length : 0;
            acc[colIndex] = Math.max(acc[colIndex] || 0, cellLength);
          });
          return acc;
        }, [] as number[]);
        
        worksheet['!cols'] = maxWidth.map((width, index) => ({
          wch: Math.min(Math.max(width || 10, 10), 50) // Min 10, Max 50
        }));
      }
      
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetNames[index] || `Sheet${index + 1}`);
    });
  } else {
    // Single sheet
    const worksheet = XLSX.utils.json_to_sheet(data as any[]);
    
    // Set column widths if provided
    if (options?.columnWidths && options.columnWidths.length > 0) {
      const columnWidths = options.columnWidths.map(width => ({ wch: width }));
      worksheet['!cols'] = columnWidths;
    } else {
      // Auto-calculate column widths
      const jsonData = data as any[];
      const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
      const maxWidth = headers.reduce((acc, header, colIndex) => {
        const headerLength = header.length;
        let maxContentLength = headerLength;
        
        jsonData.forEach(row => {
          const cellContent = row[header];
          const cellLength = cellContent ? String(cellContent).length : 0;
          maxContentLength = Math.max(maxContentLength, cellLength);
        });
        
        acc[colIndex] = Math.min(Math.max(maxContentLength, 10), 50);
        return acc;
      }, [] as number[]);
      
      worksheet['!cols'] = maxWidth.map(width => ({ wch: width }));
    }
    
    XLSX.utils.book_append_sheet(workbook, worksheet, options?.sheetNames?.[0] || 'Sheet1');
  }
  
  // Build filename with extraction date/time by default
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const datePart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timePart = `${pad(now.getHours())}-${pad(now.getMinutes())}`;
  const withDate = options?.includeDateInFilename === false ? filename : `${filename}_${datePart}${options?.includeTimeInFilename === false ? '' : `_${timePart}`}`;

  XLSX.writeFile(workbook, `${withDate}.xlsx`);
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number | string | undefined): string => {
  if (amount === undefined || amount === null) return '-';
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]/g, '')) : amount;
  return `₱${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Format date for Excel
 */
export const formatDate = (date: string | Date | undefined | null): string => {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

/**
 * Format status for display
 */
export const formatStatus = (status: string | undefined): string => {
  if (!status) return '-';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

