'use client'

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Button,
} from "@/components/ui/button";
import {
  Alert,
  AlertTitle,
  AlertDescription
} from "@/components/ui/alert";

import { useSpeech } from "@/lib/useSpeech";

function WeakestLinkGame() {
  const {speak} = useSpeech()

  const [gameState, setGameState] = useState({
    currentScore: 0,
    bankedScore: 0,
    currentQuestion: 0,
    currentTeam: 0,
    maxTeam: 5,
    showBankOption: false,
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

  const chainValues = [0, 100, 250, 500, 1000, 2500, 5000, 10000, 12500];

  const handleBank = () => {
    setGameState(prev => ({
      ...prev,
      bankedScore: prev.bankedScore + chainValues[prev.chainValue],
      chainValue: 0,
      showBankOption: false
    }));
  };

  const handleAnswer = (isCorrect: boolean) => {
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
        showBankOption: false
      }));
    }
  };

  const nextTeam = () => {
    setGameState(prev => {
      // First update the state
      const newState = {
        ...prev,
        currentTeam: (prev.currentTeam + 1) % prev.maxTeam,
      };
      
      // Then trigger the speech
      speak("Hello from another component!");
      
      // Return the new state
      return newState;
    });
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">The Linkiest Weak 🔗 😩</CardTitle>
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
            <Button 
              onClick={handleBank} 
              className="w-full"
              variant={gameState.chainValue == chainValues.length - 1 ? "destructive" : "outline"}
              disabled={!gameState.showBankOption}
            >
              {gameState.showBankOption ? `Bank £${chainValues[gameState.chainValue]}` : "Nothing to bank!"}
              
            </Button>

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
