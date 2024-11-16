import { openai } from '@/lib/openai';
import { AnswerClassifier } from '@/lib/answerClassifier';
import { NextResponse } from 'next/server';

async function checkWithAI(text: string): Promise<boolean> {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a classifier that determines if text is a trivia answer. Consider: 1) Is it a statement rather than a question? 2) Does it contain factual information? 3) Is it concise? 4) Does it seem like a response to a trivia question? Respond with only 'true' or 'false'."
        },
        {
          role: "user",
          content: `Is this text likely to be a trivia answer? Text: "${text}"`
        }
      ],
      model: "gpt-4o-mini",
      temperature: 0.1,
    });

    return completion.choices[0].message.content?.toLowerCase() === 'true';
  } catch (error) {
    console.error('OpenAI API error:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    // First, use rule-based classification
    const { score, isAnswer, needsAICheck } = AnswerClassifier.analyzeText(text);

    // If we need AI verification
    if (needsAICheck) {
      const aiResult = await checkWithAI(text);
      return NextResponse.json({ 
        isAnswer: aiResult,
        method: 'hybrid',
        confidence: score 
      });
    }

    // Return rule-based result
    return NextResponse.json({ 
      isAnswer, 
      method: 'rules',
      confidence: score 
    });

  } catch (error) {
    console.error('Classification error:', error);
    return NextResponse.json(
      { error: 'Classification failed' },
      { status: 500 }
    );
  }
}
