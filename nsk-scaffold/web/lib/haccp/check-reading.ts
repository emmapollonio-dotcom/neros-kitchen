/**
 * Verifica di conformità di una rilevazione temperatura — funzione pura,
 * senza dipendenze da DB/network, sullo stesso principio di
 * lib/food-cost/calculate.ts e lib/waste/estimate.ts: la route API
 * (app/api/v1/haccp/readings/route.ts) recupera la soglia del punto di
 * controllo da Supabase e delega qui il giudizio di conformità, così la
 * logica resta unit-testabile in isolamento e non duplicata tra route e UI.
 */

export interface TemperatureThreshold {
  temp_min: number;
  temp_max: number;
}

export interface ReadingCheck {
  isNonConforming: boolean;
  deviation: number; // 0 se conforme, altrimenti quanto fuori soglia (sempre positivo)
}

export function checkTemperatureReading(
  temperature: number,
  threshold: TemperatureThreshold
): ReadingCheck {
  if (temperature < threshold.temp_min) {
    return { isNonConforming: true, deviation: round(threshold.temp_min - temperature) };
  }
  if (temperature > threshold.temp_max) {
    return { isNonConforming: true, deviation: round(temperature - threshold.temp_max) };
  }
  return { isNonConforming: false, deviation: 0 };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
