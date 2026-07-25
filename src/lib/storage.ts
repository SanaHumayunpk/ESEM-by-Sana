import { SkincareAnalysis } from '../types';

const STORAGE_KEY = 'esem_skincare_history';

export function getSavedAnalyses(): SkincareAnalysis[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load history from localStorage:', e);
    return [];
  }
}

export function saveAnalysis(analysis: SkincareAnalysis): SkincareAnalysis[] {
  try {
    const current = getSavedAnalyses();
    // Filter out duplicate ID if updating
    const updated = [analysis, ...current.filter((item) => item.id !== analysis.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save analysis to localStorage:', e);
    return getSavedAnalyses();
  }
}

export function deleteAnalysis(id: string): SkincareAnalysis[] {
  try {
    const current = getSavedAnalyses();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete analysis from localStorage:', e);
    return getSavedAnalyses();
  }
}

export function getLatestAnalysis(): SkincareAnalysis | null {
  const history = getSavedAnalyses();
  return history.length > 0 ? history[0] : null;
}

export function getAnalysisById(id: string, history?: SkincareAnalysis[]): SkincareAnalysis | null {
  const all = history || getSavedAnalyses();
  return all.find((item) => item.id === id) || null;
}

/**
 * Reconstructs the chronological routine journey chain (e.g. v1 -> v2 -> v3) for a given analysis.
 */
export function getAnalysisChain(analysis: SkincareAnalysis, history?: SkincareAnalysis[]): SkincareAnalysis[] {
  const all = history || getSavedAnalyses();
  
  // Find root item by walking up parent references
  let root = analysis;
  const visited = new Set<string>();
  while (root.parentAnalysisId && !visited.has(root.id)) {
    visited.add(root.id);
    const parent = all.find((item) => item.id === root.parentAnalysisId);
    if (parent) {
      root = parent;
    } else {
      break;
    }
  }

  // Walk down from root finding all child updates
  const chain: SkincareAnalysis[] = [root];
  visited.clear();
  visited.add(root.id);

  let current = root;
  while (current) {
    const next = all.find((item) => item.parentAnalysisId === current.id && !visited.has(item.id));
    if (next) {
      visited.add(next.id);
      chain.push(next);
      current = next;
    } else {
      break;
    }
  }

  // Sort by timestamp or version
  return chain.sort((a, b) => (a.version || 1) - (b.version || 1) || a.timestamp - b.timestamp);
}
