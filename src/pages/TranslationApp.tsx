import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import UploadSection from '../components/UploadSection';
import TranslationProgress from '../components/TranslationProgress';
import LanguageSelector from '../components/LanguageSelector';
import ProjectManager from '../components/ProjectManager';
import ExportPanel from '../components/ExportPanel';
import TranslationAnalytics from '../components/TranslationAnalytics';
import TranslationQuality from '../components/TranslationQuality';
import LiveTranslationViewer from '../components/LiveTranslationViewer';
import AIProviderSettings from '../components/settings/AIProviderSettings';
import SmartTranslationSuggestions from '../components/SmartTranslationSuggestions';
import BatchOperations from '../components/BatchOperations';
import MobileNav from '../components/mobile/MobileNav';
import FloatingAddProject from '../components/FloatingAddProject';
import { translationDB } from '../utils/database';
import { TranslationProject } from '../types/translation';
import { LogOut, Settings, Home, Sparkles, Zap, Brain, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const TranslationApp = () => {
  const { user, logout } = useAuth();
  const [currentProject, setCurrentProject] = useState<TranslationProject | null>(null);
  const [projects, setProjects] = useState<TranslationProject[]>([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [extractionMethod, setExtractionMethod] = useState<'traditional' | 'ai'>('ai');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allProjects = await translationDB.projects.toArray();
      setProjects(allProjects);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects. Database may not be initialized.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectCreate = (project: TranslationProject) => {
    setCurrentProject(project);
    setProjects(prev => [...prev, project]);
    setActiveTab('translate');
  };

  const handleProjectSelect = (project: TranslationProject) => {
    setCurrentProject(project);
    setActiveTab('translate');
  };

  const handleAddProject = () => {
    setActiveTab('upload');
    setCurrentProject(null);
  };

  const handleFilesProcessed = async (files: Array<{ name: string; content: string; size: number }>) => {
    try {
      // Combine all file contents
      const combinedContent = files.map(file => file.content).join('\n\n');
      
      // Create a new project from the processed files
      const newProject: TranslationProject = {
        id: Date.now().toString(),
        name: files.length === 1 ? files[0].name.split('.')[0] : `Multi-File Project_${Date.now()}`,
        status: 'ready',
        sourceLanguage: 'auto',
        targetLanguages: [],
        totalChunks: Math.ceil(combinedContent.split(' ').length / 1000), // Rough estimate
        translatedChunks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        originalContent: combinedContent, // Set the original content properly
        fileType: files[0].name.split('.').pop() as any || 'txt',
        completedChunks: 0,
        progress: 0,
        files: files.map((file, index) => ({
          id: `file_${index}`,
          name: file.name,
          size: file.size,
          content: file.content,
          type: file.name.split('.').pop() || 'txt',
          uploadedAt: new Date()
        }))
      };

      // Save to database
      await translationDB.projects.add(newProject);
      
      // Update state
      setCurrentProject(newProject);
      setProjects(prev => [...prev, newProject]);
      setActiveTab('translate');
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleBatchOperation = async (action: string, projectIds: string[]) => {
    console.log(`Executing batch operation: ${action} on projects:`, projectIds);
    // Here you would implement the actual batch operations
    // For now, just reload projects to reflect any changes
    await loadProjects();
  };

  const tabs = [
    { id: 'upload', label: 'Upload', icon: '📤' },
    { id: 'projects', label: 'Projects', icon: '📁' },
    { id: 'translate', label: 'Translate', icon: '🔄' },
    { id: 'suggestions', label: 'AI Assist', icon: '🧠' },
    { id: 'batch', label: 'Batch Ops', icon: '📦' },
    { id: 'live', label: 'Live View', icon: '👁️' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'quality', label: 'Quality', icon: '⭐' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="text-4xl md:text-6xl mb-4">⚠️</div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Something went wrong</h2>
          <p className="text-white/60 mb-6 text-sm md:text-base">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              loadProjects();
            }} 
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-2xl font-medium mr-4"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin text-4xl md:text-6xl mb-4">⚙️</div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Loading TextWeaver Pro</h2>
          <p className="text-white/60 text-sm md:text-base">Initializing your translation workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-md border-b border-white/10">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="text-xl md:text-2xl">🌐</div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-white">TextWeaver Pro</h1>
                <p className="text-white/60 text-xs md:text-sm hidden sm:block">Professional Document Translation</p>
              </div>
            </div>
            
            {/* Extraction Method Toggle */}
            <div className="hidden md:flex items-center gap-4 mr-4">
              <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/20">
                <button
                  onClick={() => setExtractionMethod('traditional')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    extractionMethod === 'traditional'
                      ? 'bg-green-500 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Zap className="w-3 h-3 mr-1 inline" />
                  Fast
                </button>
                <button
                  onClick={() => setExtractionMethod('ai')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    extractionMethod === 'ai'
                      ? 'bg-purple-500 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3 h-3 mr-1 inline" />
                  AI
                </button>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-white text-sm">Wallet Balance</p>
                <p className="text-white font-bold">${user?.walletBalance.toFixed(2) || '0.00'}</p>
              </div>
              <Link to="/dashboard">
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  <Home className="w-4 h-4 mr-1" />
                  Dashboard
                </Button>
              </Link>
              {user?.roles?.includes('admin') && (
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                    <Settings className="w-4 h-4 mr-1" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button 
                onClick={logout} 
                variant="outline" 
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
            
            {/* Mobile Navigation */}
            <MobileNav />
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-4 md:py-8">
          {/* Navigation Tabs */}
          <div className="flex justify-center mb-6 md:mb-8 overflow-x-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20 min-w-max">
              <div className="flex space-x-1 md:space-x-2">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 md:px-6 py-2 md:py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap text-sm md:text-base ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-sm md:text-lg">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'upload' && (
              <UploadSection 
                onFilesProcessed={handleFilesProcessed}
                extractionMethod={extractionMethod}
                onExtractionMethodChange={setExtractionMethod}
              />
            )}
            
            {activeTab === 'projects' && (
              <ProjectManager 
                projects={projects} 
                onProjectSelect={handleProjectSelect}
                onProjectsUpdate={loadProjects}
              />
            )}
            
            {activeTab === 'translate' && currentProject && (
              <div className="space-y-6 md:space-y-8 px-4 md:px-0">
                <LanguageSelector 
                  project={currentProject}
                  onUpdate={setCurrentProject}
                />
                <TranslationProgress project={currentProject} />
                <ExportPanel project={currentProject} />
              </div>
            )}

            {activeTab === 'translate' && !currentProject && (
              <div className="text-center py-12 md:py-16 px-4">
                <div className="text-4xl md:text-6xl mb-4">🔄</div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-4">No Project Selected</h3>
                <p className="text-white/60 text-sm md:text-lg mb-6 md:mb-8 max-w-md mx-auto">
                  Select a project from the Projects tab or create a new one
                </p>
                <motion.button
                  onClick={() => setActiveTab('projects')}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 md:px-8 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Projects
                </motion.button>
              </div>
            )}

            {/* New AI Suggestions Tab */}
            {activeTab === 'suggestions' && currentProject && (
              <div className="px-4 md:px-0">
                <div className="text-center mb-6 md:mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">🧠 AI Translation Assistant</h2>
                  <p className="text-white/60 text-sm md:text-lg">
                    Smart suggestions to improve your translation workflow
                  </p>
                </div>
                <SmartTranslationSuggestions 
                  project={currentProject}
                  onApplySuggestion={(suggestionId) => {
                    console.log('Applied suggestion:', suggestionId);
                    // Handle suggestion application
                  }}
                />
              </div>
            )}

            {activeTab === 'suggestions' && !currentProject && (
              <div className="text-center py-12 md:py-16 px-4">
                <div className="text-4xl md:text-6xl mb-4">🧠</div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-4">No Project Selected</h3>
                <p className="text-white/60 text-sm md:text-lg mb-6 md:mb-8 max-w-md mx-auto">
                  Select a project to get AI-powered translation suggestions
                </p>
                <motion.button
                  onClick={() => setActiveTab('projects')}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 md:px-8 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Select Project
                </motion.button>
              </div>
            )}

            {/* New Batch Operations Tab */}
            {activeTab === 'batch' && (
              <div className="px-4 md:px-0">
                <div className="text-center mb-6 md:mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">📦 Batch Operations</h2>
                  <p className="text-white/60 text-sm md:text-lg">
                    Manage multiple translation projects efficiently
                  </p>
                </div>
                <BatchOperations 
                  projects={projects}
                  onBatchAction={handleBatchOperation}
                />
              </div>
            )}

            {activeTab === 'live' && currentProject && (
              <div className="px-4 md:px-0">
                <div className="text-center mb-6 md:mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">👁️ Live Translation View</h2>
                  <p className="text-white/60 text-sm md:text-lg">
                    Watch your translation progress in real-time
                  </p>
                </div>
                <LiveTranslationViewer 
                  project={currentProject} 
                  isActive={activeTab === 'live'}
                />
              </div>
            )}

            {activeTab === 'live' && !currentProject && (
              <div className="text-center py-12 md:py-16 px-4">
                <div className="text-4xl md:text-6xl mb-4">👁️</div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-4">No Project Selected</h3>
                <p className="text-white/60 text-sm md:text-lg mb-6 md:mb-8 max-w-md mx-auto">
                  Select a project to view live translation progress
                </p>
                <motion.button
                  onClick={() => setActiveTab('projects')}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 md:px-8 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Select Project
                </motion.button>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="px-4 md:px-0">
                <div className="text-center mb-6 md:mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">📊 Translation Analytics</h2>
                  <p className="text-white/60 text-sm md:text-lg">
                    Comprehensive insights into your translation projects
                  </p>
                </div>
                <TranslationAnalytics projects={projects} />
              </div>
            )}

            {activeTab === 'quality' && currentProject && (
              <div className="px-4 md:px-0">
                <div className="text-center mb-6 md:mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">⭐ Quality Assessment</h2>
                  <p className="text-white/60 text-sm md:text-lg">
                    Detailed quality analysis for {currentProject.name}
                  </p>
                </div>
                <TranslationQuality project={currentProject} />
              </div>
            )}

            {activeTab === 'quality' && !currentProject && (
              <div className="text-center py-12 md:py-16 px-4">
                <div className="text-4xl md:text-6xl mb-4">⭐</div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-4">No Project Selected</h3>
                <p className="text-white/60 text-sm md:text-lg mb-6 md:mb-8 max-w-md mx-auto">
                  Select a project to view quality assessment
                </p>
                <motion.button
                  onClick={() => setActiveTab('projects')}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 md:px-8 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Select Project
                </motion.button>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="px-4 md:px-0">
                <div className="text-center mb-6 md:mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">⚙️ AI Provider Settings</h2>
                  <p className="text-white/60 text-sm md:text-lg">
                    Configure your AI provider for translation services
                  </p>
                </div>
                <div className="max-w-2xl mx-auto">
                  <AIProviderSettings />
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Floating Add Project Button */}
        {projects.length > 0 && activeTab !== 'upload' && (
          <FloatingAddProject 
            onAddProject={handleAddProject}
            activeProjects={projects.filter(p => p.status === 'processing').length}
          />
        )}
      </div>
    </div>
  );
};

export default TranslationApp;
