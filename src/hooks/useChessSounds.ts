import { useRef, useCallback } from 'react';

type Kind = 'move' | 'capture' | 'check' | 'illegal' | 'promote' | 'castle';

export function useChessSounds() {
    const ctxRef = useRef<AudioContext | null>(null);

    const ensure = () => {
        if (!ctxRef.current) {
            const Ctor: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
            if (!Ctor) return null;
            ctxRef.current = new Ctor();
        }
        if (ctxRef.current && ctxRef.current.state === 'suspended') void ctxRef.current.resume();
        return ctxRef.current;
    };

    const osc = (
        ctx: AudioContext,
        t: number,
        f: number,
        dur: number,
        type: OscillatorType,
        peak = 0.18,
        attack = 0.008,
        decay = 0.09,
    ) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(peak, t + attack);
        g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
        o.connect(g).connect(ctx.destination);
        o.start(t);
        o.stop(t + dur);
    };

    const noise = (ctx: AudioContext, t: number, dur = 0.06, peak = 0.2) => {
        const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const n = ctx.createBufferSource();
        n.buffer = buf;
        const g = ctx.createGain();
        g.gain.setValueAtTime(peak, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        n.connect(g).connect(ctx.destination);
        n.start(t);
        n.stop(t + dur);
    };

    const play = useCallback((kind: Kind) => {
        const ctx = ensure();
        if (!ctx) return;
        const t = ctx.currentTime;
        if (kind === 'move') {
            osc(ctx, t, 440, 0.12, 'sine', 0.14, 0.005, 0.1);
        } else if (kind === 'capture') {
            noise(ctx, t, 0.06, 0.18);
            osc(ctx, t, 180, 0.12, 'triangle', 0.14, 0.005, 0.09);
        } else if (kind === 'check') {
            osc(ctx, t, 660, 0.12, 'sine', 0.14);
            osc(ctx, t + 0.06, 880, 0.12, 'sine', 0.12);
        } else if (kind === 'illegal') {
            osc(ctx, t, 220, 0.18, 'square', 0.12);
            osc(ctx, t + 0.02, 200, 0.18, 'square', 0.12);
        } else if (kind === 'promote') {
            osc(ctx, t, 523.25, 0.09, 'sine', 0.14);
            osc(ctx, t + 0.06, 659.25, 0.09, 'sine', 0.14);
            osc(ctx, t + 0.12, 783.99, 0.18, 'sine', 0.12);
        } else if (kind === 'castle') {
            osc(ctx, t, 392, 0.08, 'triangle', 0.14);
            osc(ctx, t + 0.07, 392, 0.08, 'triangle', 0.14);
        }
    }, []);

    return {
        playMove: () => play('move'),
        playCapture: () => play('capture'),
        playCheck: () => play('check'),
        playIllegal: () => play('illegal'),
        playPromote: () => play('promote'),
        playCastle: () => play('castle'),
    };
}


