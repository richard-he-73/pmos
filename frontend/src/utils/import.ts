interface ImportResult {
  success: boolean;
  data?: unknown[];
  errors?: string[];
  totalRows?: number;
  importedRows?: number;
}

interface ColumnMapping {
  key: string;
  label: string;
  required?: boolean;
}

const CSV_DELIMITERS = [',', ';', '\t', '|'];

export const detectDelimiter = (content: string): string => {
  let maxCount = 0;
  let bestDelimiter = ',';

  for (const delimiter of CSV_DELIMITERS) {
    const count = (content.match(new RegExp(delimiter, 'g')) || []).length;
    if (count > maxCount) {
      maxCount = count;
      bestDelimiter = delimiter;
    }
  }

  return bestDelimiter;
};

export const parseCSV = (content: string, delimiter?: string): string[][] => {
  const usedDelimiter = delimiter || detectDelimiter(content);
  const lines = content.split('\n').filter(line => line.trim());
  const result: string[][] = [];

  for (const line of lines) {
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentValue += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === usedDelimiter && !inQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }

    values.push(currentValue);
    result.push(values);
  }

  return result;
};

export const parseExcel = async (file: File): Promise<string[][]> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const data = e.target?.result as string;
      const lines = data.split('\n').filter(line => line.trim());
      const result = lines.map(line => line.split('\t'));
      resolve(result);
    };

    reader.onerror = () => {
      resolve([]);
    };

    reader.readAsText(file);
  });
};

export const validateData = (
  data: string[][],
  columns: ColumnMapping[],
  startRow: number = 1
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  for (let i = startRow; i < data.length; i++) {
    const row = data[i];
    const rowNumber = i + 1;

    for (const col of columns) {
      const index = columns.findIndex(c => c.key === col.key);
      const value = row[index]?.trim();

      if (col.required && !value) {
        errors.push(`第 ${rowNumber} 行：${col.label} 为必填项`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const transformData = (
  data: string[][],
  mapping: Record<string, string>,
  startRow: number = 1
): unknown[] => {
  const headers = data[0];
  const result: unknown[] = [];

  for (let i = startRow; i < data.length; i++) {
    const row = data[i];
    const item: Record<string, unknown> = {};

    for (const [key, header] of Object.entries(mapping)) {
      const index = headers.indexOf(header);
      if (index !== -1) {
        const value = row[index]?.trim();
        
        if (!isNaN(Number(value))) {
          item[key] = Number(value);
        } else if (value === 'true' || value === 'false') {
          item[key] = value === 'true';
        } else if (value && !isNaN(Date.parse(value))) {
          item[key] = new Date(value).toISOString();
        } else {
          item[key] = value || null;
        }
      }
    }

    result.push(item);
  }

  return result;
};

export const importFile = async (
  file: File,
  columns: ColumnMapping[],
  mapping: Record<string, string>
): Promise<ImportResult> => {
  try {
    const ext = file.name.split('.').pop()?.toLowerCase();
    let data: string[][];

    if (ext === 'csv') {
      const content = await file.text();
      data = parseCSV(content);
    } else if (ext === 'txt' || ext === 'tsv') {
      const content = await file.text();
      data = parseCSV(content, '\t');
    } else {
      data = await parseExcel(file);
    }

    if (data.length < 2) {
      return {
        success: false,
        errors: ['文件内容为空或格式不正确'],
      };
    }

    const validation = validateData(data, columns);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    const transformed = transformData(data, mapping);

    return {
      success: true,
      data: transformed,
      totalRows: data.length - 1,
      importedRows: transformed.length,
    };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : '导入失败'],
    };
  }
};

export const generateTemplate = (columns: ColumnMapping[]): string => {
  const headers = columns.map(col => col.label);
  return headers.join(',');
};

export type { ImportResult, ColumnMapping };