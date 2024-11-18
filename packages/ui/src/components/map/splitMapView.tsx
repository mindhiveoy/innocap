'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Box } from '@mui/material';
import { LeafletMap } from './leafletMap';
import type { LatLngTuple, LatLngBoundsExpression } from 'leaflet';
import { MunicipalityLevelData, MarkerData, Indicator, BarChartData } from '../../types/indicators';
import styled from '@emotion/styled';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import 'leaflet';
import 'leaflet.sync';

// Add this type declaration at the top of the file
declare module 'leaflet' {
  interface Map {
    sync(map: L.Map): this;
    unsync(map: L.Map): this;
  }
}

interface SplitMapViewProps {
  pinnedIndicator: Indicator | null;
  selectedIndicator: Indicator | null;
  municipalityData: MunicipalityLevelData[];
  markerData: MarkerData[];
  barChartData: BarChartData[];
  center: LatLngTuple;
  zoom: number;
  maxBounds: LatLngBoundsExpression;
}

/**
 * Constraints for the split view divider position.
 * Percentage of the viewport height.
 */
const INITIAL_SPLIT = 50;
const MIN_SPLIT = 10;
const MAX_SPLIT = 90;

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

/**
 * Calculates map center and bounds adjustments based on split position.
 * When a map section becomes very small, adjusts its center point and bounds
 * to maintain visibility of the important areas.
 */
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
  pinnedIndicator,
  selectedIndicator,
  municipalityData,
  markerData,
  barChartData,
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
    barChartData,
  }), [center, zoom, maxBounds, municipalityData, markerData, barChartData]);

  const topMapProps = useMemo(() => ({
    ...commonMapProps,
    zoomControl: true,
  }), [commonMapProps]);

  const bottomMapProps = useMemo(() => ({
    ...commonMapProps,
    zoomControl: false,
  }), [commonMapProps]);

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

  /**
   * Synchronizes both map instances to share pan and zoom operations.
   * Maps are synced when both instances are available and unsynced on unmount.
   */
  useEffect(() => {
    if (topMapRef.current && bottomMapRef.current) {
      (topMapRef.current as any).sync(bottomMapRef.current, {
        syncCursor: false,
        syncPopups: false
      });
      (bottomMapRef.current as any).sync(topMapRef.current, {
        syncCursor: false,
        syncPopups: false
      });
    }

    return () => {
      if (topMapRef.current && bottomMapRef.current) {
        (topMapRef.current as any).unsync(bottomMapRef.current);
        (bottomMapRef.current as any).unsync(topMapRef.current);
      }
    };
  }, [topMapRef.current, bottomMapRef.current]);

  /**
   * Forces maps to recalculate their container sizes when split position changes.
   * This prevents rendering issues when resizing map containers.
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (topMapRef.current) {
        topMapRef.current.invalidateSize();
        // Close any open popups when resizing
        topMapRef.current.closePopup();
      }
      if (bottomMapRef.current) {
        bottomMapRef.current.invalidateSize();
        // Close any open popups when resizing
        bottomMapRef.current.closePopup();
      }
    }, 100); // Small delay to ensure smooth resizing

    return () => clearTimeout(timeout);
  }, [splitPosition]);

  return (
    <Box sx={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      <Box sx={topContainerStyle}>
        <LeafletMap
          {...topMapProps}
          center={topMapAdjustments.center}
          maxBounds={topMapAdjustments.maxBounds}
          selectedIndicator={pinnedIndicator}
          pinnedIndicator={pinnedIndicator}
          isPinned={true}
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
        <DragHandleIcon />
      </DragHandle>

      <Box sx={bottomContainerStyle}>
        <LeafletMap
          {...bottomMapProps}
          center={bottomMapAdjustments.center}
          maxBounds={bottomMapAdjustments.maxBounds}
          selectedIndicator={selectedIndicator}
          pinnedIndicator={null}
          isPinned={false}
          onMapMount={(map) => {
            bottomMapRef.current = map;
          }}
        />
      </Box>
    </Box>
  );
}