import { LatLngTuple } from 'leaflet';

// Municipality center coordinates with slight northern offset
export const municipalityCenters: Record<string, LatLngTuple> = {
  '046': [62.1454, 28.8935], // Enonkoski (+0.05 latitude)
  '090': [62.4847, 28.8830], // Heinävesi (+0.05)
  '097': [61.6994, 26.7247], // Hirvensalmi (+0.05)
  '171': [62.2251, 27.8372], // Joroinen (+0.05)
  '178': [61.9477, 27.8555], // Juva (+0.05)
  '213': [62.0374, 26.6425], // Kangasniemi (+0.05)
  '491': [61.7387, 27.2728], // Mikkeli (+0.05)
  '507': [61.4687, 26.8745], // Mäntyharju (+0.05)
  '588': [61.5527, 26.4783], // Pertunmaa (+0.05)
  '593': [62.3540, 27.1577], // Pieksämäki (+0.05)
  '623': [61.5741, 28.1751], // Puumala (+0.05)
  '681': [62.1134, 28.2957], // Rantasalmi (+0.05)
  '740': [61.9188, 28.8809], // Savonlinna (+0.05)
  '768': [61.8357, 28.3634], // Sulkava (+0.05)
};

export const getMunicipalityCenter = (municipalityCode: string): LatLngTuple => {
  const center = municipalityCenters[municipalityCode];
  if (!center) {
    console.warn(`No center coordinates found for municipality ${municipalityCode}`);
    return [61.90, 27.70]; // Default to region center if not found
  }
  return center;
}; 