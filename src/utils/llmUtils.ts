
/**
 * Utility functions for OpenRouter LLM API interactions
 */

const MAX_RETRIES = 10;
const MAX_TOKENS = 50000;

// LLM API call with retry logic
export async function callLLM(prompt: string): Promise<string> {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      
      if (!apiKey) {
        throw new Error("OpenRouter API key is not configured");
      }
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "anthropic/claude-3-opus",
          messages: [
            { role: "user", content: prompt }
          ],
          max_tokens: MAX_TOKENS,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
      
    } catch (error) {
      console.error("LLM API error:", error);
      retries++;
      
      if (retries >= MAX_RETRIES) {
        throw new Error(`Failed to call LLM API after ${MAX_RETRIES} retries: ${error}`);
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
    }
  }
  
  throw new Error("Failed to call LLM API");
}

// Generate research documents based on user info
export async function generateResearchDoc(
  docType: "why-usa" | "why-college" | "why-field" | "field-and-careers",
  userInfo: any
): Promise<string> {
  let prompt = "";
  
  switch (docType) {
    case "why-usa":
      prompt = `Generate a comprehensive, well-formatted markdown document explaining why Ethiopian students should consider studying in the USA.
      
      Structure this as an informative article with proper markdown formatting, headings, bullet points, and clear sections.
      
      Include specific benefits of US education, cultural experiences, global opportunities, and career advantages.
      
      Personalize this for an Ethiopian student named ${userInfo.name}, who plans to study ${userInfo.fieldOfStudy} at ${userInfo.intendedCollege}, 
      and currently lives in ${userInfo.city}. They have completed high school at ${userInfo.highschool} with ${userInfo.gapYears} gap years,
      and will be pursuing a ${userInfo.levelOfStudy} degree starting in ${userInfo.intakeYear}.
      
      The article should be informative, encouraging, and around 800-1200 words.`;
      break;
      
    case "why-college":
      prompt = `Generate a comprehensive, well-formatted markdown document about ${userInfo.intendedCollege} for a student visa interview.
      
      Structure this as an informative article with proper markdown formatting, headings, bullet points, and clear sections.
      
      Include information about the college's history, reputation, ranking, notable programs (especially in ${userInfo.fieldOfStudy}),
      campus facilities, student life, international student services, and career outcomes.
      
      Personalize this for an Ethiopian student named ${userInfo.name}, who plans to study ${userInfo.fieldOfStudy} there
      and will be pursuing a ${userInfo.levelOfStudy} degree starting in ${userInfo.intakeYear}.
      
      The article should be informative, detailed, and around 800-1200 words with facts that would be helpful in a visa interview.`;
      break;
      
    case "why-field":
      prompt = `Generate a comprehensive, well-formatted markdown document about why studying ${userInfo.fieldOfStudy} is a good choice.
      
      Structure this as an informative article with proper markdown formatting, headings, bullet points, and clear sections.
      
      Include information about the importance of this field globally, career opportunities, how it connects to development priorities
      in Ethiopia, future trends, and why pursuing this at ${userInfo.intendedCollege} specifically makes sense.
      
      Personalize this for an Ethiopian student named ${userInfo.name}, who will be pursuing a ${userInfo.levelOfStudy} degree
      starting in ${userInfo.intakeYear}, with funding from ${userInfo.fundingSources}.
      
      The article should be informative, persuasive, and around 800-1200 words with compelling points that would be helpful in a visa interview.`;
      break;
      
    case "field-and-careers":
      prompt = `Generate a comprehensive, well-formatted markdown document about career opportunities in ${userInfo.fieldOfStudy}.
      
      Structure this as an informative article with proper markdown formatting, headings, bullet points, and clear sections.
      
      Include information about:
      - Typical career paths for graduates with a ${userInfo.levelOfStudy} in this field
      - Specific job titles and roles
      - Industry demand and projected growth
      - Salary expectations in the US and globally
      - How these skills could benefit Ethiopia upon return
      - Companies and organizations that typically hire in this field
      - Success stories of professionals in this area
      
      Personalize this for an Ethiopian student named ${userInfo.name}, who will be pursuing a ${userInfo.levelOfStudy} degree
      at ${userInfo.intendedCollege} starting in ${userInfo.intakeYear}.
      
      The article should be informative, practical, and around 800-1200 words with specific details that would be helpful in a visa interview
      to demonstrate knowledge of career prospects and ties to home country.`;
      break;
  }
  
  return callLLM(prompt);
}

// Get AI feedback on user's question answer
export async function getQuestionFeedback(
  question: string,
  userAnswer: string,
  questionDoc: string,
  userInfo: any
): Promise<string> {
  const prompt = `You are an experienced US visa officer and educational consultant. 
  
  Please provide helpful, constructive feedback on this student's answer to a common visa interview question.
  
  QUESTION: "${question}"
  
  STUDENT ANSWER: "${userAnswer}"
  
  STUDENT BACKGROUND:
  - Name: ${userInfo.name}
  - Gender: ${userInfo.gender}
  - Field of Study: ${userInfo.fieldOfStudy}
  - Intended College: ${userInfo.intendedCollege}
  - Level: ${userInfo.levelOfStudy}
  - Funding: ${userInfo.fundingSources}
  
  ADDITIONAL CONTEXT ABOUT THIS QUESTION:
  ${questionDoc}
  
  Please provide specific, actionable feedback on:
  1. Strengths of the answer
  2. Areas for improvement
  3. Specific suggestions for enhancing the response
  
  Format your response as a single paragraph of practical advice. Don't use markdown formatting or bullet points.
  Keep your feedback between 100-200 words.`;
  
  return callLLM(prompt);
}

