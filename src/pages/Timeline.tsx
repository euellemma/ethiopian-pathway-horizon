
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ProgressBar from '../components/ProgressBar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';

const Timeline: React.FC = () => {
  const navigate = useNavigate();
  const { timelineItems, timelineProgress, updateTimelineProgress, addPoints } = useStore();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [showingQuiz, setShowingQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  
  // Calculate overall timeline progress
  const completedItems = Object.values(timelineProgress).filter(p => p.completed).length;
  const totalItems = timelineItems.length;
  const overallProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  
  const handleItemSelect = (id: string) => {
    setSelectedItemId(id);
    setSlideIndex(0);
    setShowingQuiz(false);
    setQuizAnswers([]);
  };
  
  const handleNextSlide = () => {
    const currentItem = timelineItems.find(item => item.id === selectedItemId);
    if (!currentItem) return;
    
    if (slideIndex < currentItem.slides.length - 1) {
      setSlideIndex(slideIndex + 1);
    } else {
      setShowingQuiz(true);
    }
  };
  
  const handlePrevSlide = () => {
    if (slideIndex > 0) {
      setSlideIndex(slideIndex - 1);
    }
  };
  
  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    // Update quiz answers
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);
    
    // Check if all questions are answered
    const currentItem = timelineItems.find(item => item.id === selectedItemId);
    if (!currentItem) return;
    
    // Calculate correct answers
    const correctAnswers = newAnswers.reduce((count, answer, index) => {
      return count + (currentItem.quiz[index]?.correctIndex === answer ? 1 : 0);
    }, 0);
    
    // Check if this is the last question
    if (questionIndex === currentItem.quiz.length - 1) {
      const totalQuestions = currentItem.quiz.length;
      
      // Calculate points (10 points per correct answer)
      const points = correctAnswers * 10;
      addPoints(points);
      
      // Mark as completed
      updateTimelineProgress(currentItem.id, {
        completed: true,
        correctAnswers,
        totalQuestions
      });
    }
  };
  
  const handleBackToTimeline = () => {
    setSelectedItemId(null);
    setShowingQuiz(false);
    setSlideIndex(0);
    setQuizAnswers([]);
  };
  
  // Get current item
  const currentItem = selectedItemId 
    ? timelineItems.find(item => item.id === selectedItemId) 
    : null;
  
  // Get current slide
  const currentSlide = currentItem && !showingQuiz 
    ? currentItem.slides[slideIndex] 
    : null;
  
  // If no item is selected, show the timeline
  if (!selectedItemId) {
    return (
      <Layout title="Visa Process Timeline">
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="mb-6">
            <ProgressBar 
              value={completedItems} 
              max={totalItems} 
              label="Timeline Progress" 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timelineItems.map((item) => {
              const progress = timelineProgress[item.id];
              const isCompleted = progress?.completed;
              
              return (
                <Card key={item.id} className="overflow-hidden">
                  <div className="relative">
                    {item.imageUrl && (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    {isCompleted && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white p-1 rounded-full">
                        <Check className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    {isCompleted && (
                      <p className="text-sm text-gray-500 mb-4">
                        Score: {progress.correctAnswers} / {progress.totalQuestions} correct
                      </p>
                    )}
                    <Button 
                      onClick={() => handleItemSelect(item.id)}
                      variant="outline"
                      className="w-full"
                    >
                      {isCompleted ? "Review" : "Start"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </Layout>
    );
  }
  
  // Show slides
  if (!showingQuiz && currentSlide) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-8 px-4">
          <div className="mb-6 flex justify-between items-center">
            <Button variant="ghost" onClick={handleBackToTimeline}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Timeline
            </Button>
            
            <div className="text-sm text-gray-500">
              Slide {slideIndex + 1} of {currentItem.slides.length}
            </div>
          </div>
          
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">{currentItem.title}</h2>
            
            {currentSlide.imageUrl && (
              <div className="mb-6">
                <img 
                  src={currentSlide.imageUrl} 
                  alt={currentSlide.text}
                  className="w-full h-auto rounded-md"
                />
              </div>
            )}
            
            <h3 className="text-xl font-semibold mb-4">{currentSlide.text}</h3>
            
            <div className="prose max-w-none mb-8">
              {currentSlide.subtext}
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handlePrevSlide}
                disabled={slideIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button onClick={handleNextSlide}>
                {slideIndex < currentItem.slides.length - 1 ? "Next" : "Start Quiz"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }
  
  // Show quiz
  if (showingQuiz && currentItem) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-8 px-4">
          <div className="mb-6 flex justify-between items-center">
            <Button variant="ghost" onClick={handleBackToTimeline}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Timeline
            </Button>
            
            <div className="text-sm text-gray-500">
              {currentItem.quiz.length} Questions
            </div>
          </div>
          
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">{currentItem.title} - Quiz</h2>
            
            <div className="space-y-8">
              {currentItem.quiz.map((question, questionIndex) => {
                const userAnswer = quizAnswers[questionIndex];
                const hasAnswered = userAnswer !== undefined;
                const isCorrect = hasAnswered && userAnswer === question.correctIndex;
                
                return (
                  <div key={questionIndex} className="border rounded-md p-4">
                    <h3 className="text-lg font-medium mb-4">{question.prompt}</h3>
                    
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <button
                          key={optionIndex}
                          onClick={() => {
                            if (!hasAnswered) {
                              handleQuizAnswer(questionIndex, optionIndex);
                            }
                          }}
                          disabled={hasAnswered}
                          className={`w-full text-left p-3 border rounded-md transition-colors ${
                            hasAnswered && optionIndex === question.correctIndex
                              ? 'bg-green-100 border-green-500'
                              : hasAnswered && optionIndex === userAnswer
                              ? 'bg-red-100 border-red-500'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    
                    {hasAnswered && (
                      <div className={`mt-4 p-3 rounded-md ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                        <p className={`font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                          {isCorrect ? 'Correct!' : 'Incorrect'}
                        </p>
                        <p className="text-gray-700 mt-1">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8">
              <Button 
                onClick={handleBackToTimeline}
                className="w-full"
              >
                Back to Timeline
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }
  
  return null;
};

export default Timeline;
