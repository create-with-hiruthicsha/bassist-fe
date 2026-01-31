import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, Github, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SuccessScreenProps {
	platform: string;
	tasks: Array<{ taskName: string }>;
	repositoryOwner?: string;
	repositoryName?: string;
	jiraProjectKey?: string;
	title?: string;
	description?: string;
	onContinue: () => void;
}

export default function SuccessScreen({
	platform,
	tasks,
	repositoryOwner,
	repositoryName,
	jiraProjectKey,
	title = "Tasks Created Successfully!",
	description = `All items are now live on ${platform}.`,			
	onContinue
}: SuccessScreenProps) {
	const [showTasks, setShowTasks] = useState(false);
	const [showButtons, setShowButtons] = useState(false);

	useEffect(() => {
		// Initial celebration
		confetti({
			particleCount: 150,
			spread: 70,
			origin: { y: 0.6 },
			colors: ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
		});

		// Move checkmark and show tasks after 1s
		const timer1 = setTimeout(() => {
			setShowTasks(true);
		}, 1000);

		// Show buttons after 2s
		const timer2 = setTimeout(() => {
			setShowButtons(true);
		}, 2000);

		return () => {
			clearTimeout(timer1);
			clearTimeout(timer2);
		};
	}, []);

	const getPlatformUrl = () => {
		if (platform === 'github' && repositoryOwner && repositoryName) {
			return `https://github.com/${repositoryOwner}/${repositoryName}/issues`;
		}
		if (platform === 'jira') {
			// Best guess for Jira URL - try to use atlassian.net
			return `https://atlassian.net/browse/${jiraProjectKey}`;
		}
		if (platform === 'gitlab' && repositoryOwner && repositoryName) {
			return `https://gitlab.com/${repositoryOwner}/${repositoryName}/-/issues`;
		}
		return null;
	};

	const platformUrl = getPlatformUrl();

	return (
		<div className="fixed inset-0 z-[100] bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-6 overflow-hidden">
			{/* Background decoration */}
			<div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none">
				<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500 rounded-full blur-[120px]" />
			</div>

			<div className="relative w-full max-w-2xl flex flex-col items-center">
				{/* Checkmark Section */}
				<motion.div
					initial={{ scale: 0.5, opacity: 0 }}
					animate={{
						scale: showTasks ? 0.7 : 1.3,
						y: showTasks ? "-32vh" : 0,
						opacity: 1
					}}
					transition={{
						type: "spring",
						damping: 20,
						stiffness: 80,
					}}
					className="flex flex-col items-center z-20"
				>
					<div className="relative">
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
							className="bg-green-100 dark:bg-green-900/30 p-8 rounded-full shadow-2xl shadow-green-200 dark:shadow-none"
						>
							<CheckCircle2 className="w-24 h-24 text-green-600 dark:text-green-400" />
						</motion.div>
						<motion.div
							animate={{
								scale: [1, 1.4, 1],
								opacity: [0.3, 0, 0.3]
							}}
							transition={{ repeat: Infinity, duration: 2 }}
							className="absolute inset-0 bg-green-400 rounded-full blur-2xl -z-10"
						/>
					</div>
					<motion.h1
						animate={{
							opacity: showTasks ? 0 : 1,
							scale: showTasks ? 0.8 : 1,
							y: showTasks ? -20 : 0
						}}
						className="mt-8 text-4xl font-extrabold text-gray-900 dark:text-white text-center tracking-tight"
					>
						{title}
					</motion.h1>
				</motion.div>

				{/* Task List Section */}
				<AnimatePresence>
					{showTasks && (
						<motion.div
							initial={{ opacity: 0, y: 100, scale: 0.95 }}
							animate={{ opacity: 1, y: "-2vh", scale: 1 }}
							transition={{ type: "spring", damping: 25, stiffness: 120 }}
							className="absolute w-full px-4 z-10"
						>
							<div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden">
								<div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
									<div>
										<h3 className="text-xl font-bold text-gray-900 dark:text-white">Publication Summary</h3>
										<p className="text-sm text-gray-500">{description}</p>
									</div>
									<div className="px-4 py-2 bg-blue-600 text-white text-sm font-black rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none">
										{tasks.length} items
									</div>
								</div>

								<div className="overflow-y-auto custom-scrollbar px-2 py-4" style={{ maxHeight: '50vh' }}>
									<div className="space-y-2">
										{tasks.map((task, idx) => (
											<motion.div
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: 0.2 + idx * 0.04 }}
												key={idx}
												className="p-4 flex items-center gap-4 group hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-2xl transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
											>
												<div className="w-10 h-10 flex-shrink-0 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
													<CheckCircle2 className="w-6 h-6 text-green-500" />
												</div>
												<span className="text-base text-gray-700 dark:text-gray-200 font-semibold truncate">
													{task.taskName}
												</span>
											</motion.div>
										))}
									</div>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Action Buttons Section */}
				<AnimatePresence>
					{showButtons && (
						<motion.div
							initial={{ opacity: 0, y: 100 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ type: "spring", damping: 20, stiffness: 100 }}
							className="fixed bottom-12 left-0 right-0 px-8 flex flex-col sm:flex-row items-center justify-center gap-4 z-50"
						>
							<motion.button
								whileHover={{ scale: 1.05, y: -2 }}
								whileTap={{ scale: 0.95 }}
								onClick={onContinue}
								className="w-full max-w-xs px-8 py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-[2rem] hover:shadow-2xl transition-all flex items-center justify-center gap-3 group"
							>
								Go Home
								<ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
							</motion.button>

							{platformUrl && (
								<motion.a
									whileHover={{ scale: 1.05, y: -2 }}
									whileTap={{ scale: 0.95 }}
									href={platformUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="w-full max-w-xs px-8 py-5 bg-blue-600 text-white font-black rounded-[2rem] hover:bg-blue-700 hover:shadow-2xl shadow-lg shadow-blue-100 dark:shadow-none transition-all flex items-center justify-center gap-3"
								>
									{platform === 'github' ? <Github className="w-6 h-6" /> : <ExternalLink className="w-6 h-6" />}
									Open {platform.charAt(0).toUpperCase() + platform.slice(1)}
								</motion.a>
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			<style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
        }
      `}</style>
		</div>
	);
}
