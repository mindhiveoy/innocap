import type { FeatureCollection } from 'geojson';
import { southernSavoniaMunicipalities } from './southernSavoMunicipalityData.js';

/* 
Southern Savonia (Etelä-Savo) municipality codes:
491: Mikkeli
046: Enonkoski
097: Hirvensalmi
171: Joroinen
178: Juva
213: Kangasniemi
588: Pertunmaa
593: Pieksämäki
623: Puumala
681: Rantasalmi
740: Savonlinna
768: Sulkava
507: Mäntyharju
090: Heinävesi
 */

export const municipalityBoundaries: FeatureCollection = {
  type: "FeatureCollection",
  features: southernSavoniaMunicipalities.features
}; 