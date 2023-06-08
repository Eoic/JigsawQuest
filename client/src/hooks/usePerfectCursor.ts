import {PerfectCursor} from 'perfect-cursors';
import {useCallback, useEffect, useLayoutEffect, useState} from 'react';

const usePerfectCursor = (callback : (point : number[]) => void, point? : number[]) => {
  const [perfectCursor] = useState(() => new PerfectCursor(callback));

  useEffect(() => {
    if (point) {
      perfectCursor.addPoint(point);
    }

    return () => perfectCursor.dispose();
  }, [perfectCursor, point]);

  const onPointChange = useCallback(
    (point: number[]) => perfectCursor.addPoint(point),
    [perfectCursor]
  );

  return onPointChange;
};

export default usePerfectCursor;
