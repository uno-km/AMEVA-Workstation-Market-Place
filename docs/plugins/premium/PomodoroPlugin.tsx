// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, BarChart2, Coffee, Trash2, Zap } from 'lucide-react';

// Preset options for Focus and Break minutes
const FOCUS_PRESETS = [15, 25, 50];
const BREAK_PRESETS = [3, 5, 10];

export function PomodoroPlugin() {
  // Configurable focus/break times
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  
  // Stats stored in localStorage
  const [sessionCount, setSessionCount] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  
  // Real-time tracking for active session
  const [currentKeystrokes, setCurrentKeystrokes] = useState(0);
  const [currentClicks, setCurrentClicks] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [focusState, setFocusState] = useState<'idle' | 'active' | 'deep'>('idle');
  
  // Refs for high-performance event tracking (prevents re-renders on keystrokes/clicks)
  const keystrokesRef = useRef(0);
  const clicksRef = useRef(0);
  const secondActivityRef = useRef(false);
  const activeSecondsRef = useRef(0);
  const elapsedSecondsRef = useRef(0);

  // Load persistent stats and active timer state on mount
  useEffect(() => {
    // 1. Load cumulative stats
    try {
      const savedStats = localStorage.getItem('ameva-pomodoro-stats');
      if (savedStats) {
        const data = JSON.parse(savedStats);
        if (data.sessions !== undefined) setSessionCount(data.sessions);
        if (data.focusTime !== undefined) setTotalFocusTime(data.focusTime);
        if (data.keystrokes !== undefined) setTotalKeystrokes(data.keystrokes);
        if (data.clicks !== undefined) setTotalClicks(data.clicks);
      }
    } catch (e) {
      console.error('Failed to load pomodoro stats:', e);
    }

    // 2. Load active running state (restores timer across unmounts/tab closes)
    try {
      const savedActive = localStorage.getItem('ameva-pomodoro-active-state');
      if (savedActive) {
        const state = JSON.parse(savedActive);
        setFocusMinutes(state.focusMinutes || 25);
        setBreakMinutes(state.breakMinutes || 5);
        setIsBreak(state.isBreak || false);
        
        // Restore current session refs
        keystrokesRef.current = state.currentKeystrokes || 0;
        clicksRef.current = state.currentClicks || 0;
        activeSecondsRef.current = state.activeSeconds || 0;
        elapsedSecondsRef.current = state.elapsedSeconds || 0;
        
        setCurrentKeystrokes(keystrokesRef.current);
        setCurrentClicks(clicksRef.current);
        
        if (state.isRunning) {
          const now = Date.now();
          const targetEnd = state.targetEndTime || now;
          const remaining = Math.round((targetEnd - now) / 1000);
          
          if (remaining > 0) {
            setTimeLeft(remaining);
            setIsRunning(true);
            
            // Re-calculate WPM
            const minutesElapsed = elapsedSecondsRef.current / 60;
            if (minutesElapsed > 0.05) {
              setWpm(Math.round((keystrokesRef.current / 5) / minutesElapsed));
            }
          } else {
            // Finished while closed. Set to 0 and isRunning to true to let the timer useEffect handle completion
            setTimeLeft(0);
            setIsRunning(true);
          }
        } else {
          setTimeLeft(state.timeLeft !== undefined ? state.timeLeft : 25 * 60);
          setIsRunning(false);
        }
      }
    } catch (e) {
      console.error('Failed to load active pomodoro state:', e);
    }
  }, []);

  // Save active state to localStorage whenever it changes
  useEffect(() => {
    if (timeLeft === undefined || isRunning === undefined) return;
    
    try {
      const state = {
        timeLeft,
        isRunning,
        isBreak,
        focusMinutes,
        breakMinutes,
        targetEndTime: isRunning ? (Date.now() + timeLeft * 1000) : null,
        currentKeystrokes: keystrokesRef.current,
        currentClicks: clicksRef.current,
        activeSeconds: activeSecondsRef.current,
        elapsedSeconds: elapsedSecondsRef.current
      };
      localStorage.setItem('ameva-pomodoro-active-state', JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save active pomodoro state:', e);
    }
  }, [timeLeft, isRunning, isBreak, focusMinutes, breakMinutes]);

  // Save stats to localStorage
  const saveStats = (newSessions: number, newTime: number, newKeys: number, newClicks: number) => {
    try {
      const data = {
        sessions: newSessions,
        focusTime: newTime,
        keystrokes: newKeys,
        clicks: newClicks
      };
      localStorage.setItem('ameva-pomodoro-stats', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save pomodoro stats:', e);
    }
  };

  // High-performance event tracking using refs
  useEffect(() => {
    if (!isRunning || isBreak) return;

    const handleKeyDown = () => {
      keystrokesRef.current += 1;
      secondActivityRef.current = true;
    };

    const handleMouseDown = () => {
      clicksRef.current += 1;
      secondActivityRef.current = true;
    };

    // Listen on window context with passive options for maximum efficiency
    window.addEventListener('keydown', handleKeyDown, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isRunning, isBreak]);

  // Main 1-second interval timer tick
  useEffect(() => {
    let timer: any;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(t => {
          const nextTime = t - 1;
          
          if (!isBreak) {
            elapsedSecondsRef.current += 1;
            
            // Check if user was active in the current second
            if (secondActivityRef.current) {
              activeSecondsRef.current += 1;
              secondActivityRef.current = false;
            }
            
            // Sync counts to state once per second (low cost, 1 FPS rendering)
            setCurrentKeystrokes(keystrokesRef.current);
            setCurrentClicks(clicksRef.current);
            
            // Calculate WPM
            const minutesElapsed = elapsedSecondsRef.current / 60;
            if (minutesElapsed > 0.05) {
              const currentWpm = Math.round((keystrokesRef.current / 5) / minutesElapsed);
              setWpm(currentWpm);
            }
            
            // Evaluate current focus state density
            const activeRatio = activeSecondsRef.current / elapsedSecondsRef.current;
            if (activeSecondsRef.current > 0) {
              if (activeRatio > 0.5 && keystrokesRef.current > 12) {
                setFocusState('deep');
              } else if (activeRatio > 0.15 || clicksRef.current > 3) {
                setFocusState('active');
              } else {
                setFocusState('idle');
              }
            } else {
              setFocusState('idle');
            }
          }
          
          return nextTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      
      if (!isBreak) {
        // Focus session finished
        const nextSessions = sessionCount + 1;
        const nextFocusTime = totalFocusTime + focusMinutes;
        const nextKeys = totalKeystrokes + keystrokesRef.current;
        const nextClicks = totalClicks + clicksRef.current;
        
        setSessionCount(nextSessions);
        setTotalFocusTime(nextFocusTime);
        setTotalKeystrokes(nextKeys);
        setTotalClicks(nextClicks);
        saveStats(nextSessions, nextFocusTime, nextKeys, nextClicks);
        
        // Sound feedback
        playAlertSound(true);
        alert(`🎯 Focus session completed! You focused for ${focusMinutes} minutes.`);
        
        // Transition to Break Mode
        setIsBreak(true);
        setTimeLeft(breakMinutes * 60);
      } else {
        // Break session finished
        playAlertSound(false);
        alert('☕ Break time over! Ready to focus again?');
        
        // Transition to Focus Mode
        setIsBreak(false);
        setTimeLeft(focusMinutes * 60);
      }
      
      resetSessionData();
    }
    
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, isBreak, focusMinutes, breakMinutes, sessionCount, totalFocusTime, totalKeystrokes, totalClicks]);

  // Synthesize warning/alert sounds with Web Audio API (no external file files needed)
  const playAlertSound = (isSuccess: boolean) => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      
      osc.type = isSuccess ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(isSuccess ? 880 : 523, context.currentTime); // A5 or C5
      if (isSuccess) {
        osc.frequency.setValueAtTime(1320, context.currentTime + 0.12); // E6 chord
      } else {
        osc.frequency.setValueAtTime(659, context.currentTime + 0.12); // E5 chord
      }
      
      gain.gain.setValueAtTime(0.12, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start();
      osc.stop(context.currentTime + 0.4);
    } catch (e) {
      console.warn('Web Audio synthesis failed:', e);
    }
  };

  // Reset current session tracking variables
  const resetSessionData = () => {
    keystrokesRef.current = 0;
    clicksRef.current = 0;
    secondActivityRef.current = false;
    activeSecondsRef.current = 0;
    elapsedSecondsRef.current = 0;
    setCurrentKeystrokes(0);
    setCurrentClicks(0);
    setWpm(0);
    setFocusState('idle');
  };

  const handlePresetSelect = (mins: number, type: 'focus' | 'break') => {
    setIsRunning(false);
    if (type === 'focus') {
      setFocusMinutes(mins);
      if (!isBreak) setTimeLeft(mins * 60);
    } else {
      setBreakMinutes(mins);
      if (isBreak) setTimeLeft(mins * 60);
    }
    resetSessionData();
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(isBreak ? breakMinutes * 60 : focusMinutes * 60);
    resetSessionData();
  };

  const handleToggleMode = () => {
    setIsRunning(false);
    const nextMode = !isBreak;
    setIsBreak(nextMode);
    setTimeLeft(nextMode ? breakMinutes * 60 : focusMinutes * 60);
    resetSessionData();
  };

  const handleClearHistory = () => {
    if (window.confirm('모든 누적 통계 기록을 초기화하시겠습니까?')) {
      setSessionCount(0);
      setTotalFocusTime(0);
      setTotalKeystrokes(0);
      setTotalClicks(0);
      saveStats(0, 0, 0, 0);
    }
  };

  // Display formatting
  const totalSessionSeconds = isBreak ? breakMinutes * 60 : focusMinutes * 60;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  // Circle progress calculation (circumference for radius=90 is ~565)
  const strokeOffset = 565 - (timeLeft / totalSessionSeconds) * 565;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: 'var(--text-main)', padding: '4px' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '0 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            background: isBreak ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)', 
            padding: '8px', 
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            {isBreak ? <Coffee size={18} color="#fff" /> : <Timer size={18} color="#fff" />}
          </div>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0 }}>Focus & Pomodoro</h2>
            <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
              {isBreak ? '☕ 휴식 모드 기동 중' : '🎯 집중 생산성 분석'}
            </p>
          </div>
        </div>

        {/* Focus Mode indicator badge */}
        <span style={{ 
          fontSize: '11px', 
          fontWeight: 'bold', 
          padding: '4px 8px', 
          borderRadius: '20px', 
          background: isBreak ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          color: isBreak ? '#34d399' : '#f87171',
          border: isBreak ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)'
        }}>
          {isBreak ? '☕ Break' : '🎯 Focus'}
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', padding: '0 8px 8px' }}>
        
        {/* Preset Configuration Bar */}
        <div style={{ background: '#13141a', borderRadius: '8px', padding: '10px 14px', border: '1px solid #1f2029' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#9ca3af' }}>집중 시간 세팅:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {FOCUS_PRESETS.map(minsOption => (
                  <button 
                    key={minsOption}
                    onClick={() => handlePresetSelect(minsOption, 'focus')}
                    style={{
                      background: focusMinutes === minsOption && !isBreak ? 'rgba(239,68,68,0.2)' : '#1e1e24',
                      border: focusMinutes === minsOption && !isBreak ? '1px solid #ef4444' : '1px solid #2e2f38',
                      color: focusMinutes === minsOption && !isBreak ? '#f87171' : '#d1d5db',
                      fontSize: '11px', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer'
                    }}
                  >
                    {minsOption}분
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#9ca3af' }}>휴식 시간 세팅:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {BREAK_PRESETS.map(minsOption => (
                  <button 
                    key={minsOption}
                    onClick={() => handlePresetSelect(minsOption, 'break')}
                    style={{
                      background: breakMinutes === minsOption && isBreak ? 'rgba(16,185,129,0.2)' : '#1e1e24',
                      border: breakMinutes === minsOption && isBreak ? '1px solid #10b981' : '1px solid #2e2f38',
                      color: breakMinutes === minsOption && isBreak ? '#34d399' : '#d1d5db',
                      fontSize: '11px', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer'
                    }}
                  >
                    {minsOption}분
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Circular Display Dashboard */}
        <div style={{ background: '#13141a', borderRadius: '12px', border: '1px solid #1f2029', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '180px', height: '180px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '180px', height: '180px', transform: 'rotate(-90deg)' }}>
              {/* Background ring */}
              <circle cx="90" cy="90" r="80" fill="none" stroke="#22232b" strokeWidth="6" />
              {/* Active progress ring */}
              <circle 
                cx="90" 
                cy="90" 
                r="80" 
                fill="none" 
                stroke={isBreak ? '#10b981' : '#ef4444'} 
                strokeWidth="6" 
                strokeDasharray="565" 
                strokeDashoffset={strokeOffset} 
                style={{ 
                  transition: 'stroke-dashoffset 1s linear', 
                  strokeLinecap: 'round',
                  filter: isBreak ? 'drop-shadow(0 0 4px rgba(16,185,129,0.4))' : 'drop-shadow(0 0 4px rgba(239,68,68,0.4))'
                }} 
              />
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
              <span style={{ fontSize: '38px', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '-1px' }}>
                {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
              </span>
              <span style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>
                {isBreak ? 'Break Time' : 'Focus Session'}
              </span>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button 
              onClick={() => setIsRunning(!isRunning)} 
              style={{ 
                background: isRunning ? 'rgba(255,255,255,0.06)' : (isBreak ? '#10b981' : '#ef4444'), 
                border: '1px solid rgba(255,255,255,0.1)', 
                color: '#fff', 
                width: '42px', height: '42px', borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: isRunning ? 'none' : '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} style={{ transform: 'translateX(1.5px)' }} />}
            </button>
            <button 
              onClick={handleReset} 
              style={{ 
                background: 'rgba(255,255,255,0.04)', 
                border: '1px solid rgba(255,255,255,0.08)', 
                color: '#d1d5db', 
                width: '42px', height: '42px', borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                cursor: 'pointer', transition: 'all 0.2s' 
              }}
              title="타이머 리셋"
            >
              <RotateCcw size={18} />
            </button>
            <button 
              onClick={handleToggleMode}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: isBreak ? '#ef4444' : '#10b981',
                padding: '0 12px', height: '42px', borderRadius: '21px',
                fontSize: '11px', fontWeight: 'bold', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              {isBreak ? '집중 전환' : '휴식 전환'}
            </button>
          </div>
        </div>

        {/* Real-time Session Focus Metrics */}
        <div style={{ background: '#13141a', borderRadius: '12px', border: '1px solid #1f2029', padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={13} color="#ef4444" />
              <span style={{ fontSize: '12.5px', fontWeight: 'bold' }}>현재 세션 집중 지표</span>
            </div>
            
            {/* Real-time productivity badge */}
            <span style={{
              fontSize: '10.5px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px',
              background: focusState === 'deep' ? 'rgba(239,68,68,0.15)' : focusState === 'active' ? 'rgba(59,130,246,0.15)' : 'rgba(156,163,175,0.12)',
              color: focusState === 'deep' ? '#f87171' : focusState === 'active' ? '#60a5fa' : '#9ca3af',
              border: focusState === 'deep' ? '1px solid rgba(239,68,68,0.25)' : focusState === 'active' ? '1px solid rgba(59,130,246,0.25)' : '1px solid rgba(156,163,175,0.2)'
            }}>
              {focusState === 'deep' ? 'Deep Focus 🔥' : focusState === 'active' ? 'Active ⚡' : 'Idle 💤'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>키보드 타이핑</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '4px' }}>{currentKeystrokes}</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>마우스 클릭</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '4px' }}>{currentClicks}</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>실시간 타수 (WPM)</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ef4444', marginTop: '4px' }}>{wpm}</div>
            </div>
          </div>
        </div>

        {/* Aggregated Daily Statistics */}
        <div style={{ background: '#13141a', borderRadius: '12px', border: '1px solid #1f2029', padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BarChart2 size={13} color="#10b981" />
              <span style={{ fontSize: '12.5px', fontWeight: 'bold' }}>오늘의 누적 생산성</span>
            </div>
            <button 
              onClick={handleClearHistory} 
              style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title="통계 초기화"
            >
              <Trash2 size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>완료 세션</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#10b981', marginTop: '4px' }}>{sessionCount}회</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>누적 집중 시간</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#10b981', marginTop: '4px' }}>{totalFocusTime}분</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>총 동작 (키+클릭)</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#10b981', marginTop: '4px' }}>
                {totalKeystrokes + totalClicks}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
