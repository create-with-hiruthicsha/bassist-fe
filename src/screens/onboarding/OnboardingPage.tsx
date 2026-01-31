import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Sparkles, Loader2 } from 'lucide-react';

export default function OnboardingPage() {
	const { refreshOrganization, createOrganization, joinOrganization } = useAuth();
	const [mode, setMode] = useState<'selection' | 'join' | 'create'>('selection');
	const [name, setName] = useState('');
	const [joinCode, setJoinCode] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;
		setLoading(true);
		setError(null);
		try {
			await createOrganization(name);
			await refreshOrganization();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to create organization');
		} finally {
			setLoading(false);
		}
	};


	const handleJoin = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!joinCode.trim()) return;
		setLoading(true);
		setError(null);
		try {
			await joinOrganization(joinCode);
			await refreshOrganization();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Invalid join code or failed to join');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
			<div className="max-w-md w-full">
				<div className="text-center mb-8">
					<Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Bassist</h1>
					<p className="text-gray-600 dark:text-gray-400">
						To get started, you need to be part of an organization.
					</p>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
					{error && (
						<div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
							{error}
						</div>
					)}

					{mode === 'selection' && (
						<div className="grid grid-cols-1 gap-4">
							<button
								onClick={() => setMode('create')}
								className="group p-6 text-left rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all"
							>
								<div className="flex items-center gap-4">
									<div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-xl group-hover:bg-purple-500 transition-colors">
										<Sparkles className="w-6 h-6 text-purple-600 group-hover:text-white" />
									</div>
									<div>
										<h3 className="font-semibold text-gray-900 dark:text-white">Create New Org</h3>
										<p className="text-sm text-gray-500 dark:text-gray-400">Start fresh with your own team</p>
									</div>
								</div>
							</button>

							<button
								onClick={() => setMode('join')}
								className="group p-6 text-left rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all"
							>
								<div className="flex items-center gap-4">
									<div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl group-hover:bg-blue-500 transition-colors">
										<Sparkles className="w-6 h-6 text-blue-600 group-hover:text-white" />
									</div>
									<div>
										<h3 className="font-semibold text-gray-900 dark:text-white">Join Existing Org</h3>
										<p className="text-sm text-gray-500 dark:text-gray-400">Join your team using a code</p>
									</div>
								</div>
							</button>
						</div>
					)}

					{mode === 'create' && (
						<form onSubmit={handleCreate} className="space-y-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Organization Name
								</label>
								<input
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="e.g. Acme Corp"
									className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white outline-none transition-all"
									autoFocus
									required
								/>
							</div>
							<div className="flex gap-3">
								<button
									type="button"
									onClick={() => setMode('selection')}
									className="px-6 py-3 rounded-xl font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
								>
									Back
								</button>
								<button
									type="submit"
									disabled={loading || !name.trim()}
									className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium px-4 py-3 rounded-xl shadow-lg shadow-purple-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
								>
									{loading && <Loader2 className="w-4 h-4 animate-spin" />}
									{loading ? 'Creating...' : 'Create Organization'}
								</button>
							</div>
						</form>
					)}

					{mode === 'join' && (
						<form onSubmit={handleJoin} className="space-y-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Join Code
								</label>
								<input
									type="text"
									value={joinCode}
									onChange={(e) => setJoinCode(e.target.value)}
									placeholder="Paste join code"
									className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white outline-none transition-all"
									autoFocus
									required
								/>
							</div>
							<div className="flex gap-3">
								<button
									type="button"
									onClick={() => setMode('selection')}
									className="px-6 py-3 rounded-xl font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
								>
									Back
								</button>
								<button
									type="submit"
									disabled={loading || !joinCode.trim()}
									className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-4 py-3 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
								>
									{loading && <Loader2 className="w-4 h-4 animate-spin" />}
									{loading ? 'Joining...' : 'Join Organization'}
								</button>
							</div>
						</form>
					)}
				</div>
			</div>
		</div>
	);
}
