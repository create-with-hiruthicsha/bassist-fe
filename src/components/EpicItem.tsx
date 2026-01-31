type Props = {
	epicId: string;
	title: string;
	progress: number; // 0-100
	loading: boolean;
	completed: boolean;
};

export default function EpicItem({ title, progress, loading, completed }: Props) {
	return (
		<div style={{ display: 'flex', alignItems: 'center', padding: 8, borderBottom: '1px solid #eee' }}>
			<div style={{ flex: 1 }}>
				<div style={{ fontWeight: 600 }}>{title}</div>
				<div style={{ height: 6, background: '#f0f0f0', borderRadius: 3, marginTop: 6 }}>
					<div
						style={{
							width: `${Math.min(Math.max(progress, 0), 100)}%`,
							height: '100%',
							background: loading ? '#1f7aec' : '#22c55e',
							transition: 'width 200ms linear'
						}}
					/>
				</div>
			</div>
			<div style={{ width: 48, textAlign: 'center', marginLeft: 12 }}>
				{loading ? (
					// simple loader
					<div aria-hidden style={{ width: 18, height: 18, borderRadius: 9, border: '3px solid #ddd', borderTopColor: '#1f7aec', animation: 'spin 1s linear infinite' }} />
				) : completed ? (
					// checkmark
					<div style={{ color: '#16a34a', fontSize: 18 }}>✓</div>
				) : (
					<div style={{ color: '#666', fontSize: 12 }}>{Math.round(progress)}%</div>
				)}
			</div>

			{/* Minimal keyframes injected inline to avoid global CSS edits */}
			<style>
				{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
			</style>
		</div>
	);
}
