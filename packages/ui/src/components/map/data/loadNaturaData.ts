import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import type { FeatureCollection, Geometry } from 'geojson';

// Define NaturaProperties interface here since it's missing
interface NaturaProperties {
  objectid: number;
  naturatunn: string;
  suojeluper: string;
  versiotunn: string;
  nimisuomi: string;
  nimiruotsi: string;
  aluetyyppi: string;
  tietolomak: null | string;
  paatospvm: string;
  paatospala: number;
  paatospitu: number;
  meripalapr: number;
  paatosasia: string;
  ensisijlaj: number;
  aluejaviiv: number;
  vpdsuoj: number;
  lisatieto: null | string;
  luontipvm: string;
  muutospvm: null | string;
  paattymisp: null | string;
  area_m2: number;
  perimeter_: number;
}

export async function loadNaturaData(): Promise<FeatureCollection<Geometry, NaturaProperties>> {
  const storage = getStorage();
  const fileRef = ref(storage, 'natura-areas.json');
  const url = await getDownloadURL(fileRef);

  const response = await fetch(url);
  return response.json();
} 