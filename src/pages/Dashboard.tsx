import React from 'react';
import { useStore } from '../store/useStore';
import Layout from '../components/Layout';
import ModuleCard from '../components/ModuleCard';
import ProgressBar from '../components/ProgressBar';
import { BookOpen, Calendar, MessageSquare } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { 
    timelineItems, 
    timelineProgress, 
    questions, 
    questionProgress, 
    interviewSessions 
  } = useStore();
  
  // Calculate timeline progress
  const timelineCompleted = Object.values(timelineProgress).filter(p => p.completed).length;
  const timelineTotal = timelineItems.length || 1;
  const timelinePercentage = (timelineCompleted / timelineTotal) * 100;
  
  // Calculate questions progress
  const questionsCompleted = Object.values(questionProgress).filter(p => p.completed).length;
  const questionsTotal = questions.length || 1;
  const questionsPercentage = (questionsCompleted / questionsTotal) * 100;
  
  // Calculate mock interviews - completed if at least one interview is done
  const interviewPercentage = interviewSessions.length > 0 ? 100 : 0;
  
  // Calculate overall progress based on completion of items
  const overallPercentage = (
    timelinePercentage + 
    questionsPercentage + 
    interviewPercentage
  ) / 3;
  
  return (
    <Layout title="Dashboard">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Overall Progress */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Overall Progress</h2>
          <ProgressBar 
            value={Math.round(overallPercentage)} 
            max={100} 
            label="Visa Interview Preparation"
          />
        </div>
        
        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ModuleCard
            title="Visa Process Timeline"
            description="Learn about the steps in the US student visa process with interactive guides and quizzes."
            to="/timeline"
            progress={timelinePercentage}
            icon={<Calendar className="h-6 w-6" />}
          />
          
          <ModuleCard
            title="Questions Prep"
            description="Practice answers to common visa interview questions and receive AI feedback."
            to="/questions"
            progress={questionsPercentage}
            icon={<BookOpen className="h-6 w-6" />}
          />
          
          <ModuleCard
            title="AI Mock Interview"
            description="Simulate a real visa interview with our AI interviewer and get personalized feedback."
            to="/interview"
            progress={interviewPercentage}
            icon={<MessageSquare className="h-6 w-6" />}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
