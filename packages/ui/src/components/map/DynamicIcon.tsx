import { useMemo } from 'react';
import SolarPowerIcon from '@mui/icons-material/SolarPower';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import AirIcon from '@mui/icons-material/Air';
import WaterIcon from '@mui/icons-material/Water';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface DynamicIconProps {
  iconName: string;
  color?: string;
  size?: number;
}

const iconComponents = {
  'SolarPower': SolarPowerIcon,
  'Agriculture': AgricultureIcon,
  'Thermostat': ThermostatIcon,
  'WindPower': AirIcon,
  'Water': WaterIcon,
  'WaterDrop': WaterDropIcon,
  'EnergySavingsLeaf': EnergySavingsLeafIcon,
  'Default': LocationOnIcon,
} as const;

type IconName = keyof typeof iconComponents;

export function DynamicIcon({ iconName, color, size = 24 }: DynamicIconProps) {
  const IconComponent = useMemo(() => {
    console.log("Creating icon for:", iconName);
    console.log("Available icons:", Object.keys(iconComponents));
    
    const cleanIconName = iconName.replace(/Icon$/, '');
    const component = iconComponents[cleanIconName as IconName];
    
    if (!component) {
      console.warn(`Icon not found for name: ${iconName}, using default`);
      return iconComponents.Default;
    }
    
    return component;
  }, [iconName]);

  return <IconComponent sx={{ width: size, height: size, color }} />;
} 