// Generate mock interview question based on profile and previous answers
export async function generateInterviewQuestion(
  userInfo: any,
  previousQuestions: string[] = [],
  previousAnswers: string[] = []
): Promise<{ text: string; isEnd: boolean }> {
  const promptHistory = previousQuestions.map((q, i) => {
    return `Question ${i + 1}: ${q}\nStudent's Answer: ${previousAnswers[i] || "No answer provided"}`;
  }).join("\n\n");
  
  const prompt = `You are a US visa officer conducting a student visa interview for an Ethiopian student.
  
  STUDENT PROFILE:
  - Name: ${userInfo.name}
  - Gender: ${userInfo.gender}
  - High School: ${userInfo.highschool}
  - Intended College: ${userInfo.intendedCollege}
  - Field of Study: ${userInfo.fieldOfStudy}
  - Level: ${userInfo.levelOfStudy}
  - Funding Source: ${userInfo.fundingSources}
  
  PREVIOUS EXCHANGES IN THIS INTERVIEW:
  ${promptHistory}
  
  ${previousQuestions.length === 0 ? 
    "This is the start of the interview. Begin with a greeting and a standard opening question." : 
    "Continue the interview with a logical next question."
  }
  
  ${previousQuestions.length >= 5 ? 
    "This interview should conclude soon. Please consider if it's appropriate to wrap up." : 
    ""
  }
  
  ${previousQuestions.length >= 7 ? 
    "This must be the final question or concluding statement of the interview." : 
    ""
  }
  
  INSTRUCTIONS:
  1. Generate a realistic next question or statement as a US visa officer
  2. If this should be the end of the interview, make a concluding statement
  3. Return your response in this exact JSON format:
  {
    "text": "Your question or statement here",
    "isEnd": boolean (true if this is the end of the interview, false otherwise)
  }
  
  Only return the JSON object, nothing else.`;
  
  const response = await callLLM(prompt);
  try {
    return JSON.parse(response);
  } catch (error) {
    console.error("Failed to parse LLM response as JSON:", error);
    // Fallback handling - attempt to extract reasonable values
    const isEnd = previousQuestions.length >= 7 || 
                 response.toLowerCase().includes("thank you for your time") ||
                 response.toLowerCase().includes("interview is complete") ||
                 response.toLowerCase().includes("that concludes");
                 
    return {
      text: response.replace(/```json|```/g, '').trim(),
      isEnd: isEnd
    };
  }
}

// Generate feedback on a mock interview answer
export async function getInterviewFeedback(
  question: string,
  answer: string,
  userInfo: any
): Promise<{ feedback: string; improvedAnswer: string }> {
  const prompt = `You are an experienced US visa officer and educational consultant.
  
  Please analyze this student's answer in a mock visa interview and provide feedback.
  
  QUESTION: "${question}"
  
  STUDENT'S ANSWER: "${answer}"
  
  STUDENT BACKGROUND:
  - Name: ${userInfo.name}
  - Gender: ${userInfo.gender}
  - Field of Study: ${userInfo.fieldOfStudy}
  - Intended College: ${userInfo.intendedCollege}
  - Level: ${userInfo.levelOfStudy}
  
  Please provide:
  1. Constructive feedback on the answer (what works, what doesn't, and why)
  2. An improved version of the answer that would be more effective
  
  Return your response in this exact JSON format:
  {
    "feedback": "Your feedback here as a single paragraph, around 100 words",
    "improvedAnswer": "The improved answer here, around the same length as the original answer"
  }
  
  Only return the JSON object, nothing else.`;
  
  const response = await callLLM(prompt);
  try {
    return JSON.parse(response);
  } catch (error) {
    console.error("Failed to parse LLM response as JSON:", error);
    // Fallback handling
    return {
      feedback: "We couldn't properly analyze your answer. Try to be more specific about your academic plans and ties to your home country.",
      improvedAnswer: "I would improve this answer by explaining my specific academic goals and how my studies will benefit my career when I return to Ethiopia."
    };
  }
}

// Generate overall session feedback and rating
export async function getSessionFeedback(
  questions: string[],
  answers: string[],
  userInfo: any
): Promise<{ title: string; rating: number; summary: string }> {
  const interviewTranscript = questions.map((q, i) => {
    return `Officer: ${q}\n${userInfo.name}: ${answers[i] || "No clear answer"}`;
  }).join("\n\n");
  
  const prompt = `You are an experienced US visa officer and educational consultant.
  
  Please review this complete student visa mock interview and provide an assessment.
  
  STUDENT PROFILE:
  - Name: ${userInfo.name}
  - Gender: ${userInfo.gender}
  - Field of Study: ${userInfo.fieldOfStudy}
  - Intended College: ${userInfo.intendedCollege}
  - Level: ${userInfo.levelOfStudy}
  
  INTERVIEW TRANSCRIPT:
  ${interviewTranscript}
  
  Please provide:
  1. A descriptive title for this interview session (e.g., "Strong Academic Focus Interview")
  2. A numerical rating from 1-10 (where 10 is excellent)
  3. A summary of the interview performance with key strengths and areas for improvement
  
  Return your response in this exact JSON format:
  {
    "title": "Your descriptive title here",
    "rating": number between 1-10,
    "summary": "Your summary here as a paragraph of around 150-200 words"
  }
  
  Only return the JSON object, nothing else.`;
  
  const response = await callLLM(prompt);
  try {
    return JSON.parse(response);
  } catch (error) {
    console.error("Failed to parse LLM response as JSON:", error);
    // Fallback handling
    return {
      title: "Visa Interview Practice Session",
      rating: 5,
      summary: "This interview showed some strengths and some areas for improvement. Focus on being more specific about your academic plans and demonstrating stronger ties to your home country. Practice speaking more confidently about your funding sources and post-graduation plans."
    };
  }
}
