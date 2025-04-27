import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { generateResearchDoc } from '../utils/llmUtils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import Layout from '../components/Layout';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUserInfo, setResearchDocs, setOnboardingCompleted, setTimelineItems, setQuestions } = useStore();
  
  const [formState, setFormState] = useState({
    name: '',
    gender: '' as 'Male' | 'Female',
    highschool: '',
    intendedCollege: '',
    fieldOfStudy: '',
    fundingSources: '',
    city: '',
    levelOfStudy: '',
    gapYears: 0,
    intakeYear: '',
  });
  
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that gender is either 'Male' or 'Female'
    if (formState.gender !== 'Male' && formState.gender !== 'Female') {
      toast({
        title: "Invalid Gender",
        description: "Please select either Male or Female",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Fetch timeline and questions data
      const [timelineResponse, questionsResponse] = await Promise.all([
        fetch('/timeline.json'),
        fetch('/questions.json')
      ]);
      
      if (!timelineResponse.ok || !questionsResponse.ok) {
        throw new Error("Failed to load application data");
      }
      
      const timelineData = await timelineResponse.json();
      const questionsData = await questionsResponse.json();
      
      // Save to store
      setTimelineItems(timelineData);
      setQuestions(questionsData);
      
      // Generate research docs
      const docTypes = ["why-usa", "why-college", "why-field", "field-and-careers"] as const;
      const researchDocs = {} as any;
      
      for (const docType of docTypes) {
        try {
          const content = await generateResearchDoc(docType, formState);
          researchDocs[docType] = content;
        } catch (error) {
          console.error(`Failed to generate ${docType} document:`, error);
          toast({
            title: `Error generating ${docType} document`,
            description: "Using placeholder content instead. You can retry later.",
            variant: "destructive",
          });
          researchDocs[docType] = `# ${docType.replace(/-/g, ' ').toUpperCase()}\n\nPlaceholder content for ${docType}. There was an error generating this document.`;
        }
      }
      
      // Save to store
      setUserInfo(formState);
      setResearchDocs(researchDocs);
      setOnboardingCompleted(true);
      
      // Navigate to dashboard
      navigate('/');
      
    } catch (error) {
      console.error("Onboarding error:", error);
      toast({
        title: "Onboarding Error",
        description: "There was a problem completing your onboarding. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };
  
  const isFormValid = () => {
    const { gapYears, ...requiredFields } = formState;
    return Object.values(requiredFields).every(val => !!val);
  };
  
  return (
    <Layout showNavigation={false}>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-center text-horizon-red mb-2">Welcome to Horizon</h1>
            <p className="text-gray-600 text-center">
              Let's personalize your US college visa interview preparation
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  value={formState.gender} 
                  onValueChange={(value) => handleSelectChange('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="highschool">High School</Label>
                <Input
                  id="highschool"
                  name="highschool"
                  value={formState.highschool}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="intendedCollege">Intended College</Label>
                <Input
                  id="intendedCollege"
                  name="intendedCollege"
                  value={formState.intendedCollege}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fieldOfStudy">Field of Study</Label>
                <Input
                  id="fieldOfStudy"
                  name="fieldOfStudy"
                  value={formState.fieldOfStudy}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fundingSources">Funding Sources</Label>
                <Input
                  id="fundingSources"
                  name="fundingSources"
                  value={formState.fundingSources}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formState.city}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="levelOfStudy">Level of Study</Label>
                <Select 
                  value={formState.levelOfStudy} 
                  onValueChange={(value) => handleSelectChange('levelOfStudy', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Associate">Associate</SelectItem>
                    <SelectItem value="Bachelor">Bachelor</SelectItem>
                    <SelectItem value="Master">Master</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gapYears">Gap Years</Label>
                <Input
                  id="gapYears"
                  name="gapYears"
                  type="number"
                  min="0"
                  value={formState.gapYears}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="intakeYear">Intake & Year</Label>
                <Select 
                  value={formState.intakeYear} 
                  onValueChange={(value) => handleSelectChange('intakeYear', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select intake" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Spring 2025">Spring 2025</SelectItem>
                    <SelectItem value="Fall 2025">Fall 2025</SelectItem>
                    <SelectItem value="Spring 2026">Spring 2026</SelectItem>
                    <SelectItem value="Fall 2026">Fall 2026</SelectItem>
                    <SelectItem value="Spring 2027">Spring 2027</SelectItem>
                    <SelectItem value="Fall 2027">Fall 2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-horizon-red hover:bg-red-700" 
              disabled={!isFormValid() || loading}
            >
              {loading ? "Processing..." : "Continue"}
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default Onboarding;
