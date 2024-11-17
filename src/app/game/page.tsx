"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useTranscription } from "@/lib/useTranscription";
import { speak } from "@/lib/useSpeech";
import { getQuestions } from "@/lib/trivia";
import Confetti from "react-confetti-boom";

interface GameState {
  currentScore: number;
  bankedScore: number;
  currentQuestion: number;
  maxTeam: number;
  currentTeam: number;
  showBankOption: boolean;
  chainValue: number;
}

interface Question {
  question: string;
  answer: string;
}

export default function WeakestLinkGame() {
  const [loading, setLoading] = useState(true);
  // const [questions, setQuestions] = useState<Question[]>([]);
  const [e, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    currentScore: 0,
    bankedScore: 0,
    currentQuestion: 0,
    maxTeam: 4,
    currentTeam: 4,
    showBankOption: false,
    chainValue: 0,
  });

  const categories = [
    { id: 27, name: "Animals" }, // Animals
    { id: 22, name: "Geography" }, // Geography
    { id: 9, name: "General" }, // General Knowledge
    { id: 12, name: "Music" }, // Music
  ];

  // const fetchQuestions = async () => {
  //   try {
  //     setLoading(true);
  //     const result = await getQuestions([9]);
  //     setQuestions(result);
  //     console.log("CALLED SET Qs", questions)
  //     setError(null);
  //   } catch (err) {
  //     setError("Failed to load questions. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  //
  // useEffect(() => {
  //   fetchQuestions();
  // }, []);
  //

  const questions = [
    {
      "type": "multiple",
      "difficulty": "easy",
      "category": "General Knowledge",
      "question": "What is the Zodiac symbol for Gemini?",
      "answer": "Twins",
      "incorrect_answers": [
        "Fish",
        "Scales",
        "Maiden"
      ]
    },
    {
      "type": "multiple",
      "difficulty": "easy",
      "category": "General Knowledge",
      "question": "The likeness of which president is featured on the rare $2 bill of USA currency?",
      "answer": "Thomas Jefferson",
      "incorrect_answers": [
        "Martin Van Buren",
        "Ulysses Grant",
        "John Quincy Adams"
      ]
    },
    {
      "type": "multiple",
      "difficulty": "easy",
      "category": "General Knowledge",
      "question": "Which sign of the zodiac is represented by the Crab?",
      "answer": "Cancer",
      "incorrect_answers": [
        "Libra",
        "Virgo",
        "Sagittarius"
      ]
    },
    {
      "type": "multiple",
      "difficulty": "easy",
      "category": "General Knowledge",
      "question": "What is the name of the company in Lethal Company?",
      "answer": "The Company",
      "incorrect_answers": [
        "Planet Scrap Co.",
        "Lethal Robotics",
        "Gordian Shipping Co."
      ]
    },
    {
      "type": "multiple",
      "difficulty": "easy",
      "category": "General Knowledge",
      "question": "Area 51 is located in which US state?",
      "answer": "Nevada",
      "incorrect_answers": [
        "Arizona",
        "New Mexico",
        "Utah"
      ]
    },
    {
      "type": "multiple",
      "difficulty": "easy",
      "category": "General Knowledge",
      "question": "In the video-game franchise Kingdom Hearts, the main protagonist, carries a weapon with what shape?",
      "answer": "Key",
      "incorrect_answers": [
        "Sword",
        "Pen",
        "Cellphone"
      ]
    },
    {
      "type": "multiple",
      "difficulty": "easy",
      "category": "General Knowledge",
      "question": "Which of the following blood component forms a plug at the site of injuries?",
      "answer": "Platelets",
      "incorrect_answers": [
        "Red blood cells",
        "White blood cells",
        "Blood plasma"
      ]
    },
    {
      "type": "multiple",
      "difficulty": "easy",
      "category": "General Knowledge",
      "question": "Which one of these is not a typical European sword design?",
      "answer": "Scimitar",
      "incorrect_answers": [
        "Falchion",
        "Ulfberht",
        "Flamberge"
      ]
    },
    {
      "type": "multiple",
      "difficulty": "easy",
      "category": "General Knowledge",
      "question": "What type of animal was Harambe, who was shot after a child fell into it's enclosure at the Cincinnati Zoo?",
      "answer": "Gorilla",
      "incorrect_answers": [
        "Tiger",
        "Panda",
        "Crocodile"
      ]
    },
    {
      "type": "multiple",
      "difficulty": "easy",
      "category": "General Knowledge",
      "question": "Which one of the following rhythm games was made by Harmonix?",
      "answer": "Rock Band",
      "incorrect_answers": [
        "Meat Beat Mania",
        "Guitar Hero Live",
        "Dance Dance Revolution"
      ]
    },
    {
      "type": "multiple",
      "difficulty": "easy",
      "category": "General Knowledge",
      "question": "Which of these colours is NOT featured in the logo for Google?",
      "answer": "Pink",
      "incorrect_answers": [
        "Yellow",
        "Blue",
        "Green"
      ]
    },
    {
      "type": "multiple",
      "difficulty": "easy",
      "category": "General Knowledge",
      "question": "When someone is inexperienced they are said to be what color?",
      "answer": "Green",
      "incorrect_answers": [
        "Red",
        "Blue",
        "Yellow"
      ]
    },
  ]
  
  const chainValues = [0, 100, 250, 500, 1000, 2500, 5000, 10000, 12500];

  const handleTranscript = useCallback((transcript: string) => {
    if (transcript) {
      console.log(`New transcript: [${transcript}]`);
    }
  }, []);

  const [confetti, setConfetti] = useState(false);
  const triggerConfetti = () => {
      setConfetti(true);
      setTimeout(() => {
          setConfetti(false);
      }, 1600);
  };

  const handleAnswer = useCallback(
    (isCorrect: boolean) => {
      setGameState((prev) => ({
        ...prev,
        chainValue: isCorrect
          ? Math.min(prev.chainValue + 1, chainValues.length - 1)
          : 0,
        currentQuestion: (prev.currentQuestion + 1) % questions.length,
        showBankOption: isCorrect,
      }));

      // Provide feedback based on answer
      if(isCorrect){
        triggerConfetti()
      }
      speak(isCorrect ? "Correct!" : "Wrong answer!");
      nextTeam()
    },
    [chainValues.length, speak, confetti],
  );

  const handleAnswerDetected = useCallback(
    (answer: string) => {
      if (answer) {
        console.log("CALLED - Answer detected, answer:", answer);

        // Get current question using state directly from closure
        setGameState((prevState) => {
          const currentQuestion = questions[prevState.currentQuestion];
          if (!currentQuestion) return prevState;

          // Compare answer with current question's answer
          const isCorrect = answer
            .toLowerCase()
            .includes(currentQuestion.answer.toLowerCase());

          console.log(
            "THEN - Answer comparison:",
            answer,
            currentQuestion.answer,
            "isCorrect: ",
            isCorrect,
          );

          // Call handleAnswer within the setState callback
          handleAnswer(isCorrect);

          return prevState;
        });
      } else {
        console.log("Answer was empty!");
      }
    },
    [handleAnswer, questions],
  );

  const handleIntent = useCallback(
    (intent: string) => {
      const intentActions = {
        BANK: () => handleBank(),
      };
      const action = intentActions[intent as keyof typeof intentActions];
      if (action) {
        action();
      }
    },
    [handleAnswer],
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
    onAnswerDetected: handleAnswerDetected,
  });

  const handleBank = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      bankedScore: prev.bankedScore + chainValues[prev.chainValue],
      chainValue: 0,
      showBankOption: false,
    }));
    speak("Banked!")
  }, [chainValues]);

  const nextTeam = useCallback(() => {
    setGameState((prev) => {
      const newState = {
        ...prev,
        currentTeam: (prev.currentTeam + 1) % prev.maxTeam,
      };

      speak(`Team ${prev.currentTeam}, ${questions[prev.currentQuestion].question}`);
      return newState;
    });
  }, [speak, questions]);

  const startGame = useCallback(() => {
    // speak(
    //   "Welcome to Linkiest Weak. A voice based spin of the hit TV show game, The Weakest Link!",
    // );
    // speak("First team get ready!");
    nextTeam();
    startListening();
  }, [nextTeam, startListening]);

  // Add useEffect to monitor gameState changes
  // useEffect(() => {
  //   console.log('Current game state:', gameState);
  // }, [gameState]);

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
          {confetti && (
            <Confetti />
          )}

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
