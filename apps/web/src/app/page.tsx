'use client';

import dynamic from 'next/dynamic';
import styles from './page.module.css';
import { LatLngTuple } from 'leaflet';

const Map = dynamic(
  () => import('@repo/ui/components/map').then(mod => mod.LeafletMap),
  { ssr: false }
);

export default function Home() {
  const center: LatLngTuple = [61.6885, 27.2723];
  const zoom = 10;

  return (
    <main className={styles.main}>
      <Map center={center} zoom={zoom} />
    </main>
  );
}
