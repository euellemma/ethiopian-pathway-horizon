
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Star } from 'lucide-react';

const InterviewResults: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { interviewSessions } = useStore();
  const [session, setSession] = useState<any>(null);
  
  useEffect(() => {
    if (id) {
      const foundSession = interviewSessions.find(s => s.id === id);
      setSession(foundSession);
    }
  }, [id, interviewSessions]);
  
  if (!session) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-8 px-4 text-center">
          <p className="mb-4">Interview session not found.</p>
          <Button onClick={() => navigate('/interview')}>Back to Interviews</Button>
        </div>
      </Layout>
    );
  }
  
  const { title, date, rating, summary, questions = [] } = session;
  const formattedDate = new Date(date).toLocaleDateString();
  
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/interview')}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Interviews
          </Button>
          
          <div className="text-sm text-gray-500">
            {formattedDate}
          </div>
        </div>
        
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          
          <div className="flex items-center mb-4">
            <div className="flex mr-2">
              {[...Array(10)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">{rating}/10</span>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium mb-2">Summary Feedback</h3>
            <p className="text-gray-700">{summary}</p>
          </div>
        </Card>
        
        <h3 className="text-lg font-semibold mb-4">Interview Questions & Answers</h3>
        
        <div className="space-y-6">
          {questions.map((item: any, index: number) => (
            <Card key={index} className="p-6">
              <div className="mb-4">
                <span className="inline-block bg-gray-200 text-gray-800 px-2 py-1 rounded text-sm">
                  Question {index + 1}
                </span>
              </div>
              
              <h4 className="text-lg font-medium mb-3">{item.question}</h4>
              
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-500 mb-1">Your Answer:</h5>
                <p className="bg-gray-50 p-3 rounded-md">{item.answer}</p>
              </div>
              
              <Separator className="my-4" />
              
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-500 mb-1">Feedback:</h5>
                <p className="bg-blue-50 p-3 rounded-md text-gray-700">{item.feedback}</p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-gray-500 mb-1">Improved Answer:</h5>
                <p className="bg-green-50 p-3 rounded-md text-gray-700">{item.improvedAnswer}</p>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="mt-8 flex justify-center">
          <Button onClick={() => navigate('/interview/session')} className="bg-horizon-red hover:bg-red-700">
            Start New Interview
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default InterviewResults;
