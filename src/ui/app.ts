import { ReadabilityClient } from '../worker/client';
import { AnalysisResult } from '../core/index';

const MAX_WORDS = 100000;
const client = new ReadabilityClient();

export function setupApp(element: HTMLElement) {
  let isAnalyzing = false;
  let text = '';

  const renderInput = () => {
    element.innerHTML = `
      <div class="container">
        <header>
          <h1>Chapter Readability Checker</h1>
          <p>Paste your chapter below. We analyze it securely in your browser.</p>
        </header>
        <main>
          <div class="input-area">
            <label for="chapter-input" class="sr-only">Paste your chapter text</label>
            <textarea id="chapter-input" placeholder="Paste your story here..." rows="20" style="width: 100%; padding: var(--spacing-3); font-family: var(--font-reading); font-size: 1.125rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); box-sizing: border-box;">${text}</textarea>
            <div class="actions" style="margin-top: var(--spacing-3); display: flex; gap: var(--spacing-3); align-items: center;">
              <button id="analyze-btn" style="padding: var(--spacing-2) var(--spacing-4); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; font-weight: bold;">
                ${isAnalyzing ? 'Analyzing...' : 'Analyze Chapter'}
              </button>
              <button id="clear-btn" style="background: transparent; border: 1px solid var(--color-border); padding: var(--spacing-2) var(--spacing-4); border-radius: var(--radius-md); cursor: pointer;">Clear</button>
            </div>
            <div id="error-msg" style="color: #ef4444; margin-top: var(--spacing-2);"></div>
          </div>
        </main>
      </div>
    `;

    const textarea = document.getElementById('chapter-input') as HTMLTextAreaElement;
    const analyzeBtn = document.getElementById('analyze-btn') as HTMLButtonElement;
    const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
    const errorMsg = document.getElementById('error-msg') as HTMLDivElement;

    textarea.addEventListener('input', (e) => {
      text = (e.target as HTMLTextAreaElement).value;
    });

    clearBtn.addEventListener('click', () => {
      text = '';
      renderInput();
    });

    analyzeBtn.addEventListener('click', async () => {
      if (!text.trim()) {
        errorMsg.textContent = 'Please paste some text first.';
        return;
      }
      
      // Simple word count check for max
      if (text.split(/\s+/).length > MAX_WORDS) {
        errorMsg.textContent = \`Input exceeds maximum allowed words (\${MAX_WORDS}).\`;
        return;
      }

      isAnalyzing = true;
      analyzeBtn.textContent = 'Analyzing...';
      analyzeBtn.disabled = true;
      errorMsg.textContent = '';

      try {
        const result = await client.analyze(text);
        renderResults(result);
      } catch (err: any) {
        errorMsg.textContent = 'An error occurred during analysis: ' + err.message;
      } finally {
        isAnalyzing = false;
      }
    });
  };

  const renderResults = (result: AnalysisResult) => {
    // Generate annotated text
    let annotatedHTML = '';
    let lastIndex = 0;
    
    // Sort highlights by startOffset to inject markup safely
    const highlights = [...result.hardestSentences].sort((a, b) => a.startOffset - b.startOffset);
    
    // Sanitize function to escape HTML
    const escapeHtml = (unsafe: string) => {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    for (const sentence of highlights) {
      const beforeText = text.substring(lastIndex, sentence.startOffset);
      annotatedHTML += escapeHtml(beforeText);
      
      const sentenceText = text.substring(sentence.startOffset, sentence.endOffset);
      annotatedHTML += `<mark class="highlight highlight-\${sentence.rank}" id="sentence-\${sentence.rank}">
        <span class="sr-only">Rank \${sentence.rank} hardest sentence: </span>\${escapeHtml(sentenceText)}
      </mark>`;
      
      lastIndex = sentence.endOffset;
    }
    annotatedHTML += escapeHtml(text.substring(lastIndex));
    
    // Preserve line breaks
    annotatedHTML = annotatedHTML.replace(/\\n/g, '<br/>');

    element.innerHTML = `
      <div class="container" style="max-width: 1200px; margin: 0 auto; padding: var(--spacing-4);">
        <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-6);">
          <h1>Analysis Results</h1>
          <button id="back-btn" style="padding: var(--spacing-2) var(--spacing-4); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer;">
            &larr; Back to Edit
          </button>
        </header>

        <div style="display: grid; grid-template-columns: 1fr; gap: var(--spacing-6); @media(min-width: 768px) { grid-template-columns: 2fr 1fr; }">
          
          <div class="annotated-text text-reading" style="background: var(--color-surface); padding: var(--spacing-4); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); max-height: 70vh; overflow-y: auto;">
            \${annotatedHTML}
          </div>

          <aside class="sidebar">
            <div class="score-card" style="background: var(--color-surface); padding: var(--spacing-4); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); margin-bottom: var(--spacing-4); text-align: center;">
              <div style="font-size: 3rem; font-weight: bold; color: var(--color-primary);">\${result.headlineScore.score}</div>
              <div style="font-size: 1.25rem; font-weight: bold;">\${result.headlineScore.label}</div>
              <p style="color: var(--color-text-muted);">\${result.headlineScore.interpretation}</p>
            </div>

            <div class="metrics-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-2); margin-bottom: var(--spacing-4);">
              <div style="background: var(--color-surface); padding: var(--spacing-2); border-radius: var(--radius-md); text-align: center; border: 1px solid var(--color-border);">
                <div style="font-size: 1.25rem; font-weight: bold;">\${result.metrics.wordCount}</div>
                <div style="font-size: 0.75rem; color: var(--color-text-muted);">Words</div>
              </div>
              <div style="background: var(--color-surface); padding: var(--spacing-2); border-radius: var(--radius-md); text-align: center; border: 1px solid var(--color-border);">
                <div style="font-size: 1.25rem; font-weight: bold;">\${result.metrics.readingTimeMinutes} min</div>
                <div style="font-size: 0.75rem; color: var(--color-text-muted);">Reading Time</div>
              </div>
            </div>

            <div class="hard-sentences" style="background: var(--color-surface); padding: var(--spacing-4); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
              <h3 style="margin-top: 0;">Top \${result.hardestSentences.length} Hardest Sentences</h3>
              \${result.hardestSentences.length === 0 ? '<p>No significantly hard sentences found.</p>' : ''}
              <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--spacing-3);">
                \${result.hardestSentences.map(s => `
                  <li style="border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--spacing-2);">
                    <div style="display: flex; justify-content: space-between; align-items: baseline;">
                      <span style="font-weight: bold; color: var(--color-primary);">#\${s.rank}</span>
                      <button data-jump="\${s.rank}" style="background: none; border: none; color: var(--color-primary); cursor: pointer; text-decoration: underline; font-size: 0.875rem;">Jump</button>
                    </div>
                    <p style="font-size: 0.875rem; margin: var(--spacing-2) 0;">\${escapeHtml(s.text)}</p>
                    <div style="font-size: 0.75rem; color: var(--color-text-muted);">
                      \${s.reasons.map(r => `&bull; \${r.label} (\${r.value})`).join('<br/>')}
                    </div>
                  </li>
                `).join('')}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    `;

    document.getElementById('back-btn')?.addEventListener('click', () => {
      renderInput();
    });

    document.querySelectorAll('[data-jump]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const rank = (e.target as HTMLElement).getAttribute('data-jump');
        const mark = document.getElementById(`sentence-\${rank}`);
        if (mark) {
          mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
          mark.style.outline = '2px solid var(--color-primary)';
          setTimeout(() => { mark.style.outline = 'none'; }, 2000);
        }
      });
    });
  };

  renderInput();
}
