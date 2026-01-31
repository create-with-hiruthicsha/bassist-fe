import { useState, useEffect, useRef } from 'react';
import { Building2, ChevronDown, Check, Loader2, ExternalLink } from 'lucide-react';
import { integrationService, apiClient } from '../lib';

interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  avatarUrls?: {
    '16x16': string;
    '24x24': string;
    '32x32': string;
    '48x48': string;
  };
}

interface JiraProjectSelectorProps {
  projectKey: string;
  onProjectKeyChange: (key: string) => void;
  disabled?: boolean;
  onIntegrationRequired?: () => void;
}

export default function JiraProjectSelector({
  projectKey,
  onProjectKeyChange,
  disabled = false,
  onIntegrationRequired
}: JiraProjectSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState<JiraProject[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load user's Jira projects on mount
  useEffect(() => {
    if (integrationService.isConnected('jira')) {
      loadUserProjects();
    }
  }, []);

  // Filter projects based on search query
  useEffect(() => {
    if (isSelecting) {
      return;
    }
    
    if (searchQuery.trim()) {
      const filtered = projects.filter(project => 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.key.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [searchQuery, projects, isSelecting]);

  const loadUserProjects = async () => {
    if (!integrationService.isConnected('jira')) {
      setError('Jira integration required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Use apiClient which automatically includes Supabase user token
      const data = await apiClient.getJiraProjects();
      setProjects(data || []);
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load Jira projects';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSearch = (query: string) => {
    setSearchQuery(query);
    onProjectKeyChange(query);
  };

  const handleProjectSelect = (projectKey: string) => {
    setIsSelecting(true);
    onProjectKeyChange(projectKey);
    setShowDropdown(false);
    setSearchQuery('');
    setFilteredProjects(projects);
    
    // Reset the selecting flag after a brief delay
    setTimeout(() => {
      setIsSelecting(false);
    }, 100);
  };

  const handleInputFocus = () => {
    if (!showDropdown) {
      setShowDropdown(true);
    }
    if (projects.length === 0 && !loading) {
      loadUserProjects();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutside = dropdownRef.current && !dropdownRef.current.contains(target);
      
      if (isOutside) {
        setShowDropdown(false);
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const renderProjectOptions = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
          <span className="ml-2 text-sm text-gray-500">Loading projects...</span>
        </div>
      );
    }

    if (filteredProjects.length === 0 && !loading) {
      return (
        <div className="py-4 text-center text-sm text-gray-500">
          {projects.length === 0 ? 'No projects found' : 'No projects match your search'}
        </div>
      );
    }

    return (
      <div className="max-h-60 overflow-y-auto">
        {filteredProjects.map((project) => (
          <button
            key={project.id}
            type="button"
            onClick={() => handleProjectSelect(project.key)}
            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors cursor-pointer"
            style={{ pointerEvents: 'auto' }}
          >
            <Building2 className="w-4 h-4 text-gray-500" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">{project.name}</div>
              <div className="text-sm text-gray-500 truncate">
                {project.key} • {project.projectTypeKey}
              </div>
            </div>
            {projectKey === project.key && (
              <Check className="w-4 h-4 text-blue-600" />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Project Key Input */}
      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Jira Project
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={projectKey}
            onChange={(e) => handleProjectSearch(e.target.value)}
            onFocus={handleInputFocus}
            placeholder="Enter project key (e.g., PROJ) or search..."
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}
            disabled={disabled}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {showDropdown && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            {renderProjectOptions()}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Jira Connection Status */}
      {integrationService.isConnected('jira') ? (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
          <Building2 className="w-4 h-4" />
          <span>Jira integration connected</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">
          <Building2 className="w-4 h-4" />
          <span>Jira integration not connected</span>
          {onIntegrationRequired && (
            <button
              onClick={onIntegrationRequired}
              className="ml-auto flex items-center gap-1 text-xs font-medium text-yellow-700 hover:text-yellow-800"
            >
              <ExternalLink className="w-3 h-3" />
              Connect
            </button>
          )}
        </div>
      )}
    </div>
  );
}
