import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import Layout from '../components/Layout';
import ProgressBar from '../components/ProgressBar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Loader2, Save } from 'lucide-react';
import { getQuestionFeedback } from '../utils/llmUtils';
import { playAudio } from '../utils/speechUtils';

const Questions: React.FC = () => {
  const { questions, questionProgress, updateQuestionProgress, userInfo, researchDocs } = useStore();
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Calculate progress
  const completedQuestions = Object.values(questionProgress).filter(p => p.completed).length;
  
  // Separate common questions from the rest
  const commonQuestions = useMemo(() => {
    return questions.filter(q => q.isMostCommon);
  }, [questions]);
  
  const otherQuestions = useMemo(() => {
    return questions.filter(q => !q.isMostCommon);
  }, [questions]);
  
  // Get current question
  const currentQuestion = useMemo(() => {
    return questions.find(q => q.id === selectedQuestionId);
  }, [questions, selectedQuestionId]);
  
  // Load progress data when a question is selected
  useEffect(() => {
    if (selectedQuestionId) {
      const progress = questionProgress[selectedQuestionId];
      if (progress) {
        setAnswer(progress.answer || '');
        setFeedback(progress.feedback || '');
      } else {
        setAnswer('');
        setFeedback('');
      }
    }
  }, [selectedQuestionId, questionProgress]);
  
  const handleQuestionSelect = (id: string) => {
    // Auto-save current answer if needed
    if (selectedQuestionId && answer.trim() && answer !== questionProgress[selectedQuestionId]?.answer) {
      updateQuestionProgress(selectedQuestionId, { answer });
    }
    
    setSelectedQuestionId(id);
  };
  
  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value);
  };
  
  const handleSaveAnswer = () => {
    if (selectedQuestionId && answer.trim()) {
      updateQuestionProgress(selectedQuestionId, { answer });
    }
  };
  
  const handleGetFeedback = async () => {
    if (!selectedQuestionId || !currentQuestion || !answer.trim() || !userInfo) return;
    
    setLoading(true);
    
    try {
      // Get research doc content if needed
      let additionalContext = '';
      if (currentQuestion.researchInfo && researchDocs) {
        additionalContext = researchDocs[currentQuestion.researchInfo] || '';
      }
      
      const result = await getQuestionFeedback(
        currentQuestion.question,
        answer,
        currentQuestion.doc + '\n' + additionalContext,
        userInfo
      );
      
      setFeedback(result);
      updateQuestionProgress(selectedQuestionId, {
        answer,
        feedback: result,
        completed: true
      });
      
    } catch (error) {
      console.error("Failed to get feedback:", error);
      setFeedback("Sorry, there was a problem getting feedback for your answer. Please try again.");
    }
    
    setLoading(false);
  };
  
  const handlePlayVoice = async (voiceUrl: string) => {
    try {
      await playAudio(voiceUrl);
    } catch (error) {
      console.error("Failed to play audio:", error);
    }
  };
  
  // If no question is selected, show the question list
  if (!selectedQuestionId) {
    return (
      <Layout title="Questions Preparation">
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="mb-6">
            <ProgressBar 
              value={completedQuestions} 
              max={questions.length} 
              label="Questions Progress" 
            />
          </div>
          
          {/* Common Questions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Top 5 Common Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {commonQuestions.map((question) => {
                const progress = questionProgress[question.id];
                const isCompleted = progress?.completed;
                
                return (
                  <Card 
                    key={question.id}
                    className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
                      isCompleted ? 'border-green-500' : ''
                    }`}
                    onClick={() => handleQuestionSelect(question.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">{question.label}</div>
                        <div className="font-medium">{question.question}</div>
                      </div>
                      {isCompleted && (
                        <div className="ml-2 text-green-500">
                          <Check className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
          
          {/* Other Questions */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Other Important Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherQuestions.map((question) => {
                const progress = questionProgress[question.id];
                const isCompleted = progress?.completed;
                
                return (
                  <Card 
                    key={question.id}
                    className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
                      isCompleted ? 'border-green-500' : ''
                    }`}
                    onClick={() => handleQuestionSelect(question.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">{question.label}</div>
                        <div className="font-medium">{question.question}</div>
                      </div>
                      {isCompleted && (
                        <div className="ml-2 text-green-500">
                          <Check className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Show question details
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setSelectedQuestionId(null)}>
            Back to Questions
          </Button>
          <div className="text-sm text-gray-500">
            {completedQuestions} of {questions.length} Complete
          </div>
        </div>
        
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-2">{currentQuestion?.question}</h2>
          <p className="text-gray-500 mb-6">{currentQuestion?.label}</p>
          
          <Tabs defaultValue="tutorial" className="mb-8">
            <TabsList className="w-full">
              <TabsTrigger value="tutorial" className="flex-1">Tutorial</TabsTrigger>
              <TabsTrigger value="answer" className="flex-1">Your Answer</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tutorial" className="mt-6">
              <div className="prose">
                {currentQuestion?.doc}
              </div>
              
              {/* Sample Good Answers */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-3">Sample Good Answers</h3>
                <div className="space-y-4">
                  {currentQuestion?.sampleAnswers.good.map((sample, index) => (
                    <Card key={index} className="p-4 bg-green-50">
                      <p className="mb-2">{sample.text}</p>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-sm text-green-700"><strong>Why it's good:</strong> {sample.why}</p>
                        {sample.voiceUrl && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handlePlayVoice(sample.voiceUrl)}
                          >
                            Play Voice
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* Sample Bad Answers */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-3">Sample Poor Answers</h3>
                <div className="space-y-4">
                  {currentQuestion?.sampleAnswers.bad.map((sample, index) => (
                    <Card key={index} className="p-4 bg-red-50">
                      <p className="mb-2">{sample.text}</p>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-sm text-red-700"><strong>Why it's poor:</strong> {sample.why}</p>
                        {sample.voiceUrl && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handlePlayVoice(sample.voiceUrl)}
                          >
                            Play Voice
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* Variations */}
              {currentQuestion?.variations && currentQuestion.variations.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-3">Question Variations</h3>
                  <div className="space-y-3">
                    {currentQuestion.variations.map((variation, index) => (
                      <Card key={index} className="p-3 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <p>{variation.text}</p>
                          {variation.voiceUrl && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handlePlayVoice(variation.voiceUrl)}
                            >
                              Play Voice
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="answer" className="mt-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Answer
                </label>
                <Textarea 
                  value={answer}
                  onChange={handleAnswerChange}
                  placeholder="Type your answer here..."
                  className="min-h-[150px]"
                />
              </div>
              
              <div className="flex gap-4 mb-8">
                <Button 
                  variant="outline"
                  onClick={handleSaveAnswer}
                  className="flex items-center"
                  disabled={!answer.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                
                <Button 
                  onClick={handleGetFeedback}
                  className="flex items-center"
                  disabled={!answer.trim() || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Getting Feedback...
                    </>
                  ) : (
                    'Get Feedback'
                  )}
                </Button>
              </div>
              
              {feedback && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Feedback</h3>
                  <p>{feedback}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </Layout>
  );
};

export default Questions;
