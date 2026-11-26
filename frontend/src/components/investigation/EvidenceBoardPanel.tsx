import {
  Calendar,
  Check,
  ExternalLink,
  Eye,
  FileText,
  GitBranch,
  Grid,
  Image as ImageIcon,
  LayoutGrid,
  Link2,
  MessageSquarePlus,
  Pin,
  RotateCcw,
  ShieldAlert,
  StickyNote,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { TimelineEvent } from '../../types/archive';
import type {
  BoardNodePosition,
  CaseProgressState,
  ClueStance,
  ConnectionRelation,
  NotebookEntryCategory,
  UnifiedEvidenceCard,
} from '../../types/investigation';

interface EvidenceBoardPanelProps {
  caseSlug: string;
  evidenceCards: UnifiedEvidenceCard[];
  timeline: TimelineEvent[];
  state: CaseProgressState;
  highlightedCardId?: string | null;
  onClearHighlight?: () => void;
  onExamineCard: (cardId: string, isDocument: boolean) => void;
  onTogglePin: (cardId: string) => void;
  onSetStance: (cardId: string, stance: ClueStance) => void;
  onSetNote: (cardId: string, note: string) => void;
  onSetNodePosition: (cardId: string, pos: BoardNodePosition) => void;
  onAddConnection: (fromId: string, toId: string, relation: ConnectionRelation) => void;
  onRemoveConnection: (connectionId: string) => void;
  onJumpToTimelineEvent: (eventId: string) => void;
  onAddToNotebook: (entry: {
    category: NotebookEntryCategory;
    content: string;
    linkedEvidenceIds: string[];
    linkedTimelineIds: string[];
  }) => void;
}

const CARD_WIDTH = 280;
const CARD_HEIGHT = 210;

const RELATION_STYLES: Record<
  ConnectionRelation,
  { label: string; stroke: string; badgeClass: string }
> = {
  supports: {
    label: 'Supports',
    stroke: '#34D399',
    badgeClass: 'border-emerald-400/40 bg-emerald-950/80 text-emerald-300',
  },
  contradicts: {
    label: 'Contradicts',
    stroke: '#F87171',
    badgeClass: 'border-rose-400/40 bg-rose-950/80 text-rose-300',
  },
  chronology: {
    label: 'Chronology',
    stroke: '#6C9EFF',
    badgeClass: 'border-[#6C9EFF]/40 bg-[#0F172A]/90 text-[#6C9EFF]',
  },
  corroborates: {
    label: 'Corroborates',
    stroke: '#D4A853',
    badgeClass: 'border-[#D4A853]/40 bg-[#1B1710]/90 text-[#D4A853]',
  },
};

const STANCE_BADGE: Record<ClueStance, { label: string; className: string }> = {
  neutral: { label: 'Neutral', className: 'border-white/10 bg-white/5 text-[#9AA5BE]' },
  supporting: {
    label: 'Supporting',
    className: 'border-emerald-400/35 bg-emerald-500/15 text-emerald-300',
  },
  contradicting: {
    label: 'Contradicting',
    className: 'border-rose-400/35 bg-rose-500/15 text-rose-300',
  },
};

function getDefaultPosition(idx: number): BoardNodePosition {
  const col = idx % 3;
  const row = Math.floor(idx / 3);
  return {
    x: 24 + col * 316,
    y: 24 + row * 252,
  };
}

export function EvidenceBoardPanel({
  caseSlug,
  evidenceCards,
  timeline,
  state,
  highlightedCardId,
  onClearHighlight,
  onExamineCard,
  onTogglePin,
  onSetStance,
  onSetNote,
  onSetNodePosition,
  onAddConnection,
  onRemoveConnection,
  onJumpToTimelineEvent,
  onAddToNotebook,
}: EvidenceBoardPanelProps) {
  const [viewMode, setViewMode] = useState<'board' | 'grid'>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'grid' : 'board'
  );
  const [filterKind, setFilterKind] = useState<'all' | UnifiedEvidenceCard['kind']>('all');
  const [inspectedId, setInspectedId] = useState<string | null>(null);
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);
  const [pendingRelationTarget, setPendingRelationTarget] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const boardContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlightedCardId) {
      setInspectedId(highlightedCardId);
      const card = evidenceCards.find((c) => c.id === highlightedCardId);
      if (card) {
        onExamineCard(card.id, card.kind === 'document');
      }
      onClearHighlight?.();
    }
  }, [highlightedCardId, evidenceCards, onExamineCard, onClearHighlight]);

  const filteredCards = useMemo(
    () =>
      filterKind === 'all'
        ? evidenceCards
        : evidenceCards.filter((c) => c.kind === filterKind),
    [evidenceCards, filterKind]
  );

  const positions = useMemo(() => {
    const map: Record<string, BoardNodePosition> = {};
    evidenceCards.forEach((card, idx) => {
      map[card.id] = state.nodePositions[card.id] ?? getDefaultPosition(idx);
    });
    return map;
  }, [evidenceCards, state.nodePositions]);

  const boardHeight = useMemo(() => {
    const maxY = Object.values(positions).reduce((max, p) => Math.max(max, p.y), 0);
    return Math.max(620, maxY + CARD_HEIGHT + 48);
  }, [positions]);

  const inspectedCard = useMemo(
    () => evidenceCards.find((c) => c.id === inspectedId) ?? null,
    [evidenceCards, inspectedId]
  );

  const handleOpenInspect = (card: UnifiedEvidenceCard) => {
    onExamineCard(card.id, card.kind === 'document');
    setInspectedId(card.id);
  };

  const handleCardConnectClick = (cardId: string) => {
    if (!connectingFromId) {
      setConnectingFromId(cardId);
      return;
    }
    if (connectingFromId === cardId) {
      setConnectingFromId(null);
      return;
    }
    setPendingRelationTarget(cardId);
  };

  const handleConfirmRelation = (relation: ConnectionRelation) => {
    if (connectingFromId && pendingRelationTarget) {
      onAddConnection(connectingFromId, pendingRelationTarget, relation);
    }
    setConnectingFromId(null);
    setPendingRelationTarget(null);
  };

  const handlePointerDown = (e: React.PointerEvent, cardId: string) => {
    if ((e.target as HTMLElement).closest('button, a, input, textarea')) return;
    if (viewMode !== 'board' || !boardContainerRef.current) return;
    const rect = boardContainerRef.current.getBoundingClientRect();
    const pos = positions[cardId] ?? { x: 24, y: 24 };
    dragOffsetRef.current = {
      dx: e.clientX - rect.left - pos.x,
      dy: e.clientY - rect.top - pos.y,
    };
    setDraggingId(cardId);
  };

  useEffect(() => {
    if (!draggingId) return;

    const handleMove = (e: PointerEvent) => {
      if (!boardContainerRef.current) return;
      const rect = boardContainerRef.current.getBoundingClientRect();
      const maxX = Math.max(24, rect.width - CARD_WIDTH - 16);
      const nextX = Math.max(12, Math.min(maxX, e.clientX - rect.left - dragOffsetRef.current.dx));
      const nextY = Math.max(12, e.clientY - rect.top - dragOffsetRef.current.dy);
      onSetNodePosition(draggingId, { x: Math.round(nextX), y: Math.round(nextY) });
    };

    const handleUp = () => setDraggingId(null);

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [draggingId, onSetNodePosition]);

  const handleResetPositions = () => {
    evidenceCards.forEach((card, idx) => {
      onSetNodePosition(card.id, getDefaultPosition(idx));
    });
  };

  if (evidenceCards.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#0F1420] p-10 text-center">
        <FileText className="mx-auto h-8 w-8 text-[#68748F]" />
        <h3 className="mt-3 font-editorial text-xl text-white">No Evidence Exhibits Available</h3>
        <p className="mt-1 text-xs text-[#9AA5BE]">
          No primary evidence records are indexed for this case at the current level.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Quick Interactive Guide Strip */}
      <div className="grid gap-2.5 sm:grid-cols-3 rounded-xl border border-white/10 bg-[#0F1420] p-3.5 text-xs">
        <div className="flex items-center gap-2.5 rounded-lg border border-white/6 bg-[#080B12] px-3 py-2">
          <span className="font-mono-archive flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D4A853]/20 text-[10px] font-bold text-[#D4A853]">
            1
          </span>
          <span className="text-[#CBD5E1]">
            Click <strong className="text-white">Inspect</strong> on any card to read findings &amp;
            add notes
          </span>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-white/6 bg-[#080B12] px-3 py-2">
          <span className="font-mono-archive flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#6C9EFF]/20 text-[10px] font-bold text-[#6C9EFF]">
            2
          </span>
          <span className="text-[#CBD5E1]">
            Click <strong className="text-white">Connect</strong> on two cards to draw a clue link
          </span>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-white/6 bg-[#080B12] px-3 py-2">
          <span className="font-mono-archive flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-300">
            3
          </span>
          <span className="text-[#CBD5E1]">
            Flag clues as <strong className="text-emerald-300">Supporting</strong> or{' '}
            <strong className="text-rose-300">Contradicting</strong>
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0F1420] p-4">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'all', label: `All (${evidenceCards.length})` },
              { id: 'primary', label: 'Primary Evidence' },
              { id: 'photograph', label: 'Photographs' },
              { id: 'document', label: 'Documents' },
              { id: 'fact', label: 'Observations' },
              { id: 'gap', label: 'Open Gaps' },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterKind(f.id)}
              className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                filterKind === f.id
                  ? 'border-[#D4A853] bg-[#D4A853]/15 text-[#D4A853]'
                  : 'border-white/10 bg-[#080B12] text-[#9AA5BE] hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {connectingFromId && (
            <span className="font-mono-archive inline-flex items-center gap-2 rounded-md border border-[#D4A853]/50 bg-[#D4A853]/15 px-3 py-1.5 text-[11px] text-[#D4A853]">
              <GitBranch className="h-3.5 w-3.5" />
              Select target card to connect
              <button
                type="button"
                onClick={() => setConnectingFromId(null)}
                className="ml-1 rounded bg-black/30 px-1.5 py-0.5 text-[10px] text-white hover:bg-black/50"
              >
                Cancel
              </button>
            </span>
          )}

          <div className="inline-flex rounded-lg border border-white/10 bg-[#080B12] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 ${
                viewMode === 'board' ? 'bg-[#1A2234] text-[#D4A853]' : 'text-[#9AA5BE]'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Pinboard
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 ${
                viewMode === 'grid' ? 'bg-[#1A2234] text-[#D4A853]' : 'text-[#9AA5BE]'
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              Accessible Grid
            </button>
          </div>

          {viewMode === 'board' && (
            <button
              type="button"
              onClick={handleResetPositions}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#080B12] px-3 py-1.5 text-xs text-[#CBD5E1] hover:border-[#D4A853]/40"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Align Cards
            </button>
          )}
        </div>
      </div>

      {/* Interactive Pinboard Canvas or Accessible Grid */}
      {viewMode === 'board' ? (
        <div
          ref={boardContainerRef}
          style={{ minHeight: `${boardHeight}px` }}
          className="archive-grid-bg relative overflow-x-auto rounded-xl border border-white/12 bg-[#0B0F1A]"
        >
          <div className="sticky top-0 left-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0B0F1A]/90 px-4 py-2 backdrop-blur-xs">
            <span className="font-mono-archive text-[10px] uppercase tracking-wider text-[#9AA5BE]">
              Drag cards to arrange · Use &ldquo;Connect&rdquo; to draw forensic links · Click
              &ldquo;Inspect&rdquo; to examine full records
            </span>
            <span className="font-mono-archive text-[10px] text-[#68748F]">
              BOARD // {caseSlug.toUpperCase()}
            </span>
          </div>

          <div className="relative min-w-[960px]" style={{ height: `${boardHeight - 36}px` }}>
            {/* SVG Connection Lines */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              {state.connections.map((conn) => {
                const fromPos = positions[conn.fromId];
                const toPos = positions[conn.toId];
                if (!fromPos || !toPos) return null;
                const x1 = fromPos.x + CARD_WIDTH / 2;
                const y1 = fromPos.y + CARD_HEIGHT / 2;
                const x2 = toPos.x + CARD_WIDTH / 2;
                const y2 = toPos.y + CARD_HEIGHT / 2;
                const style = RELATION_STYLES[conn.relation];
                return (
                  <g key={conn.id}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={style.stroke}
                      strokeWidth={2}
                      strokeDasharray={conn.relation === 'contradicts' ? '6 4' : undefined}
                      strokeOpacity={0.75}
                    />
                    <circle cx={x1} cy={y1} r={4} fill={style.stroke} />
                    <circle cx={x2} cy={y2} r={4} fill={style.stroke} />
                  </g>
                );
              })}
            </svg>

            {/* Connection Midpoint Labels */}
            {state.connections.map((conn) => {
              const fromPos = positions[conn.fromId];
              const toPos = positions[conn.toId];
              if (!fromPos || !toPos) return null;
              const mx = (fromPos.x + toPos.x + CARD_WIDTH) / 2;
              const my = (fromPos.y + toPos.y + CARD_HEIGHT) / 2;
              const style = RELATION_STYLES[conn.relation];
              return (
                <button
                  key={`${conn.id}-label`}
                  type="button"
                  onClick={() => onRemoveConnection(conn.id)}
                  title="Click to remove connection"
                  style={{ left: `${mx}px`, top: `${my}px`, transform: 'translate(-50%, -50%)' }}
                  className={`font-mono-archive absolute z-10 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold shadow-md transition-transform hover:scale-105 ${style.badgeClass}`}
                >
                  {style.label}
                  <X className="h-2.5 w-2.5" />
                </button>
              );
            })}

            {/* Positioned Cards */}
            {filteredCards.map((card) => {
              const pos = positions[card.id] ?? { x: 24, y: 24 };
              const pinned = state.pinnedIds.includes(card.id);
              const examined = state.examinedEvidenceIds.includes(card.id);
              const stance = state.clueStances[card.id] ?? 'neutral';
              const hasNote = Boolean(state.clueNotes[card.id]?.trim());
              const isConnectingSource = connectingFromId === card.id;

              return (
                <div
                  key={card.id}
                  onPointerDown={(e) => handlePointerDown(e, card.id)}
                  style={{
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    width: `${CARD_WIDTH}px`,
                  }}
                  className={`absolute select-none rounded-xl border p-3.5 shadow-xl transition-colors cursor-grab active:cursor-grabbing ${
                    isConnectingSource
                      ? 'z-30 border-[#6C9EFF] bg-[#141E33] ring-2 ring-[#6C9EFF]/40'
                      : connectingFromId
                      ? 'z-20 border-dashed border-[#D4A853]/70 bg-[#121826] hover:border-[#D4A853]'
                      : pinned
                      ? 'z-20 border-[#D4A853] bg-[#141A29]'
                      : 'z-10 border-white/12 bg-[#0F1420] hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-archive truncate rounded bg-white/6 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#6C9EFF]">
                      {card.classification}
                    </span>
                    <div className="flex items-center gap-1">
                      {examined && (
                        <span title="Examined" className="text-emerald-400">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => onTogglePin(card.id)}
                        aria-label={pinned ? 'Unpin clue' : 'Pin clue'}
                        className={`rounded p-1 ${
                          pinned ? 'text-[#D4A853]' : 'text-[#68748F] hover:text-white'
                        }`}
                      >
                        <Pin className={`h-3.5 w-3.5 ${pinned ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {card.imageUrl && (
                    <img
                      src={card.imageUrl}
                      alt={card.title}
                      className="mt-2 h-20 w-full rounded-lg border border-white/10 object-cover"
                    />
                  )}

                  <h4 className="mt-2 line-clamp-2 font-editorial text-lg font-semibold leading-snug text-white">
                    {card.title}
                  </h4>
                  <p className="font-mono-archive mt-0.5 truncate text-[10px] text-[#D4A853]">
                    {card.sourceLabel} · {card.dateLabel}
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-[#CBD5E1]">
                    {card.summary}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-1.5 border-t border-white/8 pt-2.5">
                    <span
                      className={`font-mono-archive rounded border px-1.5 py-0.5 text-[9px] font-semibold ${STANCE_BADGE[stance].className}`}
                    >
                      {STANCE_BADGE[stance].label}
                    </span>

                    <div className="flex items-center gap-1">
                      {hasNote && (
                        <span title="Has personal note" className="text-[#D4A853]">
                          <StickyNote className="h-3.5 w-3.5" />
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCardConnectClick(card.id)}
                        className={`rounded border px-2 py-1 text-[10px] font-medium transition-colors ${
                          isConnectingSource
                            ? 'border-[#6C9EFF] bg-[#6C9EFF]/20 text-white'
                            : 'border-white/10 bg-[#080B12] text-[#9AA5BE] hover:text-white'
                        }`}
                      >
                        {connectingFromId && connectingFromId !== card.id ? 'Link Here' : 'Connect'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenInspect(card)}
                        className="inline-flex items-center gap-1 rounded bg-[#D4A853]/15 px-2 py-1 text-[10px] font-semibold text-[#D4A853] hover:bg-[#D4A853]/25"
                      >
                        <Eye className="h-3 w-3" />
                        Inspect
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Accessible Grid / Mobile View */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCards.map((card) => {
            const pinned = state.pinnedIds.includes(card.id);
            const examined = state.examinedEvidenceIds.includes(card.id);
            const stance = state.clueStances[card.id] ?? 'neutral';
            const isConnectingSource = connectingFromId === card.id;

            return (
              <div
                key={card.id}
                className={`flex flex-col justify-between rounded-xl border p-4 ${
                  isConnectingSource
                    ? 'border-[#6C9EFF] bg-[#141E33]'
                    : pinned
                    ? 'border-[#D4A853] bg-[#141A29]'
                    : 'border-white/12 bg-[#0F1420]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-archive truncate rounded bg-white/6 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#6C9EFF]">
                      {card.classification}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {examined && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                      <button
                        type="button"
                        onClick={() => onTogglePin(card.id)}
                        aria-label={pinned ? 'Unpin clue' : 'Pin clue'}
                        className={pinned ? 'text-[#D4A853]' : 'text-[#68748F] hover:text-white'}
                      >
                        <Pin className={`h-4 w-4 ${pinned ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {card.imageUrl && (
                    <img
                      src={card.imageUrl}
                      alt={card.title}
                      className="mt-2.5 h-32 w-full rounded-lg border border-white/10 object-cover"
                    />
                  )}

                  <h4 className="mt-3 font-editorial text-xl font-semibold text-white">
                    {card.title}
                  </h4>
                  <p className="font-mono-archive mt-0.5 text-[11px] text-[#D4A853]">
                    {card.sourceLabel} · {card.dateLabel}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-[#CBD5E1]">{card.summary}</p>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-3">
                  <span
                    className={`font-mono-archive rounded border px-2 py-0.5 text-[10px] font-semibold ${STANCE_BADGE[stance].className}`}
                  >
                    {STANCE_BADGE[stance].label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCardConnectClick(card.id)}
                      className="rounded-md border border-white/12 bg-[#080B12] px-2.5 py-1 text-xs text-[#CBD5E1] hover:border-[#6C9EFF]/50"
                    >
                      {connectingFromId && connectingFromId !== card.id ? 'Link Here' : 'Connect'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenInspect(card)}
                      className="inline-flex items-center gap-1 rounded-md bg-[#D4A853] px-3 py-1 text-xs font-semibold text-[#080B12]"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Inspect
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active Connections List */}
      {state.connections.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-[#0F1420] p-4">
          <div className="font-mono-archive mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-[#D4A853]">
            <Link2 className="h-3.5 w-3.5" />
            Mapped Clue Connections ({state.connections.length})
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {state.connections.map((conn) => {
              const fromCard = evidenceCards.find((c) => c.id === conn.fromId);
              const toCard = evidenceCards.find((c) => c.id === conn.toId);
              if (!fromCard || !toCard) return null;
              const style = RELATION_STYLES[conn.relation];
              return (
                <div
                  key={conn.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-white/8 bg-[#080B12] px-3 py-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-white">{fromCard.title}</div>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span
                        className={`font-mono-archive rounded border px-1.5 py-0.5 text-[9px] font-semibold ${style.badgeClass}`}
                      >
                        {style.label}
                      </span>
                      <span className="truncate text-[11px] text-[#9AA5BE]">{toCard.title}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveConnection(conn.id)}
                    aria-label="Remove connection"
                    className="rounded p-1 text-[#68748F] hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Connection Relation Modal */}
      {connectingFromId && pendingRelationTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Choose clue connection relationship"
        >
          <div className="w-full max-w-md rounded-xl border border-white/15 bg-[#0F1420] p-6 shadow-2xl">
            <h3 className="font-editorial text-2xl font-semibold text-white">
              Define Clue Relationship
            </h3>
            <p className="mt-1 text-xs text-[#9AA5BE]">
              How do these two pieces of evidence relate in your investigation?
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {(Object.keys(RELATION_STYLES) as ConnectionRelation[]).map((rel) => (
                <button
                  key={rel}
                  type="button"
                  onClick={() => handleConfirmRelation(rel)}
                  className={`rounded-lg border px-3 py-2.5 text-xs font-semibold transition-colors hover:brightness-110 ${RELATION_STYLES[rel].badgeClass}`}
                >
                  {RELATION_STYLES[rel].label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setConnectingFromId(null);
                setPendingRelationTarget(null);
              }}
              className="mt-4 w-full rounded-lg border border-white/10 bg-[#080B12] py-2 text-xs text-[#9AA5BE] hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Evidence Inspection Modal */}
      {inspectedCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label={`Inspect ${inspectedCard.title}`}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/15 bg-[#0B0F1A] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="font-mono-archive inline-flex items-center gap-1.5 rounded bg-[#6C9EFF]/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#6C9EFF]">
                  {inspectedCard.kind === 'photograph' ? (
                    <ImageIcon className="h-3 w-3" />
                  ) : inspectedCard.kind === 'gap' ? (
                    <ShieldAlert className="h-3 w-3" />
                  ) : (
                    <FileText className="h-3 w-3" />
                  )}
                  {inspectedCard.classification}
                </span>
                <h3 className="mt-2 font-editorial text-2xl font-semibold text-white">
                  {inspectedCard.title}
                </h3>
                <p className="font-mono-archive mt-0.5 text-xs text-[#D4A853]">
                  Source: {inspectedCard.sourceLabel} · {inspectedCard.dateLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectedId(null)}
                aria-label="Close exhibit inspection"
                className="rounded-lg border border-white/10 bg-[#0F1420] p-2 text-[#9AA5BE] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {inspectedCard.imageUrl && (
              <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#080B12]">
                <img
                  src={inspectedCard.imageUrl}
                  alt={inspectedCard.title}
                  className="max-h-72 w-full object-cover"
                />
              </div>
            )}

            <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#D8E0F4]">
              <p>{inspectedCard.summary}</p>
              {inspectedCard.detailFinding && (
                <div className="rounded-xl border border-white/10 bg-[#0F1420] p-4 text-xs leading-relaxed text-[#E2E8F0] whitespace-pre-line">
                  <strong className="font-mono-archive block uppercase tracking-wider text-[#6C9EFF] mb-1">
                    Documented Finding / Measurement
                  </strong>
                  {inspectedCard.detailFinding}
                </div>
              )}
            </div>

            {inspectedCard.externalUrl && (
              <div className="mt-4">
                <a
                  href={inspectedCard.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#6C9EFF]/35 bg-[#6C9EFF]/10 px-3.5 py-2 text-xs font-semibold text-[#6C9EFF] hover:bg-[#6C9EFF]/20"
                >
                  Open Original Archival Record
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}

            {/* Stance & Pin Controls */}
            <div className="mt-5 rounded-xl border border-white/10 bg-[#0F1420] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono-archive text-[10px] font-semibold uppercase tracking-wider text-[#9AA5BE]">
                  Classify Clue Stance
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(['supporting', 'contradicting', 'neutral'] as ClueStance[]).map((st) => {
                    const active = (state.clueStances[inspectedCard.id] ?? 'neutral') === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => onSetStance(inspectedCard.id, st)}
                        className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors ${
                          active
                            ? STANCE_BADGE[st].className
                            : 'border-white/10 bg-[#080B12] text-[#9AA5BE] hover:text-white'
                        }`}
                      >
                        {STANCE_BADGE[st].label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="clue-personal-note"
                  className="font-mono-archive block text-[10px] font-semibold uppercase tracking-wider text-[#9AA5BE] mb-1.5"
                >
                  Personal Evidence Note
                </label>
                <textarea
                  id="clue-personal-note"
                  rows={2}
                  value={state.clueNotes[inspectedCard.id] ?? ''}
                  onChange={(e) => onSetNote(inspectedCard.id, e.target.value)}
                  placeholder="Record observations, anomalies, or questions about this record..."
                  className="w-full rounded-lg border border-white/12 bg-[#080B12] p-2.5 text-xs text-white placeholder-[#68748F] focus:border-[#D4A853] focus:outline-none"
                />
              </div>
            </div>

            {/* Cross-linked Timeline Events */}
            {inspectedCard.relatedTimelineIds.length > 0 && (
              <div className="mt-4 rounded-xl border border-white/10 bg-[#0F1420] p-4">
                <div className="font-mono-archive mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#D4A853]">
                  <Calendar className="h-3.5 w-3.5" />
                  Related Timeline Events
                </div>
                <div className="flex flex-wrap gap-2">
                  {inspectedCard.relatedTimelineIds.map((tid) => {
                    const ev = timeline.find((t) => t.id === tid);
                    if (!ev) return null;
                    return (
                      <button
                        key={tid}
                        type="button"
                        onClick={() => {
                          setInspectedId(null);
                          onJumpToTimelineEvent(tid);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#080B12] px-3 py-1.5 text-xs text-[#CBD5E1] hover:border-[#D4A853]/50 hover:text-white"
                      >
                        <span className="font-mono-archive text-[#D4A853]">{ev.yearLabel}</span>
                        <span>· {ev.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => {
                  onAddToNotebook({
                    category: 'reference',
                    content: `Examined "${inspectedCard.title}" (${inspectedCard.sourceLabel}, ${inspectedCard.dateLabel}). ${
                      state.clueNotes[inspectedCard.id] || inspectedCard.detailFinding || ''
                    }`.trim(),
                    linkedEvidenceIds: [inspectedCard.id],
                    linkedTimelineIds: inspectedCard.relatedTimelineIds,
                  });
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#0F1420] px-3.5 py-2 text-xs font-medium text-[#CBD5E1] hover:border-[#D4A853]/50 hover:text-white"
              >
                <MessageSquarePlus className="h-3.5 w-3.5 text-[#D4A853]" />
                Log to Personal Notebook
              </button>

              <button
                type="button"
                onClick={() => setInspectedId(null)}
                className="rounded-lg bg-[#D4A853] px-5 py-2 text-xs font-semibold text-[#080B12] hover:bg-[#e3ba68]"
              >
                Done Inspecting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
