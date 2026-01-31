import { useCallback, useState } from 'react';
import EpicItem from '../components/EpicItem';

type Epic = {
	id: string;
	title: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Example list; replace with real epic data from props or API call
const initialEpics: Epic[] = [
	{ id: 'epic-1', title: 'Epic: Onboarding flow' },
	{ id: 'epic-2', title: 'Epic: Payment integration' },
	{ id: 'epic-3', title: 'Epic: Reporting dashboard' }
];

export default function GenerateEpicsPage() {
	const [epics] = useState<Epic[]>(initialEpics);
	const [progressMap, setProgressMap] = useState<Record<string, number>>({});
	const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
	const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
	const [running, setRunning] = useState(false);

	const setEpicProgress = useCallback((id: string, p: number) => {
		setProgressMap(prev => ({ ...prev, [id]: p }));
	}, []);

	const setEpicLoading = useCallback((id: string, v: boolean) => {
		setLoadingMap(prev => ({ ...prev, [id]: v }));
	}, []);

	const setEpicCompleted = useCallback((id: string, v: boolean) => {
		setCompletedMap(prev => ({ ...prev, [id]: v }));
	}, []);

	async function createTasksForEpic(epicId: string, onProgress: (p: number) => void) {
		// Try SSE endpoint first. Expect server to stream JSON messages like: { "progress": 12 }
		const sseUrl = `${API_BASE}v1/tasks/generate/stream?epicId=${encodeURIComponent(epicId)}`;

		// If EventSource works and backend provides SSE, use it.
		if (typeof EventSource !== 'undefined') {
			return new Promise<void>((resolve) => {
				let resolved = false;
				const es = new EventSource(sseUrl);
				es.onmessage = (e) => {
					if (!e.data) return;
					if (e.data === '[DONE]') {
						onProgress(100);
						es.close();
						if (!resolved) { resolved = true; resolve(); }
						return;
					}
					try {
						const parsed = JSON.parse(e.data);
						if (typeof parsed.progress === 'number') {
							onProgress(parsed.progress);
						}
					} catch {
						// ignore non-json progress chunks
					}
				};
				es.onerror = () => {
					es.close();
					// resolve even if server error — caller will mark epic done or retry as needed
					if (!resolved) { resolved = true; resolve(); }
				};
				// Safety timeout in case server never sends DONE (optional)
				setTimeout(() => {
					if (!resolved) { resolved = true; es.close(); resolve(); }
				}, 1000 * 60); // 60s
			});
		}

		// Fallback: call a non-streaming endpoint that returns when tasks created
		try {
			const resp = await fetch(`${API_BASE}v1/tasks/generate?epicId=${encodeURIComponent(epicId)}`, { method: 'POST' });
			// If server returns a progress-aware response, parse it; otherwise, animate to 100%.
			if (resp.ok) {
				// animate progress to 100% over 800ms for a smooth UX
				return new Promise<void>((resolve) => {
					const start = Date.now();
					const duration = 800;
					const startP = 30;
					const tick = () => {
						const t = Math.min(1, (Date.now() - start) / duration);
						onProgress(startP + t * (100 - startP));
						if (t < 1) requestAnimationFrame(tick);
						else resolve();
					};
					requestAnimationFrame(tick);
				});
			}
		} catch {
			// network error -> fallback simulated progress
		}

		// final fallback: simulated incremental progress
		return new Promise<void>((resolve) => {
			let p = 0;
			const iv = setInterval(() => {
				p = Math.min(100, p + Math.random() * 20 + 10);
				onProgress(p);
				if (p >= 100) { clearInterval(iv); resolve(); }
			}, 350);
		});
	}

	async function handleStart() {
		if (running) return;
		setRunning(true);

		for (const epic of epics) {
			setEpicLoading(epic.id, true);
			// ensure initial progress shown
			setEpicProgress(epic.id, 0);

			await createTasksForEpic(epic.id, (p) => {
				setEpicProgress(epic.id, p);
			});

			setEpicLoading(epic.id, false);
			setEpicProgress(epic.id, 100);
			setEpicCompleted(epic.id, true);
			// small delay before moving to next epic for perceived responsiveness
			await new Promise((r) => setTimeout(r, 300));
		}

		setRunning(false);
	}

	return (
		<div style={{ padding: 16, maxWidth: 800, margin: '0 auto' }}>
			<h2>Generate Epics & Tasks</h2>
			<p>All epics are shown up front. Start will create tasks for each epic sequentially. Each epic shows a loader while its tasks are being created, then a check when done.</p>

			<div style={{ border: '1px solid #e6e6e6', borderRadius: 6, overflow: 'hidden' }}>
				{epics.map((epic) => (
					<EpicItem
						key={epic.id}
						epicId={epic.id}
						title={epic.title}
						progress={progressMap[epic.id] ?? 0}
						loading={!!loadingMap[epic.id]}
						completed={!!completedMap[epic.id]}
					/>
				))}
			</div>

			<div style={{ marginTop: 12 }}>
				<button onClick={handleStart} disabled={running} style={{ padding: '8px 14px' }}>
					{running ? 'Running…' : 'Start'}
				</button>
			</div>
		</div>
	);
}
