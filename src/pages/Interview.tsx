
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Layout from '../components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, ListChecks } from 'lucide-react';

const Interview: React.FC = () => {
  const navigate = useNavigate();
  const { interviewSessions } = useStore();
  
  const handleStartInterview = () => {
    navigate('/interview/session');
  };
  
  const handleViewPastConversations = () => {
    navigate('/interview/history');
  };
  
  return (
    <Layout title="AI Mock Interview">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 flex flex-col">
            <div className="mb-6 flex-grow">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-horizon-red rounded-full flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">Start New Interview</h3>
              <p className="text-gray-600 text-center">
                Begin a simulated visa interview with our AI consular officer. Practice answering questions and receive instant feedback.
              </p>
            </div>
            <Button 
              onClick={handleStartInterview}
              className="w-full bg-horizon-red hover:bg-red-700"
            >
              Start Interview
            </Button>
          </Card>
          
          <Card className="p-6 flex flex-col">
            <div className="mb-6 flex-grow">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <ListChecks className="h-8 w-8 text-gray-700" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">Past Conversations</h3>
              <p className="text-gray-600 text-center">
                Review your previous interview sessions, check feedback, and track your improvement over time.
              </p>
            </div>
            <Button 
              onClick={handleViewPastConversations}
              variant="outline"
              className="w-full"
            >
              View Past Conversations ({interviewSessions.length})
            </Button>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Interview;
