/**
 * Numerological Cycles (Hans Decoz Method)
 * Personal Year, Month, Day, and Pinnacles/Challenges.
 */

import { reduceToSingleOrMaster, reduceToSingle } from './pythagoras';

export function calculatePersonalYear(dobString: string, targetYear: number = new Date().getFullYear()): number {
  const date = new Date(dobString);
  if (isNaN(date.getTime())) return 0;

  const bMonth = reduceToSingleOrMaster(date.getMonth() + 1);
  const bDay = reduceToSingleOrMaster(date.getDate());
  const cYear = reduceToSingleOrMaster(targetYear);

  return reduceToSingleOrMaster(bMonth + bDay + cYear);
}

export function calculatePersonalMonth(personalYear: number, targetMonth: number = (new Date().getMonth() + 1)): number {
  // targetMonth is 1-12. Usually, personal month is Personal Year + current calendar month.
  // Master numbers might need special handling based on deep Decoz charts, but general rule is reduce.
  return reduceToSingleOrMaster(personalYear + targetMonth);
}

export function calculatePersonalDay(personalMonth: number, targetDate: number = new Date().getDate()): number {
  return reduceToSingleOrMaster(personalMonth + targetDate);
}

export function getDailyNumerology(dobString: string, targetDateObj: Date = new Date()) {
  const personalYear = calculatePersonalYear(dobString, targetDateObj.getFullYear());
  const personalMonth = calculatePersonalMonth(personalYear, targetDateObj.getMonth() + 1);
  const personalDay = calculatePersonalDay(personalMonth, targetDateObj.getDate());
  
  // Universal numbers
  const universalYear = reduceToSingle(targetDateObj.getFullYear());
  const universalMonth = reduceToSingle(universalYear + targetDateObj.getMonth() + 1);
  const universalDay = reduceToSingle(universalMonth + targetDateObj.getDate());

  return {
    personal: {
      year: personalYear,
      month: personalMonth,
      day: personalDay
    },
    universal: {
      year: universalYear,
      month: universalMonth,
      day: universalDay
    }
  };
}
