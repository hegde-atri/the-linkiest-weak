"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useSpeech } from "@/lib/useSpeech";
import { getQuestions } from "@/lib/trivia";

interface Question {
  question: string;
  answer: string;
}

function WeakestLinkGame() {
  const { speak } = useSpeech();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [gameState, setGameState] = useState({
    currentScore: 0,
    bankedScore: 0,
    currentQuestion: 0,
    currentTeam: 0,
    maxTeam: 5,
    showBankOption: false,
    chainValue: 0,
  });

  const chainValues = [0, 100, 250, 500, 1000, 2500, 5000, 10000, 12500];

  // Fetch questions when component mounts
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const result = await getQuestions();
      setQuestions(result);
      setError(null);
    } catch (err) {
      setError("Failed to load questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBank = () => {
    setGameState((prev) => ({
      ...prev,
      bankedScore: prev.bankedScore + chainValues[prev.chainValue],
      chainValue: 0,
      showBankOption: false,
    }));
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setGameState((prev) => ({
        ...prev,
        chainValue: Math.min(prev.chainValue + 1, chainValues.length - 1),
        currentQuestion: prev.currentQuestion + 1,
        showBankOption: true,
      }));
    } else {
      setGameState((prev) => ({
        ...prev,
        chainValue: 0,
        currentQuestion: prev.currentQuestion + 1,
        showBankOption: false,
      }));
    }
  };

  const nextTeam = () => {
    setGameState((prev) => {
      const newState = {
        ...prev,
        currentTeam: (prev.currentTeam + 1) % prev.maxTeam,
      };
      speak("Hello from another component!");
      return newState;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-2xl p-6">
          <CardContent className="text-center">
            Loading questions...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-2xl p-6">
          <CardContent className="text-center">
            <p className="text-red-500 mb-4">
              {error || "No questions available"}
            </p>
            <Button onClick={fetchQuestions}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion =
    questions[gameState.currentQuestion % questions.length];

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
            <AlertTitle>Team {gameState.currentTeam + 1}</AlertTitle>
            <AlertDescription>{currentQuestion.question}</AlertDescription>
          </Alert>

          <div className="space-y-4">
            <Button
              onClick={handleBank}
              className="w-full"
              variant={
                gameState.chainValue === chainValues.length - 1
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default WeakestLinkGame;
