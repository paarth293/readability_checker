import { ReadabilityClient } from '../worker/client';
import { AnalysisResult } from '../core/index';

const MAX_WORDS = 100_000;
const client = new ReadabilityClient();

// Escape HTML to prevent XSS when inserting user text
function escHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Format numbers with commas
function fmt(n: number): string {
  return n.toLocaleString();
}

// Count words in a string
function wordCount(t: string): number {
  return t.trim() ? t.trim().split(/\s+/).length : 0;
}

const RANK_COLORS: Record<number, string> = {
  1: '#ef4444',
  2: '#f97316',
  3: '#eab308',
  4: '#84cc16',
  5: '#6366f1',
};

export function setupApp(root: HTMLElement) {
  let text = '';

  // ─── TOP BAR (persists across views) ───────────────────────────────────────
  const topBar = document.createElement('header');
  topBar.className = 'top-bar';
  topBar.setAttribute('role', 'banner');
  topBar.innerHTML = `
    <div class="top-bar__inner">
      <a class="brand" href="/" aria-label="Chapter Readability Checker — home">
        <div class="brand__icon" aria-hidden="true">📖</div>
        <div>
          <div class="brand__name">Readability Checker</div>
          <div class="brand__tagline">For authors, by privacy</div>
        </div>
      </a>
      <div class="privacy-badge" title="Your text never leaves your browser">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        100% Private
      </div>
    </div>
  `;

  const viewSlot = document.createElement('div');
  viewSlot.className = 'page-shell';
  viewSlot.style.cssText = 'flex:1;display:flex;flex-direction:column;';

  const footer = document.createElement('footer');
  footer.className = 'page-footer';
  footer.innerHTML = `Text never leaves your browser &mdash; analyzed entirely on your device.`;

  root.style.cssText = 'display:flex;flex-direction:column;min-height:100dvh;';
  root.appendChild(topBar);
  root.appendChild(viewSlot);
  root.appendChild(footer);

  // ─── INPUT VIEW ────────────────────────────────────────────────────────────
  const renderInput = () => {
    const wc = wordCount(text);

    viewSlot.innerHTML = `
      <div class="input-page">

        <section class="hero" aria-labelledby="hero-title">
          <div class="hero__eyebrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            Chapter Analysis
          </div>
          <h1 class="hero__title" id="hero-title">Know exactly where<br>readers lose the thread.</h1>
          <p class="hero__subtitle">
            Paste a chapter and instantly see its readability score — with the five hardest sentences highlighted, ranked, and explained.
          </p>
          <div class="hero__pills" role="list">
            <span class="pill" role="listitem">✦ Flesch Reading Ease</span>
            <span class="pill" role="listitem">✦ Grade Level</span>
            <span class="pill" role="listitem">✦ Fog Index</span>
            <span class="pill" role="listitem">✦ 5 Hardest Sentences</span>
            <span class="pill" role="listitem">✦ Works Offline</span>
          </div>
        </section>

        <div class="editor-section">
          <div class="editor-card" role="region" aria-label="Text editor">

            <div class="editor-toolbar">
              <label for="chapter-input" class="editor-toolbar__label">Paste your chapter</label>
              <div class="word-count-badge" id="wc-badge" aria-live="polite">
                ${wc > 0 ? `${fmt(wc)} words` : 'Start typing…'}
              </div>
            </div>

            <textarea
              id="chapter-input"
              placeholder="Once upon a time, in a city that never quite managed to sleep…"
              aria-label="Chapter text input"
              spellcheck="true"
            >${escHtml(text)}</textarea>

            <div class="editor-footer">
              <div class="editor-footer__left">
                <span class="hint" aria-hidden="true">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Instant analysis up to ${fmt(MAX_WORDS)} words
                </span>
              </div>
              <div id="error-msg" class="error-msg" role="alert" aria-live="polite"></div>
              <div class="editor-footer__actions">
                <button id="clear-btn" class="btn btn--ghost btn--sm" type="button" aria-label="Clear text">Clear</button>
                <button id="analyze-btn" class="btn btn--primary" type="button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  Analyze Chapter
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    `;

    const textarea = document.getElementById('chapter-input') as HTMLTextAreaElement;
    const analyzeBtn = document.getElementById('analyze-btn') as HTMLButtonElement;
    const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
    const errorMsg = document.getElementById('error-msg') as HTMLDivElement;
    const wcBadge = document.getElementById('wc-badge') as HTMLSpanElement;

    // Restore cursor position preference
    textarea.value = text;
    textarea.focus();

    textarea.addEventListener('input', (e) => {
      text = (e.target as HTMLTextAreaElement).value;
      const wc = wordCount(text);
      wcBadge.textContent = wc > 0 ? `${fmt(wc)} words` : 'Start typing…';
    });

    clearBtn.addEventListener('click', () => {
      text = '';
      renderInput();
    });

    analyzeBtn.addEventListener('click', () => {
      void (async () => {
        errorMsg.textContent = '';

        if (!text.trim()) {
          errorMsg.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Please paste some text first.`;
          textarea.focus();
          return;
        }

        if (wordCount(text) > MAX_WORDS) {
          errorMsg.textContent = `Input exceeds the ${fmt(MAX_WORDS)}-word limit.`;
          return;
        }

        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = `<span class="btn__spinner" aria-hidden="true"></span> Analyzing…`;

        try {
          const result = await client.analyze(text);
          renderResults(result);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Unknown error.';
          errorMsg.textContent = `Analysis failed: ${msg}`;
        } finally {
          analyzeBtn.disabled = false;
          analyzeBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Analyze Chapter`;
        }
      })();
    });
  };

  // ─── RESULTS VIEW ──────────────────────────────────────────────────────────
  const renderResults = (result: AnalysisResult) => {
    // Build annotated HTML by inserting <mark> elements at sentence offsets
    const sorted = [...result.hardestSentences].sort((a, b) => a.startOffset - b.startOffset);
    let html = '';
    let cursor = 0;

    for (const s of sorted) {
      html += escHtml(text.slice(cursor, s.startOffset));
      const color = RANK_COLORS[s.rank] ?? '#6366f1';
      html +=
        `<mark class="hl hl--${s.rank}" id="sentence-${s.rank}" data-rank="${s.rank}" tabindex="0"
                     aria-label="Rank ${s.rank} hardest sentence"
                     style="--hl-color:${color}">` +
        `<span class="hl__badge" aria-hidden="true">${s.rank}</span>` +
        escHtml(text.slice(s.startOffset, s.endOffset)) +
        `</mark>`;
      cursor = s.endOffset;
    }
    html += escHtml(text.slice(cursor));
    // Convert newlines to visible breaks
    html = html.replace(/\n/g, '<br>');

    // Score gauge position (0–100 → 0–100%)
    const score = Math.max(0, Math.min(100, result.headlineScore.score));
    const gaugePos = score;

    // Hard sentence list
    const hardListHTML =
      result.hardestSentences.length === 0
        ? `<div class="empty-state">🎉 No notably hard sentences found!</div>`
        : `<ul class="hard-list" aria-label="Hardest sentences list">
          ${result.hardestSentences
            .map(
              (s) => `
            <li class="hard-item" data-jump="${s.rank}" role="button" tabindex="0"
                aria-label="Jump to rank ${s.rank} sentence">
              <div class="hard-item__rank rank--${s.rank}" aria-hidden="true">${s.rank}</div>
              <div class="hard-item__body">
                <div class="hard-item__text">${escHtml(s.text)}</div>
                <div class="reasons">
                  ${s.reasons.map((r) => `<span class="reason-tag">${escHtml(r.label)}</span>`).join('')}
                </div>
              </div>
            </li>
          `,
            )
            .join('')}
        </ul>`;

    // Warnings banner
    const warningsHTML =
      result.warnings.length > 0
        ? `<div class="warnings" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <div>${result.warnings.map(escHtml).join('<br>')}</div>
        </div>`
        : '';

    const readingTime =
      result.metrics.readingTimeMinutes < 1
        ? '< 1 min'
        : `${result.metrics.readingTimeMinutes} min`;

    viewSlot.innerHTML = `
      <div class="results-page">

        <div class="results-topbar">
          <div>
            <h2>Analysis Results</h2>
            <span style="font-size:0.8125rem;color:var(--color-text-muted);">${fmt(result.metrics.wordCount)} words · ${fmt(result.metrics.sentenceCount)} sentences</span>
          </div>
          <button id="back-btn" class="btn btn--ghost btn--sm" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
            Edit Text
          </button>
        </div>

        <div class="results-body">

          <!-- LEFT: Annotated text -->
          <div class="annotated-panel">
            <div class="panel-header">
              <span class="panel-header__title">Your Chapter</span>
              <div class="legend" aria-label="Highlight legend">
                ${[1, 2, 3, 4, 5]
                  .map(
                    (r) => `
                  <div class="legend-item">
                    <div class="legend-dot" style="background:${RANK_COLORS[r]}" aria-hidden="true"></div>
                    <span>#${r}</span>
                  </div>
                `,
                  )
                  .join('')}
              </div>
            </div>
            <div class="annotated-text text-reading" role="region" aria-label="Annotated chapter text" tabindex="0">
              ${html}
            </div>
          </div>

          <!-- RIGHT: Sidebar -->
          <aside class="sidebar" aria-label="Analysis results">

            ${warningsHTML}

            <!-- Score card -->
            <div class="score-card">
              <div class="score-card__header">
                <div class="score-card__number">${result.headlineScore.score}</div>
                <div class="score-card__label">${escHtml(result.headlineScore.label)}</div>
                <div class="score-card__interp">${escHtml(result.headlineScore.interpretation)}</div>
              </div>
              <div class="score-card__body">
                <div class="gauge-wrap" aria-label="Readability gauge: ${score} out of 100">
                  <div class="gauge-label-row">
                    <span>Harder</span>
                    <span>Easier</span>
                  </div>
                  <div class="gauge-track" role="presentation">
                    <div class="gauge-thumb" style="left:${gaugePos}%"></div>
                  </div>
                </div>
                <div class="metrics-grid">
                  <div class="metric-tile">
                    <div class="metric-tile__value">${fmt(result.metrics.wordCount)}</div>
                    <div class="metric-tile__label">Words</div>
                  </div>
                  <div class="metric-tile">
                    <div class="metric-tile__value">${readingTime}</div>
                    <div class="metric-tile__label">Read Time</div>
                  </div>
                  <div class="metric-tile">
                    <div class="metric-tile__value">${result.metrics.fleschKincaidGrade.toFixed(1)}</div>
                    <div class="metric-tile__label">Grade Level</div>
                  </div>
                  <div class="metric-tile">
                    <div class="metric-tile__value">${result.metrics.avgWordsPerSentence.toFixed(1)}</div>
                    <div class="metric-tile__label">Avg Sent. Len.</div>
                  </div>
                  <div class="metric-tile">
                    <div class="metric-tile__value">${result.metrics.gunningFog.toFixed(1)}</div>
                    <div class="metric-tile__label">Fog Index</div>
                  </div>
                  <div class="metric-tile">
                    <div class="metric-tile__value">${result.metrics.smog.toFixed(1)}</div>
                    <div class="metric-tile__label">SMOG</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Hard sentences -->
            <div class="hard-panel">
              <div class="hard-panel__header">
                <span class="hard-panel__title">Hardest Sentences</span>
                <span class="badge">${result.hardestSentences.length}</span>
              </div>
              ${hardListHTML}
            </div>

          </aside>
        </div>
      </div>
    `;

    // Back button
    document.getElementById('back-btn')?.addEventListener('click', () => {
      renderInput();
    });

    // Jump on hard-item click or keyboard enter
    const handleJump = (el: Element) => {
      const rank = el.getAttribute('data-jump');
      if (!rank) return;
      const target = document.getElementById(`sentence-${rank}`);
      if (!target) return;

      // Remove previous focus
      document.querySelectorAll('.hl--focused').forEach((e) => e.classList.remove('hl--focused'));

      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('hl--focused');
      target.focus();
      setTimeout(() => target.classList.remove('hl--focused'), 2200);
    };

    document.querySelectorAll('.hard-item').forEach((item) => {
      item.addEventListener('click', () => handleJump(item));
      item.addEventListener('keydown', (e) => {
        if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
          e.preventDefault();
          handleJump(item);
        }
      });
    });

    // Clicking a highlight in text scrolls sidebar item into view
    document.querySelectorAll('.hl').forEach((mark) => {
      mark.addEventListener('click', () => {
        const rank = mark.getAttribute('data-rank');
        const sidebarItem = document.querySelector(`.hard-item[data-jump="${rank}"]`);
        sidebarItem?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });
  };

  // Boot
  renderInput();
}
