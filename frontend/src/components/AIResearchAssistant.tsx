import { AlertCircle, BookOpen, ExternalLink, Send, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { queryAssistant } from '../api/client';
import type { AssistantResponse } from '../types/archive';

interface AIResearchAssistantProps {
  mysterySlug?: string;
  mysteryTitle?: string;
}

export function AIResearchAssistant({ mysterySlug, mysteryTitle }: AIResearchAssistantProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AssistantResponse | null>(null);

  const quickPrompts = mysteryTitle
    ? [
        `What happened in ${mysteryTitle}?`,
        `What is the strongest evidence for ${mysteryTitle}?`,
        `What do scientists believe about ${mysteryTitle}?`,
        `Which theories have been disproven for ${mysteryTitle}?`,
        `Where can I find original documents for ${mysteryTitle}?`,
      ]
    : [
        'What happened in Dyatlov Pass?',
        'What is the strongest evidence for Dark Matter?',
        'What do scientists believe about the Wow! Signal?',
        'Which theories about Atlantis have been disproven?',
        'Where can I find original documents for MH370?',
      ];

  const handleAsk = async (qText: string) => {
    const trimmed = qText.trim();
    if (!trimmed) return;
    setQuestion(trimmed);
    setLoading(true);
    try {
      const res = await queryAssistant(trimmed, mysterySlug);
      setResponse(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      aria-label="AI Research Assistant"
      className="rounded-2xl border border-[#6C9EFF]/30 bg-[#121A2B] p-6 shadow-xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6C9EFF]/15 text-[#6C9EFF]">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-editorial text-2xl font-semibold text-white">
              Archive Research Assistant
            </h3>
            <p className="text-xs text-[#A8B3CF]">
              Answers strictly from indexed primary records and peer-reviewed sources — with
              clickable citations.
            </p>
          </div>
        </div>
      </div>

      {/* Quick prompt chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => void handleAsk(prompt)}
            className="rounded-full border border-white/12 bg-[#0B1020] px-3 py-1.5 text-left text-xs text-[#CBD6F0] transition-colors hover:border-[#6C9EFF]/55 hover:text-white"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleAsk(question);
        }}
        className="mt-4 flex gap-2"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={
            mysteryTitle
              ? `Ask about evidence, theories, or original documents for ${mysteryTitle}...`
              : 'Ask about any indexed investigation or primary source...'
          }
          className="flex-1 rounded-xl border border-white/12 bg-[#0B1020] px-4 py-2.5 text-sm text-white placeholder-[#7D89A8] focus:border-[#6C9EFF] focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-[#6C9EFF] px-4 py-2.5 text-sm font-semibold text-[#0B1020] transition-opacity hover:opacity-90 disabled:opacity-45"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          <span>{loading ? 'Searching...' : 'Ask'}</span>
        </button>
      </form>

      {/* Grounded Response */}
      {response && (
        <div className="mt-5 space-y-4 rounded-xl border border-white/10 bg-[#0B1020]/90 p-5">
          <div className="whitespace-pre-line text-sm leading-relaxed text-[#E3E9F7]">
            {response.answer.split('**').map((part, idx) =>
              idx % 2 === 1 ? (
                <strong key={idx} className="font-semibold text-white">
                  {part}
                </strong>
              ) : (
                <span key={idx}>{part}</span>
              )
            )}
          </div>

          {response.missingEvidenceNotice && (
            <div className="flex items-start gap-2 rounded-lg border border-[#E5B66A]/35 bg-[#E5B66A]/10 px-3.5 py-2.5 text-xs text-[#F5D69D]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#E5B66A]" aria-hidden="true" />
              <span>{response.missingEvidenceNotice}</span>
            </div>
          )}

          <div className="text-[11px] text-[#7D89A8]">{response.confidenceNote}</div>

          {response.citations.length > 0 && (
            <div className="border-t border-white/10 pt-3">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#6C9EFF]">
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                Verified Citations ({response.citations.length})
              </div>
              <ul className="space-y-2">
                {response.citations.map((cit) => (
                  <li key={cit.sourceId}>
                    <a
                      href={cit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#121A2B] px-3 py-2 text-xs transition-colors hover:border-[#6C9EFF]/50"
                    >
                      <div className="min-w-0">
                        <span className="font-medium text-white">{cit.title}</span>
                        <span className="block truncate text-[#A8B3CF]">
                          {cit.authorOrOrg} • {cit.publicationDate} • {cit.recordTier}
                        </span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#6C9EFF]" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
