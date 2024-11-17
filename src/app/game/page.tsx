"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

import { useSpeech } from "@/lib/useSpeech";
import { useTranscription } from "@/lib/useTranscription";
import { collectSegments } from "next/dist/build/segment-config/app/app-segments";
import { getQuestions } from "@/lib/trivia";

interface Question {
  question: string;
  answer: string;
}

interface GameState {
  currentScore: number;
  bankedScore: number;
  currentQuestion: number;
  maxTeam: number;
  currentTeam: number;
  showBankOption: boolean;
  chainValue: number;
}

interface ClassificationResult {
  isAnswer: boolean;
  method: "rules" | "hybrid";
  confidence: number;
}

function WeakestLinkGame() {
  const { speak } = useSpeech();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([
    {
      question: "What is the capital of France?",
      answer: "Paris",
    },
  ]);
  const [e, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    currentScore: 0,
    bankedScore: 0,
    currentQuestion: 0,
    maxTeam: 5,
    currentTeam: 5,
    showBankOption: false,
    chainValue: 0,
  });

  const categories = [
    { id: 27, name: "Animals" }, // Animals
    { id: 22, name: "Geography" }, // Geography
    { id: 9, name: "General" }, // General Knowledge
    { id: 12, name: "Music" }, // Music
  ];

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const result = await getQuestions([27]);
      setQuestions(result);
      setError(null);
    } catch (err) {
      setError("Failed to load questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const chainValues = [0, 100, 250, 500, 1000, 2500, 5000, 10000, 12500];

  // Handle transcription and classification
  const handleTranscript = useCallback((transcript: string) => {
    console.log("New transcript:", transcript);
  }, []);

  const handleIntent = useCallback((intent: string) => {
    console.log(`Intent detected: ${intent}`);

    const intentActions = {
      BANK: () => handleBank(),
      NEXT: () => nextTeam(),
      ANSWER: () => handleAnswer(true),
      STOP: () => stopListening(),
    };

    const action = intentActions[intent as keyof typeof intentActions];
    if (action) {
      action();
    }
  }, []);

  const handleAnswer = useCallback(
    (isCorrect: boolean) => {
      setGameState((prev) => ({
        ...prev,
        chainValue: isCorrect
          ? Math.min(prev.chainValue + 1, chainValues.length - 1)
          : 0,
        currentQuestion: prev.currentQuestion + 1,
        showBankOption: isCorrect,
      }));
    },
    [chainValues.length],
  );

  const handleAnswerDetected = useCallback(
    (answer: string) => {
      console.log("CALLED - Answer detected", answer);

      const currentQuestion = questions[gameState.currentQuestion];
      if (!currentQuestion) return;

      // Compare answer with current question's answer
      const isCorrect = answer
        .toLowerCase()
        .includes(currentQuestion.answer.toLowerCase());

      console.log(`Answer detected: ${answer}`);
      console.log(`Is correct: ${isCorrect}`);

      handleAnswer(isCorrect);
    },
    [gameState.currentQuestion, questions, handleAnswer],
  );

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    error,
    clearTranscript,
    classification,
  } = useTranscription({
    onIntentDetected: handleIntent,
    onTranscript: handleTranscript,
    onAnswerDetected: (answer) => handleAnswerDetected(answer, classification),
  });

  // Game actions
  const handleBank = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      bankedScore: prev.bankedScore + chainValues[prev.chainValue],
      chainValue: 0,
      showBankOption: false,
    }));
  }, [chainValues]);

  const nextTeam = useCallback(() => {
    setGameState((prev) => {
      const newState = {
        ...prev,
        currentTeam: (prev.currentTeam + 1) % prev.maxTeam,
      };

      speak(questions[prev.currentQuestion].question);
      return newState;
    });
  }, [speak, questions]);

  const startGame = useCallback(() => {
    speak(
      "Welcome to Linkiest Weak. A voice based spin of the hit TV show game, The Weakest Link!",
    );
    speak("First team get ready!");
    nextTeam();
    startListening();
  }, [speak, nextTeam, startListening]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            The Linkiest Weak 🔗 😩
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 p-4 bg-card rounded-lg">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Current Chain Value</h3>
              <p className="text-2xl font-bold">
                £{chainValues[gameState.chainValue]}
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Banked Score</h3>
              <p className="text-2xl font-bold">£{gameState.bankedScore}</p>
            </div>
          </div>

          <Alert>
            <AlertTitle>Team {gameState.currentTeam}</AlertTitle>
            <AlertDescription>
              {questions[gameState.currentQuestion % questions.length].question}
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <Button
              onClick={handleBank}
              className="w-full"
              variant={
                gameState.chainValue == chainValues.length - 1
                  ? "destructive"
                  : "outline"
              }
              disabled={!gameState.showBankOption}
            >
              {gameState.showBankOption
                ? `Bank £${chainValues[gameState.chainValue]}`
                : "Nothing to bank!"}
            </Button>

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => handleAnswer(true)} variant="default">
                Correct Answer
              </Button>
              <Button onClick={() => handleAnswer(false)} variant="destructive">
                Wrong Answer
              </Button>
            </div>

            <Button onClick={nextTeam} className="w-full" variant="secondary">
              Next Team
            </Button>

            <Button onClick={startGame} className="w-full" variant="secondary">
              Start
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default WeakestLinkGame;
