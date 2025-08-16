import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  whiteMs: number;
  blackMs: number;
  lastMoveAt: string | null;
  toMove: 'white' | 'black' | null;
  isActive: boolean;
  serverNowIso?: string | null;
};

function format(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

function ChessTimer({ whiteMs, blackMs, lastMoveAt, toMove, isActive, serverNowIso }: Props) {
  const [tick, setTick] = useState(0);
  const raf = useRef<number | null>(null);

  const serverOffsetMs = useMemo(() => {
    if (!serverNowIso) return 0;
    const serverNow = Date.parse(serverNowIso);
    if (Number.isNaN(serverNow)) return 0;
    return Date.now() - serverNow;
  }, [serverNowIso]);

  useEffect(() => {
    const loop = () => {
      setTick((t) => (t + 1) % 1_000_000);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const lm = lastMoveAt ? Date.parse(lastMoveAt) : null;
  const nowAdj = Date.now() - serverOffsetMs;
  const elapsed = isActive && lm ? nowAdj - lm : 0;

  const whiteDisplay = Math.max(
    0,
    whiteMs - (isActive && toMove === 'white' ? elapsed : 0)
  );
  const blackDisplay = Math.max(
    0,
    blackMs - (isActive && toMove === 'black' ? elapsed : 0)
  );

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ fontWeight: toMove === 'white' && isActive ? 700 : 500 }}>
        White: {format(whiteDisplay)}
      </div>
      <div style={{ fontWeight: toMove === 'black' && isActive ? 700 : 500 }}>
        Black: {format(blackDisplay)}
      </div>
    </div>
  );
}

export default ChessTimer;