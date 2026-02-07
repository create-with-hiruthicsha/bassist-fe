import { FileText, Sparkles, ListTodo, Plus, Bug, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ActionCard from './components/ActionCard';
import ResearchArchitecture from './components/ResearchArchitecture';
import ProfileDropdown from '../../components/ProfileDropdown';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-blue-700 dark:text-blue-400" />
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Bassist</h1>
            </div>
            <div className="flex items-center gap-4">
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            AI-Powered Project Management
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
            Choose what you'd like to do with your project
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <ActionCard
            circleBgClass="bg-blue-100"
            Icon={FileText}
            iconClass="w-8 h-8 text-blue-700"
            title="Generate Documentation"
            description="Create comprehensive documentation from your project files or descriptions"
            buttonLabel="Start DocGen"
            buttonClass="bg-blue-700 hover:bg-blue-800 focus:ring-blue-700"
            onClick={() => navigate('/documents')}
          />

          <ActionCard
            circleBgClass="bg-green-100"
            Icon={ListTodo}
            iconClass="w-8 h-8 text-green-700"
            title="Generate Tasks"
            description="Break down your project into actionable tasks and subtasks"
            buttonLabel="Generate Tasks"
            buttonClass="bg-green-700 hover:bg-green-800 focus:ring-green-700"
            onClick={() => navigate('/tasks')}
          />

          <ActionCard
            circleBgClass="bg-purple-100"
            Icon={Plus}
            iconClass="w-8 h-8 text-purple-700"
            title="Create Tasks"
            description="Create tasks directly in your preferred project management platform"
            buttonLabel="Create Tasks"
            buttonClass="bg-purple-700 hover:bg-purple-800 focus:ring-purple-700"
            onClick={() => navigate('/direct-create-tasks')}
          />

          <div className="md:col-span-3">
            <ActionCard
              circleBgClass="bg-orange-100 dark:bg-orange-900/20"
              Icon={Bug}
              iconClass="w-8 h-8 text-orange-700 dark:text-orange-400"
              title="Bug Fix AI"
              description="Handoff your assigned issues to AI for automatic bug fixing and PR creation"
              buttonLabel="Fix Bugs"
              buttonClass="bg-orange-700 hover:bg-orange-800 focus:ring-orange-700"
              onClick={() => navigate('/bug-fix')}
              horizontal={true}
              runningMode='alpha'
            />
          </div>

          <div className="md:col-span-3">
            <ActionCard
              circleBgClass="bg-indigo-100 dark:bg-indigo-900/20"
              Icon={Zap}
              iconClass="w-8 h-8 text-indigo-700 dark:text-indigo-400"
              title="AI Actions"
              description="Execute any task in natural language using AI and your connected integrations"
              buttonLabel="Try AI Actions"
              buttonClass="bg-indigo-700 hover:bg-indigo-800 focus:ring-indigo-700"
              onClick={() => navigate('/ai-actions')}
              horizontal={true}
              runningMode='alpha'
            />
          </div>

          <div className="md:col-span-3">
            <ResearchArchitecture />
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Each option will guide you through the process step by step
          </p>
        </div>
      </main>
    </div>
  );
}
