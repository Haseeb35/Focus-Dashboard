import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BsPlayFill, BsPauseFill, BsVolumeUp, BsVolumeMute } from 'react-icons/bs';
import { sounds } from '../data/sounds';
import { ambient } from '../audio/ambient';
import SoundScape from './SoundVisual';
import useLocalStorage from '../hooks/useLocalStorage';

export default function AmbientSounds() {
  const [volumes, setVolumes] = useLocalStorage('fd-sound-volumes', {});
  const [masterVolume, setMasterVolume] = useLocalStorage('fd-master-volume', 0.8);
  const [muted, setMuted] = useLocalStorage('fd-muted', false);
  const [whiteNoise, setWhiteNoise] = useLocalStorage('fd-whitenoise', false);
  const [playing, setPlaying] = useState({});
  const [noiseType, setNoiseType] = useState('white');
  const audioRefs = useRef({});
  const whiteSrcRef = useRef(null);
  const whiteGainRef = useRef(null);

  // Build a looping Audio element for a sound
  const getAudio = useCallback((sound) => {
    let el = audioRefs.current[sound.id];
    if (!el) {
      el = new Audio(sound.src);
      el.loop = true;
      el.preload = 'auto';
      audioRefs.current[sound.id] = el;
    }
    return el;
  }, []);

  const applyVolume = useCallback(() => {
    const base = muted ? 0 : masterVolume;
    Object.keys(audioRefs.current).forEach((id) => {
      const el = audioRefs.current[id];
      const vol = volumes[id] ?? sounds.find((s) => s.id === id)?.defaultVolume ?? 0.5;
      el.volume = vol * base;
    });
    if (whiteGainRef.current) {
      whiteGainRef.current.gain.value = base * 0.06;
    }
  }, [masterVolume, muted, volumes]);

  useEffect(() => {
    applyVolume();
  }, [applyVolume]);

  // Restore the "active" UI state from saved volumes (won't autoplay — browser policy)
  useEffect(() => {
    const saved = {};
    Object.entries(volumes).forEach(([id, vol]) => {
      if (vol > 0) saved[id] = true;
    });
    setPlaying(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSound = (id) => {
    const sound = sounds.find((s) => s.id === id);
    if (!sound) return;
    const el = getAudio(sound);

    if (playing[id]) {
      el.pause();
      setPlaying((p) => ({ ...p, [id]: false }));
    } else {
      const vol = volumes[id] ?? sound.defaultVolume;
      el.volume = vol * (muted ? 0 : masterVolume);
      el.currentTime = 0;
      el.play().catch(() => {});
      setVolumes((v) => ({ ...v, [id]: vol }));
      setPlaying((p) => ({ ...p, [id]: true }));
    }
  };

  const changeVolume = (id, val) => {
    setVolumes((v) => ({ ...v, [id]: val }));
    const el = audioRefs.current[id];
    if (el) {
      if (val === 0) {
        el.pause();
        setPlaying((p) => ({ ...p, [id]: false }));
      } else {
        el.volume = val * (muted ? 0 : masterVolume);
        if (!playing[id] && !el.paused) {
          // already playing
        }
      }
    }
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  const toggleWhiteNoise = () => {
    ambient.ensureContext();
    if (whiteNoise) {
      if (whiteSrcRef.current) {
        try { whiteSrcRef.current.stop(); } catch (e) {}
        whiteSrcRef.current.disconnect();
        whiteSrcRef.current = null;
      }
      whiteGainRef.current = null;
      setWhiteNoise(false);
    } else {
      const src = ambient.makeNoise(noiseType);
      const gain = ambient.audioCtx.createGain();
      gain.gain.value = (muted ? 0 : masterVolume) * 0.06;
      src.connect(gain).connect(ambient.masterGain);
      src.start();
      whiteSrcRef.current = src;
      whiteGainRef.current = gain;
      setWhiteNoise(true);
    }
  };

  useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach((el) => el.pause());
      if (whiteSrcRef.current) {
        try { whiteSrcRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  return (
    <div className="glass-card p-6 flex flex-col gap-4 h-full relative overflow-hidden">
      {/* Animated backdrop for active sounds */}
      <SoundScape active={Object.keys(playing).filter((id) => playing[id])} />

      <div className="relative z-10 flex flex-col gap-4 flex-1">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Ambient Sounds</h2>
          <button
            onClick={toggleMute}
            className="btn btn-ghost p-2"
            aria-label={muted ? 'Unmute' : 'Mute'}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <BsVolumeMute /> : <BsVolumeUp />}
          </button>
        </div>

        {/* Sound grid */}
        <div className="grid grid-cols-2 gap-3">
          {sounds.map((s) => {
            const isOn = playing[s.id];
            const vol = volumes[s.id] ?? s.defaultVolume;
            return (
              <motion.div
                key={s.id}
                whileTap={{ scale: 0.97 }}
                className={`rounded-2xl p-3 border transition-colors cursor-pointer ${isOn ? '' : 'border-[rgb(var(--card-border)/0.4)]'}`}
                style={{
                  background: isOn ? `${s.color}22` : 'rgb(var(--glass)/0.4)',
                  borderColor: isOn ? s.color : undefined,
                }}
                onClick={() => toggleSound(s.id)}
                role="button"
                aria-pressed={isOn}
                aria-label={`${s.name} sound`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <s.Icon style={{ color: s.color }} size={18} aria-hidden="true" />
                    <span className="text-sm font-medium">{s.name}</span>
                  </div>
                  {isOn ? <BsPauseFill style={{ color: s.color }} /> : <BsPlayFill className="text-[rgb(var(--text-secondary))]" />}
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={vol}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => { e.stopPropagation(); changeVolume(s.id, Number(e.target.value)); }}
                  aria-label={`${s.name} volume`}
                  className="mt-2"
                />
              </motion.div>
            );
          })}
        </div>

        {/* Master volume + white noise */}
        <div className="flex flex-col gap-3 border-t border-[rgb(var(--card-border)/0.4)] pt-4">
          <label className="flex items-center gap-3 text-sm">
            <span className="text-xs text-[rgb(var(--text-secondary))] w-16">Master</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={muted ? 0 : masterVolume}
              onChange={(e) => { setMasterVolume(Number(e.target.value)); setMuted(false); }}
              aria-label="Master volume"
            />
          </label>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleWhiteNoise}
              className={`btn btn-ghost text-xs ${whiteNoise ? 'btn-primary' : ''}`}
              aria-pressed={whiteNoise}
            >
              {whiteNoise ? 'Stop Noise' : 'White Noise'}
            </button>
            <select
              value={noiseType}
              onChange={(e) => setNoiseType(e.target.value)}
              aria-label="Noise type"
              className="bg-[rgb(var(--glass)/0.6)] border border-[rgb(var(--card-border)/0.6)] rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
            >
              <option value="white">White</option>
              <option value="pink">Pink</option>
              <option value="brown">Brown</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}