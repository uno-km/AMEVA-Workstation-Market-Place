// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, FileText, CheckCircle2, Music, Scissors, VolumeX, Settings, Play, Square, Pause, Save, RefreshCw, Download } from 'lucide-react';
import { useLLMInference } from '../../hooks/ai/useLLMInference';
import { useSTTState } from '../../../packages/core/src/renderer/stores/useSTTState';
import { removeSilence, applyNoiseReduction, trimAudio, decodeAudio, audioBufferToWav } from '../../../packages/core/src/renderer/utils/audio/AudioProcessor';

interface AudioRecord {
  id: string;
  name: string;
  blob: Blob;
  url: string;
  duration: number;
}

const STT_MODELS = [
  { id: 'ggml-tiny.bin', name: 'Whisper Tiny (매우 빠름)', url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin' },
  { id: 'ggml-small.bin', name: 'Whisper Small (빠름)', url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin' },
  { id: 'ggml-medium.bin', name: 'Whisper Medium (정확)', url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin' },
  { id: 'ggml-large-v3-turbo.bin', name: 'Whisper Turbo (정확+빠름)', url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo.bin' },
];

export default function VoiceDictationPlugin() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const [records, setRecords] = useState<AudioRecord[]>([]);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);

  const [showSettings, setShowSettings] = useState(false);
  
  // Trim Modal State
  const [trimModalOpen, setTrimModalOpen] = useState(false);
  const [trimTargetId, setTrimTargetId] = useState<string | null>(null);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [trimWaveformPeaks, setTrimWaveformPeaks] = useState<number[]>([]);
  const [trimNewName, setTrimNewName] = useState('');
  const [trimApplyNoiseReduction, setTrimApplyNoiseReduction] = useState(false);
  const [trimApplyVAD, setTrimApplyVAD] = useState(false);
  
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Audio Process Options
  const [doRemoveSilence, setDoRemoveSilence] = useState(true);
  const [doNoiseReduction, setDoNoiseReduction] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Hooks
  const { generate } = useLLMInference();
  const { settings: sttSettings, updateSettings, isAvailable, setIsAvailable } = useSTTState();

  const handleSimulateSTT = async (record: AudioRecord) => {
    setIsProcessing(true);
    setTranscript('🎤 Whisper STT 인식 중입니다... 잠시만 기다려주세요.\n\n');
    
    try {
      // 1. Convert Blob to Base64
      const arrayBuffer = await record.blob.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      
      // 2. Get temp path and write binary
      const tempPath = await window.AMEVA_CORE.ipc.sttGetTempPath();
      const writeRes = await window.AMEVA_CORE.ipc.writeBinary(tempPath, base64);
      if (!writeRes.success) {
        throw new Error(writeRes.error || '임시 오디오 파일 저장 실패');
      }

      // 3. Call Whisper STT
      const sttRes = await window.AMEVA_CORE.ipc.sttTranscribe({ 
        audioPath: tempPath, 
        language: 'ko',
        modelId: sttSettings.activeModel || 'ggml-turbo.bin'
      });
      if (!sttRes.success || !sttRes.text) {
        throw new Error(sttRes.error || 'Whisper STT 인식 결과가 없습니다.');
      }

      // 4. Summarize with LLM
      setTranscript(`[STT 원문]\n${sttRes.text}\n\n[AI 요약 중...]\n`);
      const sttText = sttRes.text;
      
      await generate(
        `다음 회의 STT 내용을 바탕으로 핵심만 마크다운으로 요약해줘:\n\n${sttText}`,
        (token) => {
          setTranscript(prev => prev + token);
        },
        'You are a helpful meeting assistant.'
      );
    } catch (err: any) {
      setTranscript(`[오류 발생] STT 처리에 실패했습니다.\n${err.message}`);
    }
    
    setIsProcessing(false);
  };

  const handleOpenTrim = async (record: AudioRecord) => {
    setTrimTargetId(record.id);
    setTrimStart(0);
    setTrimEnd(record.duration || 0);
    setTrimNewName(`[자르기] ${record.name}`);
    setTrimApplyNoiseReduction(false);
    setTrimApplyVAD(false);
    
    // Extract Waveform
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const buffer = await decodeAudio(record.blob, audioCtx);
      const channelData = buffer.getChannelData(0);
      const buckets = 150;
      const bucketSize = Math.floor(channelData.length / buckets);
      const peaks = [];
      for (let i = 0; i < buckets; i++) {
        let max = 0;
        for (let j = 0; j < bucketSize; j++) {
          const val = Math.abs(channelData[i * bucketSize + j]);
          if (val > max) max = val;
        }
        peaks.push(max);
      }
      setTrimWaveformPeaks(peaks);
      audioCtx.close();
    } catch (e) {
      console.error(e);
      setTrimWaveformPeaks([]);
    }
    
    setTrimModalOpen(true);
  };

  const handleApplyTrim = async () => {
    if (!trimTargetId) return;
    const rec = records.find(r => r.id === trimTargetId);
    if (!rec) return;
    
    setIsProcessing(true);
    setTrimModalOpen(false);
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const buffer = await decodeAudio(rec.blob, audioCtx);
      let newBuffer = trimAudio(buffer, audioCtx, trimStart, trimEnd);
      
      if (trimApplyNoiseReduction) {
        newBuffer = await applyNoiseReduction(newBuffer);
      }
      if (trimApplyVAD) {
        newBuffer = removeSilence(newBuffer, audioCtx, 0.02, 0.5);
      }
      
      const newBlob = await audioBufferToWav(newBuffer);
      const newDuration = newBuffer.length / newBuffer.sampleRate;
      audioCtx.close();
      
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(newBlob);
      });
      
      const newRecord: AudioRecord = {
        id: Date.now().toString(),
        name: trimNewName || `[자르기] ${rec.name}`,
        blob: newBlob,
        url: dataUrl,
        duration: newDuration
      };
      
      setRecords(prev => [...prev, newRecord]);
      setActiveRecordId(newRecord.id);
      handleSimulateSTT(newRecord);
    } catch (e) {
      console.error(e);
      alert('오디오 자르기에 실패했습니다.');
    }
    setIsProcessing(false);
  };

  const processAudioBlob = async (blob: Blob): Promise<{ blob: Blob, duration: number }> => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      let buffer = await decodeAudio(blob, audioCtx);
      
      if (doNoiseReduction) {
        buffer = await applyNoiseReduction(buffer);
      }
      if (doRemoveSilence) {
        buffer = removeSilence(buffer, audioCtx, 0.02, 0.5);
      }
      
      const newBlob = await audioBufferToWav(buffer);
      const duration = buffer.length / buffer.sampleRate;
      audioCtx.close();
      
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(newBlob);
      });

      return { blob: newBlob, duration, dataUrl };
    } catch (e) {
      console.error('Audio processing failed:', e);
      return { blob, duration: 0, dataUrl: '' }; // fallback to original
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        if (blob.size < 1000) {
          alert('녹음된 데이터가 너무 짧거나 마이크 입력이 없습니다. 마이크 권한과 상태를 확인해주세요.');
          setIsProcessing(false);
          return;
        }

        const { blob: processedBlob, duration, dataUrl } = await processAudioBlob(blob);
        
        if (duration === 0) {
          alert('오디오 처리 중 문제가 발생했습니다. 유효한 음성이 없습니다.');
          setIsProcessing(false);
          return;
        }

        const newRecord: AudioRecord = {
          id: Date.now().toString(),
          name: `녹음_${new Date().toLocaleTimeString()}`,
          blob: processedBlob,
          url: dataUrl || URL.createObjectURL(processedBlob),
          duration
        };
        
        setRecords(prev => [...prev, newRecord]);
        setActiveRecordId(newRecord.id);
        
        // Auto-run STT simulation
        handleSimulateSTT(newRecord);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setTranscript('');
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert('마이크 접근 권한이 없습니다.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(t => t.stop());
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const handleInsertTranscript = () => {
    if (!transcript) return;
    const editor = (window as any).AMEVA_CORE?.editor;
    if (editor) {
      const blocks = transcript.split('\n').map(line => ({ type: 'paragraph', content: line }));
      editor.insertBlocks(blocks, editor.getTextCursorPosition().block, 'after');
      alert('에디터에 회의록이 삽입되었습니다!');
    } else {
      alert('에디터를 찾을 수 없습니다.');
    }
  };

  const handleInsertAudio = async () => {
    const active = records.find(r => r.id === activeRecordId);
    if (!active) return;
    
    const editor = (window as any).AMEVA_CORE?.editor;
    if (editor) {
      // 오디오 파일을 로컬 임시 폴더에 저장하고 url을 받아 삽입 (Blob 객체 그대로 전달 불가)
      try {
        const arrayBuffer = await active.blob.arrayBuffer();
        const base64 = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        const tempPath = await window.AMEVA_CORE.ipc.sttGetTempPath();
        const savePath = tempPath.replace('audio.wav', `${active.name}.wav`);
        await window.AMEVA_CORE.ipc.writeBinary(savePath, base64);
        
        // Use file:// scheme for local files
        editor.insertBlocks([{ type: 'audio', props: { name: active.name, url: `file://${savePath}` } }], editor.getTextCursorPosition().block, 'after');
        alert(`[${active.name}] 오디오 파일이 에디터에 삽입되었습니다!`);
      } catch (e) {
        // Fallback to blob url if IPC fails
        editor.insertBlocks([{ type: 'audio', props: { name: active.name, url: active.url } }], editor.getTextCursorPosition().block, 'after');
        alert(`[${active.name}] 오디오 파일이 임시 주소로 삽입되었습니다!`);
      }
    } else {
      alert('에디터를 찾을 수 없습니다.');
    }
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    if (activeRecordId === id) {
      setActiveRecordId(null);
      setTranscript('');
    }
  };
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    const ms = Math.floor((seconds % 1) * 100).toString().padStart(2, '0');
    return seconds % 1 === 0 ? `${m}:${s}` : `${m}:${s}.${ms}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'transparent', padding: '2px', color: 'var(--text-main)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '0 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)', padding: '8px', borderRadius: '8px' }}>
            <Mic size={18} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>Voice & Meeting</h2>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>오디오 편집 및 STT 기반 회의록 요약</p>
          </div>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
          <Settings size={18} />
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: '12px', margin: '0 8px 8px', overflow: 'hidden' }}>
        
        {/* Left Panel: Record & Settings */}
        <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Recorder */}
          <div style={{ background: '#1e1e24', borderRadius: '12px', border: '1px solid var(--border-muted)', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button onClick={toggleRecording} style={{ background: isRecording ? 'rgba(239,68,68,0.2)' : 'var(--bg-glass)', border: `2px solid ${isRecording ? '#ef4444' : 'var(--border-muted)'}`, color: isRecording ? '#ef4444' : 'var(--text-main)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '16px' }}>
              {isRecording ? <Square size={24} /> : <Mic size={28} />}
            </button>
            {isRecording ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
                <span style={{ fontSize: '14px', color: '#ef4444', fontWeight: 'bold' }}>{formatTime(recordingTime)}</span>
              </div>
            ) : isProcessing ? (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>오디오 처리 중...</span>
            ) : (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>마이크를 눌러 녹음 시작</span>
            )}
            <style>{`@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
              .waveform-slider {
                -webkit-appearance: none;
                width: 100%;
                background: transparent;
                position: absolute;
                top: 0;
                pointer-events: none;
                height: 100%;
                margin: 0;
              }
              .waveform-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                pointer-events: auto;
                width: 12px;
                height: 100%;
                background: #f59e0b;
                border-radius: 4px;
                cursor: ew-resize;
                box-shadow: 0 0 4px rgba(0,0,0,0.5);
              }
            `}</style>
          </div>

          {/* Settings / STT Model selection */}
          {showSettings && (
            <div style={{ background: '#1e1e24', borderRadius: '12px', border: '1px solid var(--border-muted)', padding: '16px', fontSize: '12px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#f59e0b' }}>⚙️ STT 및 처리 설정</div>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-muted)' }}>STT 모델 선택 및 설치</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select 
                    value={sttSettings.activeModel}
                    onChange={(e) => updateSettings({ activeModel: e.target.value })}
                    style={{ flex: 1, padding: '6px', borderRadius: '4px', background: '#111218', border: '1px solid var(--border-muted)', color: 'var(--text-main)' }}
                  >
                    {STT_MODELS.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => {
                      const selected = STT_MODELS.find(m => m.id === sttSettings.activeModel);
                      if (selected && window.AMEVA_CORE.useProcessStore) {
                        const { addDownloadToQueue, downloadQueue } = window.AMEVA_CORE.useProcessStore.getState();
                        const exists = downloadQueue.find((q: any) => q.filename === selected.id);
                        if (!exists) {
                          addDownloadToQueue({
                            id: Date.now().toString(),
                            url: selected.url,
                            filename: selected.id,
                            type: 'stt',
                            status: 'pending'
                          });
                        }
                      }
                    }}
                    style={{ padding: '6px 12px', borderRadius: '4px', background: '#14b8a6', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Download size={14} /> 설치
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={doRemoveSilence} onChange={e => setDoRemoveSilence(e.target.checked)} />
                  <span>녹음 후 무음 자동 제거 (VAD)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={doNoiseReduction} onChange={e => setDoNoiseReduction(e.target.checked)} />
                  <span>배경 노이즈 캔슬링 적용</span>
                </label>
              </div>
            </div>
          )}

          {/* Recordings List */}
          <div style={{ flex: 1, background: '#1e1e24', borderRadius: '12px', border: '1px solid var(--border-muted)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-muted)', fontSize: '12px', fontWeight: 'bold' }}>녹음 목록 ({records.length})</div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
              {records.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px', marginTop: '20px' }}>저장된 녹음 파일이 없습니다.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {records.map(rec => (
                    <div 
                      key={rec.id} 
                      style={{ 
                        background: activeRecordId === rec.id ? 'rgba(20,184,166,0.1)' : 'var(--bg-glass)', 
                        border: `1px solid ${activeRecordId === rec.id ? '#14b8a6' : 'var(--border-muted)'}`, 
                        borderRadius: '6px', padding: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px'
                      }}
                      onClick={() => { setActiveRecordId(rec.id); handleSimulateSTT(rec); }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: activeRecordId === rec.id ? '#14b8a6' : 'var(--text-main)' }}>{rec.name}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={(e) => { e.stopPropagation(); handleOpenTrim(rec); }} style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', padding: '2px' }} title="구간 자르기"><Scissors size={14}/></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteRecord(rec.id); }} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '14px', cursor: 'pointer', padding: '2px' }}>✕</button>
                        </div>
                      </div>
                      <audio controls src={rec.url} style={{ width: '100%', height: '24px' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Advanced Trim Modal */}
          {trimModalOpen && trimTargetId && (() => {
            const maxDuration = records.find(r => r.id === trimTargetId)?.duration || 1;
            const maxPeak = Math.max(...trimWaveformPeaks, 0.01);
            return (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
              <div style={{ background: '#1e1e24', borderRadius: '16px', padding: '24px', width: '520px', border: '1px solid var(--border-muted)', color: 'var(--text-main)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#14b8a6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Scissors size={18} /> 고급 오디오 편집
                </h3>
                
                {/* Waveform Editor */}
                <div style={{ position: 'relative', height: '100px', background: '#111218', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' }}>
                  {trimWaveformPeaks.length > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', gap: '1px', padding: '0 6px' }}>
                      {trimWaveformPeaks.map((val, idx) => {
                        const h = (val / maxPeak) * 90;
                        return (
                          <div key={idx} style={{ flex: 1, height: `${Math.max(2, h)}px`, background: 'var(--text-muted)', borderRadius: '2px 2px 0 0' }} />
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '11px' }}>파형 분석 중...</div>
                  )}
                  
                  {/* Overlay Selection Area */}
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${(trimStart / maxDuration) * 100}%`, background: 'rgba(0,0,0,0.6)' }} />
                  <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: `${(1 - trimEnd / maxDuration) * 100}%`, background: 'rgba(0,0,0,0.6)' }} />
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${(trimStart / maxDuration) * 100}%`, right: `${(1 - trimEnd / maxDuration) * 100}%`, borderLeft: '2px solid #f59e0b', borderRight: '2px solid #f59e0b', background: 'rgba(245,158,11,0.1)' }} />
                  
                  {/* Sliders */}
                  <input type="range" min="0" max={maxDuration} step="0.01" value={trimStart} onChange={e => { const val = Number(e.target.value); if (val < trimEnd) setTrimStart(val); }} className="waveform-slider" />
                  <input type="range" min="0" max={maxDuration} step="0.01" value={trimEnd} onChange={e => { const val = Number(e.target.value); if (val > trimStart) setTrimEnd(val); }} className="waveform-slider" />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f59e0b', fontSize: '12px', fontWeight: 'bold', marginBottom: '20px', padding: '0 6px' }}>
                  <span>{formatTime(trimStart)}</span>
                  <span>{formatTime(trimEnd)}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>추출 파일명</span>
                    <input type="text" value={trimNewName} onChange={e => setTrimNewName(e.target.value)} style={{ padding: '8px', background: '#111218', border: '1px solid var(--border-muted)', color: '#fff', borderRadius: '6px' }} />
                  </label>
                  
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={trimApplyNoiseReduction} onChange={e => setTrimApplyNoiseReduction(e.target.checked)} />
                      <span>구간 내 노이즈 캔슬링 적용</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={trimApplyVAD} onChange={e => setTrimApplyVAD(e.target.checked)} />
                      <span>구간 내 무음(VAD) 제거</span>
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
                  <button onClick={() => setTrimModalOpen(false)} style={{ background: 'transparent', border: '1px solid var(--border-muted)', color: 'var(--text-main)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>취소</button>
                  <button onClick={handleApplyTrim} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>영역 추출 저장</button>
                </div>
              </div>
            </div>
            );
          })()}

        </div>

        {/* Right Panel: Transcript & Insertions */}
        <div style={{ flex: 1, background: '#1e1e24', borderRadius: '12px', border: '1px solid var(--border-muted)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FileText size={12} color="var(--text-muted)" />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Transcript & Summary</span>
            {activeRecordId && !isProcessing && (
               <button onClick={() => handleSimulateSTT(records.find(r => r.id === activeRecordId)!)} style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid var(--border-muted)', color: '#14b8a6', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>다시 요약</button>
            )}
          </div>
          
          <div style={{ flex: 1, padding: '16px', fontSize: '13px', lineHeight: '1.6', color: 'var(--text-main)', overflowY: 'auto' }}>
            {transcript ? (
              <div style={{ color: 'var(--text-main)', fontSize: '13px' }}>
                <div style={{ marginBottom: '16px', whiteSpace: 'pre-wrap' }}>
                  {transcript}
                </div>
              </div>
            ) : isProcessing ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '12px' }}>AI 요약 생성 중...</div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '12px' }}>파일을 선택하거나 녹음하면 내용이 표시됩니다.</div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div style={{ padding: '12px', borderTop: '1px solid var(--border-muted)', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '10px' }}>
            <button disabled={!transcript} onClick={handleInsertTranscript} style={{ flex: 1, background: transcript ? '#14b8a6' : 'var(--border-muted)', color: transcript ? '#fff' : 'var(--text-muted)', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: transcript ? 'pointer' : 'not-allowed' }}>
              <FileText size={14}/> 회의록(텍스트) 삽입
            </button>
            <button disabled={!activeRecordId} onClick={handleInsertAudio} style={{ flex: 1, background: activeRecordId ? '#3b82f6' : 'var(--border-muted)', color: activeRecordId ? '#fff' : 'var(--text-muted)', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: activeRecordId ? 'pointer' : 'not-allowed' }}>
              <Music size={14}/> 음성 원본 삽입
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
