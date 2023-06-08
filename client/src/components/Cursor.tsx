import { usePerfectCursor } from '../hooks';
import { useRef, useCallback, useEffect } from 'react';

const Cursor = ({ point }: { point: number[] }) => {
  const cursorRef = useRef<SVGSVGElement>(null);

  const animateCursor = useCallback((point: number[]) => {
    const element = cursorRef.current;

    if (!element) {
      return;
    }

    element.style.setProperty(
      'transform',
      `translate(${point[0]}px, ${point[1]}px)`
    );
  }, []);

  const onPointMove = usePerfectCursor(animateCursor);

  useEffect(() => onPointMove(point), [onPointMove, point]);

  return (
    <svg
      ref={cursorRef}
      style={{ position: 'absolute', top: 0, left: 0 }}
      width="34.466873"
      height="34.69241"
      viewBox="0 0 9.3839424 9.7081989"
      version="1.1"
      id="svg5"
      xmlns="http://www.w3.org/2000/svg">
      <defs id="defs2" />
      <g
        id="layer1"
        transform="translate(0.76138125,0.13689783)">
        <path
          style={{ fill: '#dcdcdc', fillOpacity: 1, stroke: '#393939', strokeWidth: 0.428, strokeLinecap: 'round', strokeLinejoin: 'round', strokeOpacity: 1 }}
          d="m -0.59739159,0.02709055 c 0.0409367,0.0969456 3.87982729,9.38024075 3.87982729,9.38024075 0,0 0.7372669,-2.7208692 1.6820405,-3.6453351 C 5.8797241,4.8664214 8.4585905,4.2799513 8.4585905,4.2799513 Z"
          id="path411"
        />
      </g>
    </svg>
  );
};

export default Cursor;
