import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
	Activity,
	X,
	Terminal,
	StopCircle,
	Clock,
	AlertCircle,
	ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBackgroundTasks, useStopBackgroundTask } from '../hooks/useApi';
import { apiClient } from '../lib';
import toast from 'react-hot-toast';

export const BackgroundTaskMonitor: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
	const [streamLogContent, setStreamLogContent] = useState('');
	const [streamConnecting, setStreamConnecting] = useState(false);
	const [streamError, setStreamError] = useState<string | null>(null);
	const logContainerRef = useRef<HTMLDivElement>(null);
	const closeStreamRef = useRef<(() => void) | null>(null);

	const { data: tasks, getTasks } = useBackgroundTasks();
	const { stopTask } = useStopBackgroundTask();

	const fetchTasks = useCallback(() => {
		getTasks();
	}, [getTasks]);

	useEffect(() => {
		if (isOpen) {
			fetchTasks();
			const interval = setInterval(fetchTasks, 5000);
			return () => clearInterval(interval);
		}
	}, [isOpen, fetchTasks]);

	// Stream opens when log window opens, closes when log window closes
	useEffect(() => {
		if (!selectedTaskId) {
			closeStreamRef.current?.();
			closeStreamRef.current = null;
			setStreamLogContent('');
			setStreamError(null);
			setStreamConnecting(false);
			return;
		}
		setStreamConnecting(true);
		setStreamError(null);
		const close = apiClient.subscribeBackgroundTaskLogs(selectedTaskId, {
			onInitial(logs) {
				setStreamLogContent(logs ?? '');
				setStreamConnecting(false);
			},
			onAppend(logs) {
				setStreamLogContent(prev => prev + (logs ?? ''));
				setStreamConnecting(false);
			},
			onError(err) {
				setStreamError(err.message);
				setStreamConnecting(false);
			},
		});
		closeStreamRef.current = close;
		return () => {
			close();
			closeStreamRef.current = null;
		};
	}, [selectedTaskId]);

	// Autoscroll to bottom when new content is appended
	useEffect(() => {
		const el = logContainerRef.current;
		if (el) el.scrollTop = el.scrollHeight;
	}, [streamLogContent]);

	const handleStopTask = async (id: string) => {
		try {
			await stopTask(id);
			toast.success('Task stop signal sent');
			fetchTasks();
		} catch (err) {
			toast.error('Failed to stop task');
		}
	};

	const statusColors = {
		running: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded text-xs border border-blue-200 dark:border-blue-800',
		completed: 'text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs border border-green-200 dark:border-green-800',
		failed: 'text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded text-xs border border-red-200 dark:border-red-800',
		stopped: 'text-gray-500 bg-gray-50 dark:bg-gray-900/20 px-2 py-0.5 rounded text-xs border border-gray-200 dark:border-gray-800',
	};

	return (
		<>
			{/* Trigger Button */}
			<button
				onClick={() => setIsOpen(true)}
				className="fixed top-4 right-20 z-40 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all group"
				title="Background Tasks"
			>
				<div className="relative">
					<Activity className={`w-5 h-5 text-gray-600 dark:text-gray-300 ${tasks?.some(t => t.status === 'running') ? 'animate-pulse text-blue-500' : ''}`} />
					{tasks?.some(t => t.status === 'running') && (
						<span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
					)}
				</div>
			</button>

			{/* Sidebar */}
			<AnimatePresence>
				{isOpen && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setIsOpen(false)}
							className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[50]"
						/>
						<motion.div
							initial={{ x: '100%' }}
							animate={{ x: 0 }}
							exit={{ x: '100%' }}
							transition={{ type: 'spring', damping: 25, stiffness: 200 }}
							className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-[51] border-l border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col"
						>
							<div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
								<div>
									<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
										<Activity className="w-5 h-5 text-blue-500" />
										Background Tasks
									</h2>
									<p className="text-xs text-gray-500 mt-1">Monitor and manage AI background processes</p>
								</div>
								<button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
									<X className="w-5 h-5 text-gray-500" />
								</button>
							</div>

							<div className="flex-1 overflow-y-auto p-4 space-y-3">
								{tasks?.length === 0 ? (
									<div className="text-center py-12">
										<Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
										<p className="text-gray-500">No background tasks found</p>
									</div>
								) : (
									tasks?.map((task) => (
										<div
											key={task.id}
											onClick={() => setSelectedTaskId(task.id)}
											className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all cursor-pointer group relative overflow-hidden"
										>
											<div className="flex justify-between items-start mb-2">
												<span className={statusColors[task.status]}>{task.status.toUpperCase()}</span>
												<span className="text-[10px] text-gray-400">{new Date(task.startTime).toLocaleTimeString()}</span>
											</div>
											<p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
												{task.prompt}
											</p>
											<div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
												<div className="flex gap-2">
													{task.status === 'running' && (
														<button
															onClick={(e) => {
																e.stopPropagation();
																handleStopTask(task.id);
															}}
															className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-medium"
														>
															<StopCircle className="w-3 h-3" /> Stop
														</button>
													)}
												</div>
												<ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
											</div>
										</div>
									))
								)}
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* Logs Popup */}
			<AnimatePresence>
				{selectedTaskId && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setSelectedTaskId(null)}
							className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60]"
						/>
						<motion.div
							initial={{ scale: 0.9, opacity: 0, y: 20 }}
							animate={{ scale: 1, opacity: 1, y: 0 }}
							exit={{ scale: 0.9, opacity: 0, y: 20 }}
							className="fixed inset-4 md:inset-10 lg:inset-20 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl z-[61] border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col"
						>
							<div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 sticky top-0">
								<div className="flex items-center gap-4">
									<div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
										<Terminal className="w-6 h-6 text-blue-600 dark:text-blue-400" />
									</div>
									<div>
										<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Task Console</h3>
										<div className="flex items-center gap-3 mt-1">
											<span className="text-xs text-gray-500 font-mono">{selectedTaskId}</span>
											{tasks?.find(t => t.id === selectedTaskId) && (
												<span className={statusColors[tasks.find(t => t.id === selectedTaskId)!.status]}>
													{tasks.find(t => t.id === selectedTaskId)!.status.toUpperCase()}
												</span>
											)}
										</div>
									</div>
								</div>
								<div className="flex items-center gap-2">
									{tasks?.find(t => t.id === selectedTaskId)?.status === 'running' && (
										<button
											onClick={() => handleStopTask(selectedTaskId)}
											className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition-all border border-red-100 dark:border-red-900/30"
										>
											<StopCircle className="w-4 h-4" /> Stop Process
										</button>
									)}
									<button onClick={() => setSelectedTaskId(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
										<X className="w-6 h-6 text-gray-400" />
									</button>
								</div>
							</div>

							<div className="flex-1 overflow-hidden p-6 bg-gray-950">
								<div
									ref={logContainerRef}
									className="h-full w-full bg-black/40 rounded-2xl border border-gray-800 overflow-y-auto font-mono text-sm p-4 text-green-400 selection:bg-green-500/30"
								>
									{streamError ? (
										<div className="flex flex-col items-center justify-center h-full text-red-400 gap-3">
											<AlertCircle className="w-8 h-8" />
											<p>{streamError}</p>
										</div>
									) : streamConnecting && !streamLogContent ? (
										<div className="flex items-center gap-2 text-gray-500">
											<Clock className="w-4 h-4 animate-spin" /> Connecting to log stream...
										</div>
									) : streamLogContent ? (
										<pre className="whitespace-pre-wrap leading-relaxed">
											{streamLogContent}
										</pre>
									) : (
										<div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
											<AlertCircle className="w-8 h-8" />
											<p>No logs generated yet or file empty.</p>
										</div>
									)}
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</>
	);
};
