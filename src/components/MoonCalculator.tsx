import * as React from 'react';
import styles from './MoonCalculator.module.css';
import moment from "moment";

export const MoonCalculator = () => {
  const inputId = React.useId();
  const [sign, setSign] = React.useState<string>('');
  const [day, setDay] = React.useState<string>('');

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSign(calculateSign(event.target.value));
    setDay(calculatePhase(event.target.value));
  }, []);

  return (
    <div className={styles.wrapper}>
      <label className={styles.label} htmlFor={inputId}>Enter date (GMT)</label>
      <input className={styles.input} id={inputId} type="datetime-local" onChange={handleChange}/>
      {sign && <div>Moon Sign is {sign}</div>}
      {day && <div>Moon Day is {day}</div>}
    </div>
  );
};

function calculateSign(dateString: string): string {
  // Step 1. Convert your date and time to the Greenwich Mean Time (GMT)
  const date = moment(dateString, 'YYYY-MM-DDTHH:mm')//.utc();

  // Step 2. Calculate the number of days between your date of birth (GMT)and January 23, 1921.
  // This date has no particular significance other than the motion
  // of the moon through the zodiac was at a highpoint at this time
  const highPointDate = moment('2000-01-21', 'YYYY-MM-DD');
  const daysSinceHighPoint = date.diff(highPointDate, 'days');

  // Step 3. Convert your time of birth to the equivalent fraction of a day,
  // and then add this number to the number of days you calculated in Step 2
  // Call this number D
  const timeFraction = date.diff(
    moment(date.format('YYYY-MM-DD'), 'YYYY-MM-DD'),
    'seconds'
  ) / (24 * 60 * 60);
  const d = daysSinceHighPoint + timeFraction;

  // Step 4. Take the number you obtained in Step 3 and plug it into the expression
  // 13.1762D + 12.0947cos(0.11403D)sin(0.11403(D+1)) - 6.627
  // This equation is a simplified moon position formula adapted from ephemeris entries between 1921 and 1990
  const m = 13.1762 * d
    + 12.0947 * Math.cos(0.11403 * d) * Math.sin(0.11403 * (d + 1))
    - 6.627;

  // Step 5. Take the number you obtained in Step 4 and divide by 360, but keep only the decimal part.
  const mFraction = (m / 360) - Math.floor(m / 360);

  //Step 6
  // Multiply the decimal part you calculated above by 360.
  // You will end up with a number between 0 and 359.999.
  const moonSign = mFraction * 360;

  // Use the table below to convert that number to your moon sign.
  if (0 <= moonSign && moonSign < 30) return 'Leo (Лев)';
  if (30 <= moonSign && moonSign < 60) return 'Virgo (Дева)';
  if (60 <= moonSign && moonSign < 90) return 'Libra (Весы)';
  if (90 <= moonSign && moonSign < 120) return 'Scorpio (Скорпион)';
  if (120 <= moonSign && moonSign < 150) return 'Sagittarius (Стрелец)';
  if (150 <= moonSign && moonSign < 180) return 'Capricorn (Козерог)';
  if (180 <= moonSign && moonSign < 210) return 'Aquarius (Водолей)';
  if (210 <= moonSign && moonSign < 240) return 'Pisces (Рыбы)';
  if (240 <= moonSign && moonSign < 270) return 'Aries (Овен)';
  if (270 <= moonSign && moonSign < 300) return 'Taurus (Телец)';
  if (300 <= moonSign && moonSign < 330) return 'Gemini (Близнецы)';
  if (330 <= moonSign && moonSign < 360) return 'Cancer (Рак)';

  return 'Unknown';
}

function calculatePhase(dateString: string): string {
  // 1) Express the date as Y = year, M = Month, D = day.
  const date = moment(dateString, 'YYYY-MM-DDTHH:mm');
  let y = date.year();
  let m = date.month() + 1;
  let d = date.date();

  // 2) If the month is January or February, subtract 1 from the year and add 12 to the month.
  if (m === 1 || m === 2) {
    y -= 1;
    m += 12;
  }

  // 3) Do the following calculations:
  // a. A = Y/100
  // b. B = A/4
  // c. C = 2-A+B
  // d. E = 365.25 * (Y+4716)
  // e. F = 30.6001 * (M+1)
  // f. JD = C+D+E+F-1524.5
  const a = y / 100;
  const b = a / 4;
  const c = 2 - a + b;
  const e = 365.25 * (y + 4716);
  const f = 30.6001 * (m + 1);
  const jd = c + d + e + f - 1524.5;

  // Now that we have the Julian day, let’s calculate the days since the last new moon:
  // Day since New = JD - 2451549.5
  const daysSinceNew = jd - 2451549.5;

  // If we divide this by the period, we will have how many new moons there have been:
  // New Moons = Days since New / 29.53
  const newMoons = daysSinceNew / 29.53;

  // If we drop the whole number, the decimal represents the fraction of a cycle that the moon is currently
  // in. Multiply the fraction by 29.53 and you will uncover how many days you are into the moon’s cycle.
  const daysIntoCycle = (newMoons - Math.floor(newMoons)) * 29.53;

  return daysIntoCycle.toFixed(2);
}
