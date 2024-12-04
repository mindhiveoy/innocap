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
  const handlePopupMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const popup = popupRefs.current[index];
    if (!popup) return;

    dragRefs.current[index] = {
      isDragging: true,
      startPos: map.mouseEventToContainerPoint({
        clientX: e.clientX,
        clientY: e.clientY
      } as MouseEvent),
      initialLatLng: popup.getLatLng() ?? null
    };

    popup.getElement()?.classList.add('is-dragging');
    map.dragging.disable();

    document.addEventListener('mousemove', handlePopupMouseMove);
    document.addEventListener('mouseup', handlePopupMouseUp);
  }, [map, index, popupRefs, dragRefs]);

  const handlePopupMouseMove = useCallback((e: MouseEvent) => {
    e.preventDefault();
    const popup = popupRefs.current[index];
    const dragRef = dragRefs.current[index];
    if (!popup || !dragRef?.isDragging || !dragRef.startPos || !dragRef.initialLatLng) return;

    const currentPoint = map.mouseEventToContainerPoint({
      clientX: e.clientX,
      clientY: e.clientY
    } as MouseEvent);

    const offset = currentPoint.subtract(dragRef.startPos);
    const initialPoint = map.latLngToContainerPoint(dragRef.initialLatLng);
    const newPoint = initialPoint.add(offset);
    const newLatLng = map.containerPointToLatLng(newPoint);

    popup.setLatLng(newLatLng);
  }, [map, index, popupRefs, dragRefs]);

  const handlePopupMouseUp = useCallback((e: MouseEvent) => {
    e.preventDefault();
    const popup = popupRefs.current[index];
    if (!popup) return;

    if (dragRefs.current[index]) {
      dragRefs.current[index].isDragging = false;
      dragRefs.current[index].startPos = null;
    }

    popup.getElement()?.classList.remove('is-dragging');
    map.dragging.enable();

    document.removeEventListener('mousemove', handlePopupMouseMove);
    document.removeEventListener('mouseup', handlePopupMouseUp);
  }, [map, index, popupRefs, dragRefs]);

  return (
    <div
      onMouseDown={handlePopupMouseDown}
      style={{
        cursor: 'move',
        userSelect: 'none',
        width: '100%',
        height: '100%'
      }}
    >
      {children}
    </div>
  );
} 