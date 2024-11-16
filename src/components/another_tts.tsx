"use client";

import { useState, useEffect } from "react";
import { Play, Pause, Square } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function SpeechPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentUtterance, setCurrentUtterance] =
    useState<SpeechSynthesisUtterance | null>(null);

  // Your messages
  const messages = {
    welcome: "Welcome to our website! We're glad to have you here.",
    instructions:
      "Please follow the on-screen instructions to complete your profile.",
    goodbye: "Thank you for visiting. Have a great day!",
  };

  // Function that handles the speech
  const speak = (text: string) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    setIsPaused(false);

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Set up event listeners
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentUtterance(null);
    };

    utterance.onpause = () => {
      setIsPlaying(false);
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    // Store the utterance in state
    setCurrentUtterance(utterance);

    // Start speaking
    window.speechSynthesis.speak(utterance);
  };

  // Controls
  const toggleSpeech = (text: string) => {
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    } else if (isPaused && currentUtterance?.text === text) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      speak(text);
    }
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentUtterance(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Message Player</CardTitle>
        <CardDescription>Select a message to play</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(messages).map(([key, text]) => {
          const isCurrentPlaying = isPlaying && currentUtterance?.text === text;
          const isCurrentPaused = isPaused && currentUtterance?.text === text;

          return (
            <div key={key} className="space-y-2">
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm">{text}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => toggleSpeech(text)}
                  className="flex-1"
                  variant={
                    isCurrentPlaying || isCurrentPaused
                      ? "secondary"
                      : "default"
                  }
                >
                  {isCurrentPlaying || isCurrentPaused ? (
                    <>
                      {isCurrentPaused ? (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="mr-2 h-4 w-4" />
                          Pause
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Play
                    </>
                  )}
                </Button>

                {(isCurrentPlaying || isCurrentPaused) && (
                  <Button onClick={stopSpeech} variant="destructive">
                    <Square className="mr-2 h-4 w-4" />
                    Stop
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default SpeechPlayer;
