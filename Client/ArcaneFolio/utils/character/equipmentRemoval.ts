import type { CharacterSheetState } from './characterSheetState';
import { withCalculatedRealArmorClass } from './armorClass';
import { applyWeaponSelectionToRow, getWeaponRowContext } from './weapons';

export const removeLineFromBucket = (bucketValue: string, rowIndex: number) => {
  const lines = (bucketValue ?? '').split('\n');
  const removedLine = (lines[rowIndex] ?? '').trim();

  lines.splice(rowIndex, 1);

  return {
    removedLine,
    nextValue: lines.join('\n'),
  };
};

export const syncSheetAfterEquipmentRemoval = (
  sheet: CharacterSheetState,
  removedLine: string,
  bucketField: string,
  characterClass: string,
): CharacterSheetState => {
  if (!removedLine) {
    return sheet;
  }

  if (bucketField === 'Weapons') {
    const context = getWeaponRowContext(sheet, characterClass);

    return {
      ...sheet,
      weaponRows: sheet.weaponRows.map((row) => (
        row.weapon === removedLine ? applyWeaponSelectionToRow(row, '', context) : row
      )),
      weaponProficiencies: sheet.weaponProficiencies.map((row) => (
        row.name === removedLine ? { ...row, name: '', slots: '' } : row
      )),
    };
  }

  if (bucketField === 'Armor') {
    const armorDetails = { ...sheet.armorDetails };

    if (armorDetails['Armor Type'] === removedLine) {
      armorDetails['Armor Type'] = '';
    }

    if (armorDetails.Helm === removedLine) {
      armorDetails.Helm = '';
    }

    if (armorDetails.Shield === removedLine) {
      armorDetails.Shield = '';
    }

    return {
      ...sheet,
      armorDetails: withCalculatedRealArmorClass(armorDetails),
    };
  }

  return sheet;
};
