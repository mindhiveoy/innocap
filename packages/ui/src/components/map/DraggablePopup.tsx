import { useCallback } from 'react';
import L from 'leaflet';

interface DraggablePopupProps {
  index: number;
  popupRefs: React.MutableRefObject<(L.Popup | null)[]>;
  dragRefs: React.MutableRefObject<{ isDragging: boolean; startPos: L.Point | null; initialLatLng: L.LatLng | null }[]>;
  map: L.Map;
  children: React.ReactNode;
}

export function DraggablePopup({
  index,
  popupRefs,
  dragRefs,
  map,
  children
}: DraggablePopupProps) {
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    const popup = popupRefs.current[index];
    if (!popup) return;

    dragRefs.current[index] = {
      isDragging: true,
      startPos: map.mouseEventToContainerPoint({
        clientX,
        clientY
      } as MouseEvent),
      initialLatLng: popup.getLatLng() ?? null
    };

    popup.getElement()?.classList.add('is-dragging');
    map.dragging.disable();
  }, [map, index, popupRefs, dragRefs]);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    const popup = popupRefs.current[index];
    const dragRef = dragRefs.current[index];
    if (!popup || !dragRef?.isDragging || !dragRef.startPos || !dragRef.initialLatLng) return;

    const currentPoint = map.mouseEventToContainerPoint({
      clientX,
      clientY
    } as MouseEvent);

    const offset = currentPoint.subtract(dragRef.startPos);
    const initialPoint = map.latLngToContainerPoint(dragRef.initialLatLng);
    const newPoint = initialPoint.add(offset);
    const newLatLng = map.containerPointToLatLng(newPoint);

    popup.setLatLng(newLatLng);
  }, [map, index, popupRefs, dragRefs]);

  const handleDragEnd = useCallback(() => {
    const popup = popupRefs.current[index];
    if (!popup) return;

    if (dragRefs.current[index]) {
      dragRefs.current[index].isDragging = false;
      dragRefs.current[index].startPos = null;
    }

    popup.getElement()?.classList.remove('is-dragging');
    map.dragging.enable();
  }, [map, index, popupRefs, dragRefs]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [handleDragStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    e.preventDefault();
    handleDragMove(e.clientX, e.clientY);
  }, [handleDragMove]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    e.preventDefault();
    handleDragEnd();

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleDragEnd]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;

    handleDragStart(touch.clientX, touch.clientY);

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }, [handleDragStart]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;

    handleDragMove(touch.clientX, touch.clientY);
  }, [handleDragMove]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();
    handleDragEnd();

    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  }, [handleDragEnd]);

  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{
        cursor: 'move',
        userSelect: 'none',
        width: '100%',
        height: '100%',
        touchAction: 'none' // Prevent default touch actions like scrolling
      }}
    >
      {children}
    </div>
  );
} 