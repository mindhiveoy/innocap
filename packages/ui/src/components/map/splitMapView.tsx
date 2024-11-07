'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Box } from '@mui/material';
import { LeafletMap } from './leafletMap';
import type { LatLngTuple, LatLngBoundsExpression } from 'leaflet';
import { MunicipalityLevelData, MarkerData, Indicator } from '../../types/indicators';
import styled from '@emotion/styled';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import 'leaflet';
import 'leaflet.sync';

interface SplitMapViewProps {
  topIndicator: Indicator;
  bottomIndicator: Indicator;
  municipalityData: MunicipalityLevelData[];
  markerData: MarkerData[];
  center: LatLngTuple;
  zoom: number;
  maxBounds: LatLngBoundsExpression;
}

const INITIAL_SPLIT = 25;
const MIN_SPLIT = 5; // Allow more extreme splits but prevent going outside viewport
const MAX_SPLIT = 45;

const DragHandle = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 24px;
  background: rgba(255, 255, 255, 0.9);
  cursor: row-resize;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
  user-select: none;
  touch-action: none;
  
  &:hover {
    background: rgba(255, 255, 255, 1);
  }

  & .MuiSvgIcon-root {
    color: rgba(0, 0, 0, 0.5);
    width: 32px;
    height: 32px;
  }
`;

const calculateMapAdjustments = (splitPosition: number, isTopMap: boolean, defaultBounds: LatLngBoundsExpression) => {
  const mapHeight = isTopMap ? splitPosition : (100 - splitPosition);

  if (mapHeight < 30) {
    const latitudeAdjustment = isTopMap ? 0.2 : -0.2;

    return {
      center: [61.90 + latitudeAdjustment, 27.70] as LatLngTuple,
      maxBounds: [
        [61.10 - (isTopMap ? 0 : 0.2), 25.70],
        [62.70 + (isTopMap ? 0.2 : 0), 29.75]
      ] as LatLngBoundsExpression
    };
  }

  return {
    center: [61.90, 27.70] as LatLngTuple,
    maxBounds: defaultBounds
  };
};

export function SplitMapView({
  topIndicator,
  bottomIndicator,
  municipalityData,
  markerData,
  center,
  zoom,
  maxBounds
}: SplitMapViewProps) {
  const [splitPosition, setSplitPosition] = useState<number>(INITIAL_SPLIT);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = React.useRef<{ y: number; splitPos: number } | null>(null);

  const commonMapProps = useMemo(() => ({
    center,
    zoom,
    maxBounds,
    minZoom: 8,
    maxZoom: 10,
    municipalityData,
    markerData,
  }), [center, zoom, maxBounds, municipalityData, markerData]);

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const clientY = 'touches' in e ? e.touches[0]?.clientY ?? window.innerHeight / 2 : e.clientY;
    dragStartRef.current = {
      y: clientY,
      splitPos: splitPosition
    };
    setIsDragging(true);
  }, [splitPosition]);

  const handleDrag = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !dragStartRef.current) return;

    e.preventDefault();
    const clientY = 'touches' in e ? e.touches[0]?.clientY ?? window.innerHeight / 2 : e.clientY;
    const delta = clientY - dragStartRef.current.y;
    const containerHeight = window.innerHeight;
    const newPosition = dragStartRef.current.splitPos + (delta / containerHeight) * 100;

    // Constrain split position within viewport
    setSplitPosition(Math.min(Math.max(newPosition, MIN_SPLIT), MAX_SPLIT));
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag, { passive: false });
      window.addEventListener('touchmove', handleDrag, { passive: false });
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchend', handleDragEnd);

      // Prevent scrolling while dragging
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('touchmove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);

      // Restore scrolling
      document.body.style.overflow = '';
    };
  }, [isDragging, handleDrag, handleDragEnd]);

  // Memoize container styles
  const topContainerStyle = useMemo(() => ({
    height: `${splitPosition}%`,
    position: 'relative' as const,
    overflow: 'hidden'
  }), [splitPosition]);

  const bottomContainerStyle = useMemo(() => ({
    height: `${100 - splitPosition}%`,
    position: 'relative' as const,
    overflow: 'hidden'
  }), [splitPosition]);
  console.log("🚀 ~ bottomContainerStyle ~ bottomContainerStyle:", bottomContainerStyle)

  const dragHandleStyle = useMemo(() => ({
    top: `${splitPosition}%`,
    transform: 'translateY(-50%)'
  }), [splitPosition]);

  // Calculate adjustments for both maps
  const topMapAdjustments = useMemo(() =>
    calculateMapAdjustments(splitPosition, true, maxBounds),
    [splitPosition, maxBounds]
  );

  const bottomMapAdjustments = useMemo(() =>
    calculateMapAdjustments(splitPosition, false, maxBounds),
    [splitPosition, maxBounds]
  );

  // Add refs for both maps
  const topMapRef = useRef<L.Map | null>(null);
  const bottomMapRef = useRef<L.Map | null>(null);

  // Sync maps when they're both available
  useEffect(() => {
    if (topMapRef.current && bottomMapRef.current) {
      topMapRef.current.sync(bottomMapRef.current);
      bottomMapRef.current.sync(topMapRef.current);
    }

    // Cleanup sync when component unmounts
    return () => {
      if (topMapRef.current && bottomMapRef.current) {
        topMapRef.current.unsync(bottomMapRef.current);
        bottomMapRef.current.unsync(topMapRef.current);
      }
    };
  }, [topMapRef.current, bottomMapRef.current]);

  return (
    <Box sx={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      <Box sx={topContainerStyle}>
        <LeafletMap
          {...commonMapProps}
          center={topMapAdjustments.center}
          maxBounds={topMapAdjustments.maxBounds}
          selectedIndicator={topIndicator}
          onMapMount={(map) => {
            topMapRef.current = map;
          }}
        />
      </Box>

      <DragHandle
        className="drag-handle"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={dragHandleStyle}
      >
        <DragIndicatorIcon />
      </DragHandle>

      <Box sx={bottomContainerStyle}>
        <LeafletMap
          {...commonMapProps}
          center={bottomMapAdjustments.center}
          maxBounds={bottomMapAdjustments.maxBounds}
          selectedIndicator={bottomIndicator}
          onMapMount={(map) => {
            bottomMapRef.current = map;
          }}
        />
      </Box>
    </Box>
  );
}