// @ts-nocheck
import React, { useState, useEffect } from 'react'

export function KanbanBoard() {
  const [tasks, setTasks] = useState([])
  const [editor, setEditor] = useState(null)

  // AMEVA_CORE에서 editor 인스턴스를 폴링으로 획득 (DynamicRemotePluginLoader가 props를 넘기지 않으므로)
  useEffect(() => {
    const tryGetEditor = () => {
      const core = (window as any).AMEVA_CORE
      if (core && core.editor) {
        setEditor(core.editor)
        return true
      }
      return false
    }

    if (!tryGetEditor()) {
      const interval = setInterval(() => {
        if (tryGetEditor()) clearInterval(interval)
      }, 500)
      return () => clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!editor) return

    // 재귀적으로 체크리스트 블록 추출
    const extractChecklists = (blocks: any[]) => {
      let list: any[] = []
      for (const block of blocks) {
        if (block.type === 'checkListItem') {
          list.push(block)
        }
        if (block.children && block.children.length > 0) {
          list.push(...extractChecklists(block.children))
        }
      }
      return list
    }

    const loadTasks = () => {
      try {
        const allBlocks = editor.document
        const checklists = extractChecklists(allBlocks)
        setTasks(checklists)
      } catch (e) {
        console.error('[KanbanBoard] Failed to load tasks:', e)
      }
    }

    loadTasks()

    // 에디터 변경 시 즉각 반영
    try {
      const unsubscribe = editor.onDocumentChange(() => {
        loadTasks()
      })
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe()
      }
    } catch (e) {
      // onDocumentChange가 없는 경우 폴링 폴백
      const interval = setInterval(loadTasks, 2000)
      return () => clearInterval(interval)
    }
  }, [editor])

  // Drag & Drop 핸들러
  const onDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const onDrop = (e: React.DragEvent, targetStatus: boolean) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (!taskId || !editor) return

    const task = tasks.find((t: any) => t.id === taskId)
    if (!task || task.props.checked === targetStatus) return

    try {
      editor.updateBlock(taskId, {
        props: { ...task.props, checked: targetStatus }
      })
      setTasks((prev: any[]) => prev.map((t: any) =>
        t.id === taskId ? { ...t, props: { ...t.props, checked: targetStatus } } : t
      ))
    } catch (e) {
      console.error('[KanbanBoard] Failed to update block:', e)
    }
  }

  const todoTasks = tasks.filter((t: any) => !t.props?.checked)
  const doneTasks = tasks.filter((t: any) => t.props?.checked)

  const renderContent = (block: any) => {
    if (Array.isArray(block.content)) {
      return block.content.map((c: any) => c.text || '').join('')
    }
    if (typeof block.content === 'string') return block.content
    return '내용 없음'
  }

  if (!editor) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%', flexDirection: 'column', gap: '12px',
        color: 'var(--text-muted)', background: 'var(--bg-editor)'
      }}>
        <div style={{
          width: '36px', height: '36px', border: '3px solid rgba(139,92,246,0.3)',
          borderTop: '3px solid #8b5cf6', borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: '12px' }}>에디터 연결 대기 중...</span>
      </div>
    )
  }

  return (
    <div style={{
      padding: '20px', height: '100%', display: 'flex', flexDirection: 'column',
      color: 'var(--text-main)', background: 'var(--bg-editor)', overflow: 'auto', boxSizing: 'border-box'
    }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
          padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
          </svg>
        </div>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>칸반 보드</h2>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
            에디터의 체크리스트 블록과 실시간 동기화됩니다
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', fontSize: '11px' }}>
          <span style={{
            background: 'rgba(239,68,68,0.15)', color: '#ef4444',
            padding: '3px 10px', borderRadius: '20px', fontWeight: 600
          }}>
            할 일 {todoTasks.length}
          </span>
          <span style={{
            background: 'rgba(52,211,153,0.15)', color: '#34d399',
            padding: '3px 10px', borderRadius: '20px', fontWeight: 600
          }}>
            완료 {doneTasks.length}
          </span>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: '12px', color: 'var(--text-muted)'
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" opacity="0.3">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
          </svg>
          <p style={{ fontSize: '12px', textAlign: 'center', maxWidth: '220px', lineHeight: 1.6 }}>
            에디터에 체크리스트 블록을 추가하면<br/>자동으로 칸반 카드가 생성됩니다.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
          {/* To Do 컬럼 */}
          <div
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, false)}
            style={{
              flex: 1, background: 'rgba(239,68,68,0.04)',
              border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: '12px', padding: '14px',
              display: 'flex', flexDirection: 'column', overflowY: 'auto',
              transition: 'background 0.2s'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>📋</span>
                <h3 style={{ fontSize: '13px', fontWeight: 'bold', margin: 0 }}>To Do</h3>
              </div>
              <span style={{
                fontSize: '10px', background: 'rgba(239,68,68,0.2)',
                color: '#ef4444', padding: '2px 8px', borderRadius: '10px', fontWeight: 600
              }}>
                {todoTasks.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {todoTasks.map((task: any) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, task.id)}
                  onDragEnd={(e) => { e.currentTarget.style.opacity = '1' }}
                  onDragStartCapture={(e) => { e.currentTarget.style.opacity = '0.5' }}
                  style={{
                    background: 'var(--bg-sidebar)', padding: '12px 14px',
                    borderRadius: '8px', cursor: 'grab',
                    border: '1px solid var(--border-muted)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.1s, box-shadow 0.1s',
                    fontSize: '12px', lineHeight: 1.5
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <span style={{ marginRight: '6px', opacity: 0.5 }}>☐</span>
                  {renderContent(task)}
                </div>
              ))}
              {todoTasks.length === 0 && (
                <div style={{
                  textAlign: 'center', color: 'var(--text-muted)',
                  fontSize: '11px', padding: '20px',
                  border: '2px dashed rgba(239,68,68,0.2)', borderRadius: '8px'
                }}>
                  카드를 여기로 드래그하세요
                </div>
              )}
            </div>
          </div>

          {/* Done 컬럼 */}
          <div
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, true)}
            style={{
              flex: 1, background: 'rgba(52,211,153,0.04)',
              border: '1px solid rgba(52,211,153,0.15)',
              borderRadius: '12px', padding: '14px',
              display: 'flex', flexDirection: 'column', overflowY: 'auto',
              transition: 'background 0.2s'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>✅</span>
                <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#4ade80', margin: 0 }}>Done</h3>
              </div>
              <span style={{
                fontSize: '10px', background: 'rgba(52,211,153,0.2)',
                color: '#34d399', padding: '2px 8px', borderRadius: '10px', fontWeight: 600
              }}>
                {doneTasks.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {doneTasks.map((task: any) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, task.id)}
                  onDragEnd={(e) => { e.currentTarget.style.opacity = '1' }}
                  onDragStartCapture={(e) => { e.currentTarget.style.opacity = '0.5' }}
                  style={{
                    background: 'var(--bg-sidebar)', padding: '12px 14px',
                    borderRadius: '8px', cursor: 'grab',
                    border: '1px solid var(--border-muted)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)', opacity: 0.65,
                    fontSize: '12px', lineHeight: 1.5
                  }}
                >
                  <span style={{ marginRight: '6px', color: '#34d399' }}>✓</span>
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                    {renderContent(task)}
                  </span>
                </div>
              ))}
              {doneTasks.length === 0 && (
                <div style={{
                  textAlign: 'center', color: 'var(--text-muted)',
                  fontSize: '11px', padding: '20px',
                  border: '2px dashed rgba(52,211,153,0.2)', borderRadius: '8px'
                }}>
                  완료된 카드를 여기로 드래그하세요
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
