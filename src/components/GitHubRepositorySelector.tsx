import { useState, useEffect, useRef, useCallback } from 'react';
import { Github, Users, Building2, ChevronDown, Check, Loader2, ExternalLink } from 'lucide-react';
import { githubApi, GitHubRepository, GitHubOrganization, integrationService } from '../lib';
import { logger } from '../lib/utils/logger';

interface GitHubRepositorySelectorProps {
  repositoryOwner: string;
  repositoryName: string;
  onRepositoryOwnerChange: (owner: string) => void;
  onRepositoryNameChange: (name: string) => void;
  disabled?: boolean;
  onIntegrationRequired?: () => void;
  horizontal?: boolean;
}

export default function GitHubRepositorySelector({
  repositoryOwner,
  repositoryName,
  onRepositoryOwnerChange,
  onRepositoryNameChange,
  disabled = false,
  onIntegrationRequired,
  horizontal = false
}: GitHubRepositorySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [organizations, setOrganizations] = useState<GitHubOrganization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);
  const [filteredRepos, setFilteredRepos] = useState<GitHubRepository[]>([]);
  const [searchResults, setSearchResults] = useState<GitHubRepository[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchCache, setSearchCache] = useState<Map<string, GitHubRepository[]>>(new Map());
  const [isSelecting, setIsSelecting] = useState(false);
  
  const ownerInputRef = useRef<HTMLInputElement>(null);
  const repoInputRef = useRef<HTMLInputElement>(null);
  const ownerDropdownRef = useRef<HTMLDivElement>(null);
  const repoDropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadRepositoriesForOwner = useCallback(async (owner: string) => {
    if (!integrationService.isConnected('github')) {
      setError('GitHub integration required');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const ownerRepos = await githubApi.getUserRepositoriesByUsername(owner);
      setRepositories(ownerRepos);
    } catch {
      logger.error('Error loading repositories for owner');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserData = useCallback(async () => {
    if (!integrationService.isConnected('github')) {
      setError('GitHub integration required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Load user's organizations and current user info
      const [userOrgs, currentUser] = await Promise.all([
        githubApi.getUserOrganizations(),
        githubApi.getCurrentUser()
      ]);
      
      // Set organizations (including current user)
      const allOwners: GitHubOrganization[] = [
        { id: currentUser.id, login: currentUser.login, type: 'User', avatar_url: currentUser.avatar_url },
        ...userOrgs.map(org => ({ ...org, type: 'Organization' as const }))
      ] as GitHubOrganization[];
      setOrganizations(allOwners);
      
      // Load repositories for current user by default
      if (currentUser.login) {
        await loadRepositoriesForOwner(currentUser.login);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user data';
      setError(errorMessage);
      logger.error('Error loading user data');
    } finally {
      setLoading(false);
    }
  }, [loadRepositoriesForOwner]);

  const handleOwnerSearch = (query: string) => {
    setSearchQuery(query);
    onRepositoryOwnerChange(query);
  };

  const handleRepositorySearch = (query: string) => {
    // Don't update search if we're in the middle of selecting
    if (isSelecting) {
      return;
    }
    
    setSearchQuery(query);
    // If the query matches a repository name exactly, clear search results and show all repos
    if (repositories.some(repo => repo.name === query)) {
      setSearchResults([]);
      setFilteredRepos(repositories);
    }
  };

  const performSmartSearch = useCallback(async (query: string) => {
    // Check cache first
    if (searchCache.has(query)) {
      const cachedResults = searchCache.get(query)!;
      setSearchResults(cachedResults);
      setFilteredRepos(cachedResults);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      // Search for repositories using GitHub's search API
      const searchResponse = await githubApi.searchRepositories(query, repositoryOwner);
      const searchResults = searchResponse.items;
      
      // Cache the results
      setSearchCache(prev => new Map(prev).set(query, searchResults));
      
      // Update search results
      setSearchResults(searchResults);
      setFilteredRepos(searchResults);
    } catch {
      logger.error('Error searching repositories');
      // Fall back to local filtering if search fails
      const localFiltered = repositories.filter(repo => 
        repo.name.toLowerCase().includes(query.toLowerCase()) ||
        repo.full_name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredRepos(localFiltered);
    } finally {
      setIsSearching(false);
    }
  }, [repositoryOwner, repositories, searchCache]);

  // Set GitHub access token from integration service
  useEffect(() => {
    const accessToken = integrationService.getAccessToken('github');
    githubApi.setAccessToken(accessToken);
  }, []);

  // Load user's organizations and repositories on mount
  useEffect(() => {
    if (integrationService.isConnected('github')) {
      loadUserData();
    }
  }, [loadUserData]);

  // Filter repositories based on search query with smart search
  useEffect(() => {
    // Don't run search logic when we're in the middle of selecting
    if (isSelecting) {
      return;
    }

    if (searchQuery.trim()) {
      // First, try to filter from existing repositories
      const localFiltered = repositories.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // If we have good local results (more than 3 matches), use them
      if (localFiltered.length >= 3) {
        setFilteredRepos(localFiltered);
        setSearchResults([]);
      } else {
        // If local results are limited, trigger API search with debounce
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
          performSmartSearch(searchQuery);
        }, 300); // 300ms debounce
      }
    } else {
      setFilteredRepos(repositories);
      setSearchResults([]);
    }
  }, [searchQuery, repositories, isSelecting, performSmartSearch]);

  const handleOwnerSelect = async (owner: string) => {
    onRepositoryOwnerChange(owner);
    setShowOwnerDropdown(false);
    setSearchQuery('');
    
    // Load repositories for the selected owner
    await loadRepositoriesForOwner(owner);
  };

  const handleRepositorySelect = (repoName: string) => {
    setIsSelecting(true);
    onRepositoryNameChange(repoName);
    setShowRepoDropdown(false);
    setSearchQuery(''); // Clear search query to reset to normal state
    setSearchResults([]); // Clear search results
    setFilteredRepos(repositories); // Reset to show all repositories
    
    // Clear any pending search timeouts
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    // Reset the selecting flag after a brief delay
    setTimeout(() => {
      setIsSelecting(false);
    }, 100);
  };

  const handleOwnerInputFocus = () => {
    if (!showOwnerDropdown) {
      setShowOwnerDropdown(true);
    }
    if (organizations.length === 0 && !loading) {
      loadUserData();
    }
  };

  const handleRepoInputFocus = () => {
    if (!showRepoDropdown) {
      setShowRepoDropdown(true);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutsideOwner = ownerDropdownRef.current && !ownerDropdownRef.current.contains(target);
      const isOutsideRepo = repoDropdownRef.current && !repoDropdownRef.current.contains(target);
      
      if (isOutsideOwner && isOutsideRepo) {
        setShowOwnerDropdown(false);
        setShowRepoDropdown(false);
      }
    };

    // Use a slight delay to prevent conflicts with button clicks
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const renderOwnerOptions = () => {
    const allOwners = organizations;

    if (loading) {
      return (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
          <span className="ml-2 text-sm text-gray-500">Loading...</span>
        </div>
      );
    }

    if (allOwners.length === 0 && !loading) {
      return (
        <div className="py-4 text-center text-sm text-gray-500">
          No owners found
        </div>
      );
    }

    return (
      <div className="max-h-60 overflow-y-auto">
        {allOwners.map((owner) => (
          <button
            key={owner.id}
            onClick={() => handleOwnerSelect(owner.login)}
            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
          >
            {owner.type === 'Organization' ? (
              <Building2 className="w-4 h-4 text-gray-500" />
            ) : (
              <Users className="w-4 h-4 text-gray-500" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">{owner.login}</div>
              <div className="text-sm text-gray-500 capitalize">{owner.type}</div>
            </div>
            {repositoryOwner === owner.login && (
              <Check className="w-4 h-4 text-blue-600" />
            )}
          </button>
        ))}
      </div>
    );
  };

  const renderRepositoryOptions = () => {
    if (loading || isSearching) {
      return (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
          <span className="ml-2 text-sm text-gray-500">
            {isSearching ? 'Searching repositories...' : 'Loading...'}
          </span>
        </div>
      );
    }

    if (filteredRepos.length === 0 && !loading && !isSearching) {
      return (
        <div className="py-4 text-center text-sm text-gray-500">
          {repositoryOwner ? `No repositories found for ${repositoryOwner}` : 'No repositories found'}
        </div>
      );
    }

    return (
      <div className="max-h-60 overflow-y-auto">
        {/* Show search indicator if we're using search results */}
        {searchResults.length > 0 && searchQuery.trim() && (
          <div className="px-4 py-2 text-xs text-blue-600 bg-blue-50 border-b border-blue-200">
            🔍 Search results for "{searchQuery}"
          </div>
        )}
        
        {filteredRepos.map((repo) => (
          <button
            key={repo.id}
            type="button"
            onClick={() => handleRepositorySelect(repo.name)}
            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors cursor-pointer"
            style={{ pointerEvents: 'auto' }}
          >
            <Github className="w-4 h-4 text-gray-500" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">{repo.name}</div>
              {repo.description && (
                <div className="text-sm text-gray-500 truncate">{repo.description}</div>
              )}
              <div className="text-xs text-gray-400">
                {repo.owner.login} • {repo.private ? 'Private' : 'Public'}
              </div>
            </div>
            {repositoryName === repo.name && (
              <Check className="w-4 h-4 text-blue-600" />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={horizontal ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-4"}>
      {/* Repository Owner Input */}
      <div className="relative" ref={ownerDropdownRef}>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Repository Owner
        </label>
        <div className="relative">
          <input
            ref={ownerInputRef}
            type="text"
            value={repositoryOwner}
            onChange={(e) => handleOwnerSearch(e.target.value)}
            onFocus={handleOwnerInputFocus}
            placeholder="username or organization"
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowOwnerDropdown(!showOwnerDropdown);
            }}
            disabled={disabled}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showOwnerDropdown ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {showOwnerDropdown && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            {renderOwnerOptions()}
          </div>
        )}
      </div>

      {/* Repository Name Input */}
      <div className="relative" ref={repoDropdownRef}>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Repository Name
        </label>
        <div className="relative">
          <input
            ref={repoInputRef}
            type="text"
            value={repositoryName}
            onChange={(e) => {
              onRepositoryNameChange(e.target.value);
              handleRepositorySearch(e.target.value);
            }}
            onFocus={handleRepoInputFocus}
            placeholder="repository-name"
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowRepoDropdown(!showRepoDropdown);
            }}
            disabled={disabled}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showRepoDropdown ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {showRepoDropdown && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            {renderRepositoryOptions()}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className={`text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg ${horizontal ? 'sm:col-span-2' : ''}`}>
          {error}
        </div>
      )}

      {/* GitHub Connection Status */}
      {integrationService.isConnected('github') ? (
        <div className={`flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg ${horizontal ? 'sm:col-span-2' : ''}`}>
          <Github className="w-4 h-4" />
          <span>GitHub integration connected</span>
        </div>
      ) : (
        <div className={`flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg ${horizontal ? 'sm:col-span-2' : ''}`}>
          <Github className="w-4 h-4" />
          <span>GitHub integration not connected</span>
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
