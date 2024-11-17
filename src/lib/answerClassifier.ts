export class AnswerClassifier {
  private static QUESTION_MARKERS = ['?', 'what', 'when', 'where', 'who', 'how', 'why'];
  private static COMMAND_WORDS = ['bank'];
  private static ANSWER_INDICATORS = ['answer is', 'solution is', 'it is', 'its'];
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

    // Check if it's a command word
    if (this.COMMAND_WORDS.some(cmd => normalizedText === cmd)) {
      return { score: 0, isAnswer: false, needsAICheck: false };
    }

    // Check if it's a question
    if (this.QUESTION_MARKERS.some(marker => normalizedText.includes(marker))) {
      return { score: 0, isAnswer: false, needsAICheck: false };
    }

    // Calculate confidence score
    let score = 0;
    
    // Pattern checks
    const hasNumber = /\d+/.test(normalizedText);
    const hasProperNoun = /[A-Z][a-z]+/.test(text);
    const words = normalizedText.split(' ').filter(w => w.length > 1);
    const wordCount = words.length;
    const hasYear = /\b(19|20)\d{2}\b/.test(normalizedText);
    const hasSpecialChars = /[!@#$%^&*()]/.test(normalizedText);
    
    // Check for answer indicators
    const containsAnswerIndicator = this.ANSWER_INDICATORS.some(
      indicator => normalizedText.includes(indicator)
    );

    // Common articles and prepositions
    const commonWords = ['a', 'an', 'the', 'in', 'on', 'at', 'by', 'to', 'for'];
    
    // Score contributions
    if (hasNumber) score += 1;
    if (hasProperNoun) score += 2;
    if (hasYear) score += 2;
    if (!hasSpecialChars) score += 1;
    if (containsAnswerIndicator) score += 3;

    // Phrase scoring
    if (wordCount <= 3) {
      const meaningfulWords = words.filter(word => 
        !commonWords.includes(word.toLowerCase()) && 
        word.length >= 2 &&
        /^[a-z]+$/i.test(word)
      );
      
      if (meaningfulWords.length > 0) {
        score += 3;  // Boost for short, meaningful phrases
        if (meaningfulWords.some(word => word[0] === word[0].toUpperCase())) {
          score += 1;  // Additional point for proper nouns
        }
      }
    }
    
    // Extract potential answer after indicator phrases
    const answerPattern = new RegExp(
      `(${this.ANSWER_INDICATORS.join('|')})\\s+(.+)`, 'i'
    );
    const match = normalizedText.match(answerPattern);
    if (match) {
      score += 2;
    }

    // Decision making
    const needsAICheck = score >= 2 && score <= 3;
    const isAnswer = score > 3 || containsAnswerIndicator;
    
    return { score, isAnswer, needsAICheck };
  }
}

