import { openai } from '@/lib/openai';
import { AnswerClassifier } from '@/lib/answerClassifier';
import { NextResponse } from 'next/server';

async function checkWithAI(text: string): Promise<boolean> {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a classifier that determines if text is a potential trivia answer. Evaluate based on these criteria:

1) Could this be a direct answer to a trivia question?
2) Is it specific (like a name, place, date, or fact)?
3) Is it concise and to the point?
4) Does it avoid questions or commands?
5) Would this make sense as an answer in a quiz show?

Consider these examples:
- "Mars" => true (planet name)
- "blue whale" => true (specific animal)
- "The Eiffel Tower" => true (landmark)
- "1969" => true (potential date)
- "what time is it?" => false (question)
- "skip this one" => false (command)
- "maybe tomorrow" => false (vague)

Respond with only 'true' or 'false'.`
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
