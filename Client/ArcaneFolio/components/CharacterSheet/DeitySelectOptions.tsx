import React from 'react';
import { DEITY_GROUPS, getDeityOptionLabel } from '../../utils/character/deities';

export default function DeitySelectOptions() {
  return (
    <>
      {DEITY_GROUPS.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {group.deities.map((deity) => (
            <option key={deity.name} value={deity.name}>
              {getDeityOptionLabel(deity)}
            </option>
          ))}
        </optgroup>
      ))}
    </>
  );
}
