import type { ChangeEvent } from 'react';
import type { SavingThrowRow } from './characterSheetState';

export const SAVING_THROW_CHECK_FIELDS: Array<keyof SavingThrowRow> = [
  'check1',
  'check2',
  'check3',
  'check4',
];

export const parseSavingNumber = (value: string) => {
  const trimmed = value.trim();

  if (trimmed === '') {
    return null;
  }

  const parsed = Number(trimmed.replace(/[^0-9-]/g, ''));

  return Number.isFinite(parsed) ? parsed : null;
};

export const clampSavingD4 = (value: number) => Math.min(Math.max(1, value), 4);

export const updateSavingThrowRowValue = (
  row: SavingThrowRow,
  field: keyof SavingThrowRow,
  value: string | boolean,
): SavingThrowRow => {
  if (field === 'real' || field === 'd4') {
    if (typeof value !== 'string') {
      return row;
    }

    if (value === '' || /^\d+$/.test(value)) {
      return { ...row, [field]: value };
    }

    return row;
  }

  if (field.startsWith('check')) {
    return { ...row, [field]: Boolean(value) };
  }

  return { ...row, [field]: String(value) };
};

export const applySavingThrowCheck = (
  row: SavingThrowRow,
  field: keyof SavingThrowRow,
  checked: boolean,
): SavingThrowRow => {
  const updatedRow = { ...row, [field]: checked };
  const checkedCount = SAVING_THROW_CHECK_FIELDS.filter((checkField) => updatedRow[checkField]).length;
  const parsedD4 = parseSavingNumber(updatedRow.d4);

  if (parsedD4 === null) {
    return updatedRow;
  }

  const requiredChecks = clampSavingD4(parsedD4);

  if (checkedCount < requiredChecks) {
    return updatedRow;
  }

  const currentReal = parseSavingNumber(updatedRow.real);
  const nextReal = currentReal !== null ? Math.max(1, currentReal - 1) : null;

  return {
    ...updatedRow,
    real: nextReal !== null ? String(nextReal) : updatedRow.real,
    d4: requiredChecks > 1 ? String(requiredChecks - 1) : '',
    check1: false,
    check2: false,
    check3: false,
    check4: false,
  };
};

export const createSavingThrowHandlers = (
  updateRows: (updater: (rows: SavingThrowRow[]) => SavingThrowRow[]) => void,
) => {
  const updateSavingThrowRow = (rowIndex: number, field: keyof SavingThrowRow) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    updateRows((rows) => rows.map((row, index) => (
      index === rowIndex ? updateSavingThrowRowValue(row, field, value) : row
    )));
  };

  const updateSavingThrowCheck = (rowIndex: number, field: keyof SavingThrowRow) => (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;

    updateRows((rows) => rows.map((row, index) => (
      index === rowIndex ? applySavingThrowCheck(row, field, checked) : row
    )));
  };

  return { updateSavingThrowRow, updateSavingThrowCheck };
};
