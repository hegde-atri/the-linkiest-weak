'use client'

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  AlertTitle,
  AlertDescription
} from "@/components/ui";

function WeakestLinkGame() {
  const [gameState, setGameState] = useState({
    currentScore: 0,
    bankedScore: 0,
    currentQuestion: 0,
    currentTeam: 1,
    showBankOption: true,
    chainValue: 0,
  });

  // Sample questions - in real app, you'd have a larger database
  const questions = [
    {
      question: "What is the capital of France?",
      answer: "Paris",
    },
    {
      question: "Which planet is known as the Red Planet?",
      answer: "Mars",
    },
    {
      question: "What is the largest mammal in the world?",
      answer: "Blue Whale",
    },
  ];

  const chainValues = [0, 20, 50, 100, 200, 500, 1000];

  const handleBank = () => {
    setGameState(prev => ({
      ...prev,
      bankedScore: prev.bankedScore + chainValues[prev.chainValue],
      chainValue: 0,
      showBankOption: false
    }));
  };

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setGameState(prev => ({
        ...prev,
        chainValue: Math.min(prev.chainValue + 1, chainValues.length - 1),
        currentQuestion: prev.currentQuestion + 1,
        showBankOption: true
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        chainValue: 0,
        currentQuestion: prev.currentQuestion + 1,
        showBankOption: true
      }));
    }
  };

  const nextTeam = () => {
    setGameState(prev => ({
      ...prev,
      currentTeam: prev.currentTeam + 1,
      showBankOption: true
    }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">The Weakest Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 p-4 bg-card rounded-lg">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Current Chain Value</h3>
              <p className="text-2xl font-bold">£{chainValues[gameState.chainValue]}</p>
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
            {gameState.showBankOption && (
              <Button 
                onClick={handleBank} 
                className="w-full"
                variant="outline"
              >
                Bank £{chainValues[gameState.chainValue]}
              </Button>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleAnswer(true)}
                variant="default"
              >
                Correct Answer
              </Button>
              <Button
                onClick={() => handleAnswer(false)}
                variant="destructive"
              >
                Wrong Answer
              </Button>
            </div>

            <Button 
              onClick={nextTeam}
              className="w-full"
              variant="secondary"
            >
              Next Team
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default WeakestLinkGame;
