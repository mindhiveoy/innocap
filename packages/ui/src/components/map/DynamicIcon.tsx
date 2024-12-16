import { useMemo } from 'react';
import SolarPowerIcon from '@mui/icons-material/SolarPower';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import AirIcon from '@mui/icons-material/Air';
import WaterIcon from '@mui/icons-material/Water';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import Co2 from '@mui/icons-material/Co2';
import Recycling from '@mui/icons-material/Recycling';
import ShoppingBag from '@mui/icons-material/ShoppingBag';
import ElectricalServices from '@mui/icons-material/ElectricalServices';
import DryCleaning from '@mui/icons-material/DryCleaning';
import Groups from '@mui/icons-material/Groups';
import EvStation from '@mui/icons-material/EvStation';
import LocalGasStation from '@mui/icons-material/LocalGasStation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';

export const iconComponents = {
  'SolarPower': SolarPowerIcon,
  'Agriculture': AgricultureIcon,
  'Thermostat': ThermostatIcon,
  'WindPower': AirIcon,
  'Water': WaterIcon,
  'WaterDrop': WaterDropIcon,
  'EnergySavingsLeaf': EnergySavingsLeafIcon,
  'Co2': Co2,
  'Recycling': Recycling,
  'ShoppingBag': ShoppingBag,
  'ElectricalServices': ElectricalServices,
  'DryCleaning': DryCleaning,
  'EvStation': EvStation,
  'Groups': Groups,
  'LocalGasStation': LocalGasStation,
  'Default': LocationOnIcon,
} as const;

type IconName = keyof typeof iconComponents;


export function createMarkerIcon(iconName: string, color: string = '#014B70') {
  const cleanIconName = iconName.replace(/Icon$/, '') as IconName;
  const IconComponent = iconComponents[cleanIconName] || iconComponents.Default;

  // Render the MUI icon to SVG markup
  const iconSvg = renderToStaticMarkup(
    <IconComponent />
  );

  const coloredSvg = iconSvg.replace(/(<path\s[^>]*)(fill="[^"]*")?([^>]*>)/g, `$1 fill="${color}"$3`);

  return L.divIcon({
    html: `<div style="
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.8);
      background: #FFFFFFE6;
    "><div style="
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: scale(0.83);
    ">${coloredSvg}</div></div>`,
    className: 'custom-marker-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}