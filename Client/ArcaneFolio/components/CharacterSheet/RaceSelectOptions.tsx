import React from 'react';
import { ALL_RACE_OPTIONS, isRaceAllowedForClass } from '../../utils/character/classRules';

type RaceSelectOptionsProps = {
  characterClass: string;
};

export default function RaceSelectOptions({ characterClass }: RaceSelectOptionsProps) {
  return (
    <>
      {ALL_RACE_OPTIONS.map((race) => (
        <option key={race} value={race} disabled={!isRaceAllowedForClass(characterClass, race)}>
          {race}
        </option>
      ))}
    </>
  );
}
