import Modal from './Modal';
import IntegrationManager from './IntegrationManager';

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: () => void;
}

export default function IntegrationsModal({ isOpen, onClose, onStatusChange }: IntegrationsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Integrations"
      maxWidth="max-w-xl"
    >
      <div className="pb-2">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Connect your planning platforms to enable repository selection and task automation.
        </p>
        <IntegrationManager compact onStatusChange={onStatusChange} />
        
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
