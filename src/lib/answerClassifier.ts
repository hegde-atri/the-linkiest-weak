// utils/answerClassifier.ts
export class AnswerClassifier {
  private static QUESTION_MARKERS = ['?', 'what', 'when', 'where', 'who', 'how', 'why'];
  private static COMMAND_WORDS = ['stop', 'next', 'skip', 'bank', 'answer'];
  private static MIN_LENGTH = 2;
  private static MAX_LENGTH = 100;

  static analyzeText(text: string): {
    score: number;
    isAnswer: boolean;
    needsAICheck: boolean;
  } {
    const normalizedText = text.toLowerCase().trim();
    
    // Immediate disqualifiers
    if (normalizedText.length < this.MIN_LENGTH || 
        normalizedText.length > this.MAX_LENGTH) {
      return { score: 0, isAnswer: false, needsAICheck: false };
    }

    // Check if it's a command or question
    if (this.COMMAND_WORDS.some(cmd => normalizedText.includes(cmd)) ||
        this.QUESTION_MARKERS.some(marker => normalizedText.includes(marker))) {
      return { score: 0, isAnswer: false, needsAICheck: false };
    }

    // Calculate confidence score
    let score = 0;
    
    // Pattern checks
    const hasNumber = /\d+/.test(normalizedText);
    const hasProperNoun = /[A-Z][a-z]+/.test(text);
    const isSingleWord = normalizedText.split(' ').length === 1;
    const hasYear = /\b(19|20)\d{2}\b/.test(normalizedText);
    const hasSpecialChars = /[!@#$%^&*()]/.test(normalizedText);
    
    // Score contributions
    if (hasNumber) score += 1;
    if (hasProperNoun) score += 2;
    if (isSingleWord) score += 1;
    if (hasYear) score += 2;
    if (!hasSpecialChars) score += 1;
    
    // Decision making
    const needsAICheck = score >= 2 && score <= 4; // Middle ground scores need AI verification
    const isAnswer = score > 4; // High scores are confident answers

    return { score, isAnswer, needsAICheck };
  }
}
