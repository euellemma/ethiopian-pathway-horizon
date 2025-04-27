
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const InterviewHistory: React.FC = () => {
  const navigate = useNavigate();
  const { interviewSessions } = useStore();
  
  // Sort sessions by date (newest first)
  const sortedSessions = [...interviewSessions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  return (
    <Layout title="Interview History">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/interview')}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Interviews
          </Button>
        </div>
        
        {sortedSessions.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No interview sessions yet</h3>
            <p className="text-gray-600 mb-6">Start a mock interview session to practice for your visa interview</p>
            <Button 
              onClick={() => navigate('/interview/session')}
              className="bg-horizon-red hover:bg-red-700"
            >
              Start Your First Interview
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedSessions.map((session) => {
              const formattedDate = new Date(session.date).toLocaleDateString();
              
              return (
                <Card 
                  key={session.id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/interview/results/${session.id}`)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{session.title}</h3>
                      <p className="text-sm text-gray-500">{formattedDate}</p>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="flex mr-2">
                        {[...Array(Math.min(5, 10))].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < session.rating / 2 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InterviewHistory;
