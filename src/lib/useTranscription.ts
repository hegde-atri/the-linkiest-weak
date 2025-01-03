// hooks/useTranscription.ts

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTranscriptionProps {
  onTranscript?: (transcript: string) => void;
  onIntentDetected?: (intent: string) => void;
  onAnswerDetected?: (answer: string) => void;
}

interface ClassificationResult {
  isAnswer: boolean;
  method: 'rules' | 'hybrid';
  confidence: number;
}

interface IWindow extends Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

// Declare the global window with our extended interface
declare const window: IWindow;

// Create a type for cross-browser support
type SpeechRecognitionType = typeof window.SpeechRecognition | typeof window.webkitSpeechRecognition;

export const useTranscription = ({
  onTranscript,
  onIntentDetected,
  onAnswerDetected
}: UseTranscriptionProps = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);

  // Use ref instead of state for recognition instance
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);

  // Intent patterns
  const INTENT_PATTERNS = {
    BANK: ['bank', 'banking', 'save points', 'save'],
  };

  const classifyText = useCallback(async (text: string) => {
    if (text) {
      console.log(`Attempting to classify: [${text}]`)
      try {
        const response = await fetch('/api/classify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });

        const result = await response.json();
        console.log("Classification result:", result)
        setClassification(result);

        if (result.isAnswer) {
          onAnswerDetected?.(text);
        }
      } catch (error) {
        console.error('Classification error:', error);
      }
    }
  }, [onAnswerDetected]);

  const detectIntent = useCallback((text: string) => {
    const normalizedText = text.toLowerCase().trim();
    
    for (const [intent, keywords] of Object.entries(INTENT_PATTERNS)) {
      if (keywords.some(keyword => normalizedText.includes(keyword))) {
        console.log(`Intent detected: ${intent}`);
        onIntentDetected?.(intent);
        return intent;
      }
    }
    return null;
  }, [onIntentDetected]);

  // Initialize speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    recognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    const recognition = recognitionRef.current;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const error = event as SpeechRecognitionErrorEvent;
      console.error('Speech recognition error:', error.error);
      setError(error.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.resultIndex;
      const transcriptChunk = event.results[current][0].transcript;
      
      setTranscript(transcriptChunk);
      onTranscript?.(transcriptChunk);
      
      if (event.results[current].isFinal) {
        const intent = detectIntent(transcriptChunk);
        if (!intent) {
          // Only classify if no intent was detected
          classifyText(transcriptChunk);
        }
      }
    };
  }, [onTranscript, detectIntent, classifyText]); 

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setError(null);
      } catch (err) {
        console.error('Error starting recognition:', err);
        setError('Failed to start speech recognition');
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    error,
    clearTranscript,
    classification
  };
};
