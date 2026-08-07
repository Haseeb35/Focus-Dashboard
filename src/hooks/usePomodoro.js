import { useCallback, useEffect, useRef, useState } from 'react';

export default function usePomodoro() {
  const [mode, setMode] = useState('focus'); // focus | short | long
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [shortMinutes, setShortMinutes] = useState(5);
  const [longMinutes, setLongMinutes] = useState(15);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [cyclesCompletedInRound, setCyclesCompletedInRound] = useState(0);
  const [autoCycle, setAutoCycle] = useState(true);

  const intervalRef = useRef(null);
  const endCallbackRef = useRef(null);
  const stateRef = useRef({
    mode,
    focusMinutes,
    shortMinutes,
    longMinutes,
    cyclesCompletedInRound,
    autoCycle,
  });

  const getDuration = (m) => {
    const s = stateRef.current;
    const perMode = { focus: s.focusMinutes, short: s.shortMinutes, long: s.longMinutes };
    return perMode[m] * 60;
  };

  const syncState = () => {
    stateRef.current = {
      mode,
      focusMinutes,
      shortMinutes,
      longMinutes,
      cyclesCompletedInRound,
      autoCycle,
    };
  };

  useEffect(() => {
    syncState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, focusMinutes, shortMinutes, longMinutes, cyclesCompletedInRound, autoCycle]);

  const clearIntervalNow = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const completeSession = useCallback(() => {
    const s = stateRef.current;
    if (s.mode === 'focus') {
      const newCycles = s.cyclesCompletedInRound + 1;
      setSessionsCompleted((c) => c + 1);
      setCyclesCompletedInRound(newCycles);

      if (endCallbackRef.current) endCallbackRef.current('focus', newCycles);

      if (s.autoCycle) {
        const nextMode = newCycles % 4 === 0 ? 'long' : 'short';
        setMode(nextMode);
        setSecondsLeft(getDuration(nextMode));
      } else {
        setSecondsLeft(0);
      }
    } else {
      setMode('focus');
      setSecondsLeft(s.focusMinutes * 60);
      if (endCallbackRef.current) endCallbackRef.current('break', false);
    }
  }, []);

  const start = useCallback(() => {
    syncState();
    if (secondsLeft <= 0) {
      setSecondsLeft(getDuration(stateRef.current.mode));
    }
    clearIntervalNow();
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearIntervalNow();
          setIsRunning(false);
          completeSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const pause = useCallback(() => {
    clearIntervalNow();
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    clearIntervalNow();
    setIsRunning(false);
    syncState();
    setSecondsLeft(getDuration(stateRef.current.mode));
  }, []);

  const skip = useCallback(() => {
    clearIntervalNow();
    setIsRunning(false);
    completeSession();
  }, [completeSession]);

  const changeMode = useCallback(
    (nextMode) => {
      clearIntervalNow();
      setIsRunning(false);
      setMode(nextMode);
      setSecondsLeft(getDuration(nextMode));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => () => clearIntervalNow(), []);

  const registerEndCallback = useCallback((fn) => {
    endCallbackRef.current = fn;
  }, []);

  return {
    mode,
    changeMode,
    focusMinutes,
    setFocusMinutes,
    shortMinutes,
    setShortMinutes,
    longMinutes,
    setLongMinutes,
    secondsLeft,
    isRunning,
    start,
    pause,
    reset,
    skip,
    sessionsCompleted,
    cyclesCompletedInRound,
    autoCycle,
    setAutoCycle,
    onEnd: registerEndCallback,
  };
}