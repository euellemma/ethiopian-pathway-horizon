
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { generateInterviewQuestion, getInterviewFeedback, getSessionFeedback } from '../utils/llmUtils';
import { AudioRecorder, playAudio, speechToText, textToSpeech } from '../utils/speechUtils';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Repeat, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const InterviewSession: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userInfo, addInterviewSession, addPoints } = useStore();
  
  // Audio recorder
  const audioRecorder = useRef<AudioRecorder>(new AudioRecorder());
  
  // Interview state
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isInterviewEnded, setIsInterviewEnded] = useState<boolean>(false);
  
  // Initialize interview
  useEffect(() => {
    const startInterview = async () => {
      setIsProcessing(true);
      
      try {
        // Generate first question
        const response = await generateInterviewQuestion(userInfo);
        setCurrentQuestion(response.text);
        
        // Convert to speech
        const audioUrl = await textToSpeech(response.text);
        await playAudio(audioUrl);
        
      } catch (error) {
        console.error("Failed to start interview:", error);
        toast({
          title: "Error",
          description: "Failed to start the interview. Please try again.",
          variant: "destructive",
        });
      }
      
      setIsProcessing(false);
    };
    
    if (userInfo) {
      startInterview();
    }
  }, [userInfo, toast]);
  
  // Start recording
  const handleStartRecording = async () => {
    try {
      await audioRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast({
        title: "Microphone Error",
        description: "Could not access your microphone. Please check permissions and try again.",
        variant: "destructive",
      });
    }
  };
  
  // Stop recording and process answer
  const handleStopRecording = async () => {
    if (!isRecording) return;
    
    setIsRecording(false);
    setIsProcessing(true);
    
    try {
      // Get audio blob
      const audioBlob = await audioRecorder.current.stop();
      
      // Convert to text
      const transcript = await speechToText(audioBlob);
      setCurrentAnswer(transcript);
      
      // Update the interview state
      setQuestions((prev) => [...prev, currentQuestion]);
      setAnswers((prev) => [...prev, transcript]);
      
      // Check if we should continue the interview
      if (questions.length < 7) {
        // Generate next question
        const response = await generateInterviewQuestion(
          userInfo,
          [...questions, currentQuestion],
          [...answers, transcript]
        );
        
        if (response.isEnd) {
          setIsInterviewEnded(true);
          handleEndInterview([...questions, currentQuestion], [...answers, transcript]);
        } else {
          setCurrentQuestion(response.text);
          
          // Convert to speech
          const audioUrl = await textToSpeech(response.text);
          await playAudio(audioUrl);
        }
      } else {
        // End interview if we've reached the maximum number of questions
        setIsInterviewEnded(true);
        handleEndInterview([...questions, currentQuestion], [...answers, transcript]);
      }
    } catch (error) {
      console.error("Failed to process recording:", error);
      toast({
        title: "Error",
        description: "Failed to process your answer. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsProcessing(false);
  };
  
  // Repeat current question
  const handleRepeatQuestion = async () => {
    setIsProcessing(true);
    
    try {
      const audioUrl = await textToSpeech(currentQuestion);
      await playAudio(audioUrl);
    } catch (error) {
      console.error("Failed to repeat question:", error);
    }
    
    setIsProcessing(false);
  };
  
  // End interview and navigate to results
  const handleEndInterview = async (finalQuestions: string[], finalAnswers: string[]) => {
    setIsProcessing(true);
    
    try {
      // Generate feedback for each answer
      const feedbackPromises = finalQuestions.map((question, index) => {
        return getInterviewFeedback(question, finalAnswers[index] || '', userInfo);
      });
      
      const feedbackResults = await Promise.all(feedbackPromises);
      
      // Generate overall feedback
      const sessionFeedback = await getSessionFeedback(finalQuestions, finalAnswers, userInfo);
      
      // Create interview session
      const session = {
        id: Date.now().toString(),
        title: sessionFeedback.title,
        date: new Date().toISOString(),
        rating: sessionFeedback.rating,
        summary: sessionFeedback.summary,
        questions: finalQuestions.map((question, index) => ({
          question,
          answer: finalAnswers[index] || '',
          feedback: feedbackResults[index]?.feedback || '',
          improvedAnswer: feedbackResults[index]?.improvedAnswer || '',
        })),
      };
      
      // Add points (rating × 10)
      addPoints(session.rating * 10);
      
      // Save session
      addInterviewSession(session);
      
      // Navigate to results
      navigate(`/interview/results/${session.id}`);
      
    } catch (error) {
      console.error("Failed to end interview:", error);
      toast({
        title: "Error",
        description: "Failed to process your interview. Your answers were recorded but we couldn't generate feedback.",
        variant: "destructive",
      });
      navigate('/interview');
    }
  };
  
  // Cancel interview
  const handleCancelInterview = () => {
    navigate('/interview');
  };
  
  return (
    <Layout showNavigation={false}>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <Card className="p-6">
          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-bold">Mock Visa Interview</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCancelInterview}
              disabled={isProcessing}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
          
          <div className="bg-gray-100 rounded-xl p-6 mb-6 min-h-[200px] flex items-center justify-center">
            <div className="text-center">
              {isProcessing ? (
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full border-4 border-horizon-red border-t-transparent animate-spin mb-4" />
                  <p className="text-gray-700">Processing...</p>
                </div>
              ) : (
                <>
                  <p className="text-lg mb-4">{currentQuestion}</p>
                  {currentAnswer && (
                    <div className="mt-4 p-4 bg-white rounded-md">
                      <p className="text-sm text-gray-500 mb-1">Your answer:</p>
                      <p className="text-gray-700">{currentAnswer}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={handleRepeatQuestion}
              disabled={isProcessing || isRecording || isInterviewEnded}
            >
              <Repeat className="h-4 w-4 mr-2" />
              Repeat
            </Button>
            
            {!isRecording ? (
              <Button
                className="bg-horizon-red hover:bg-red-700"
                onClick={handleStartRecording}
                disabled={isProcessing || isInterviewEnded}
              >
                <Mic className="h-4 w-4 mr-2" />
                Start Speaking
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleStopRecording}
                disabled={isProcessing}
              >
                <MicOff className="h-4 w-4 mr-2" />
                Stop Speaking
              </Button>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default InterviewSession;
