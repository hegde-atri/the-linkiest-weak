"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Loader2, Save } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
} from "./ui/card";
import { Textarea } from "./ui/textarea";

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const Intent = {
  ANSWER: "ANSWER",
  BANK: "BANK",
  UNKNOWN: "UNKNOWN",
};

function SpeechGameAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [intent, setIntent] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const lastSpeechTime = useRef(Date.now());

  const initializeRecognition = () => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event) => {
          const current = event.resultIndex;
          const currentTranscript = event.results[current][0].transcript;

          setTranscript(currentTranscript);

          lastSpeechTime.current = Date.now();

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          timeoutRef.current = setTimeout(() => {
            handleSilence(currentTranscript);
          }, 1500);
        };

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };
      }
    }
  };

  useEffect(() => {
    initializeRecognition();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSilence = async (text) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const lowerText = text.toLowerCase();
      let simulatedIntent;

      if (
        lowerText.includes("bank") ||
        lowerText.includes("save") ||
        lowerText.includes("keep")
      ) {
        simulatedIntent = Intent.BANK;
      } else {
        simulatedIntent = Intent.ANSWER;
      }

      setIntent(simulatedIntent);
    } catch (error) {
      console.error("Error processing intent:", error);
      setIntent(Intent.UNKNOWN);
    } finally {
      // Clear transcript
      setTranscript("");
      setIsProcessing(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } else {
      // Initialize new recognition instance before starting
      initializeRecognition();
      recognitionRef.current?.start();
      setIsListening(true);
      setIntent(null);
    }
  };

  const handleReset = () => {
    setTranscript("");
    setIntent(null);
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Reinitialize recognition
    initializeRecognition();
  };

  const getIntentColor = () => {
    switch (intent) {
      case Intent.BANK:
        return "bg-green-500/10 text-green-500 dark:bg-green-500/20";
      case Intent.ANSWER:
        return "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 dark:bg-gray-500/20";
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Weakest Link Speech Assistant</CardTitle>
        <CardDescription>
          Start speaking to provide your answer or say "bank" to bank your
          money. The system will detect when you stop talking for 1.5 seconds.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center gap-2">
          <Button
            onClick={toggleListening}
            variant={isListening ? "destructive" : "default"}
            className="w-32"
          >
            {isListening ? (
              <>
                <MicOff className="mr-2 h-4 w-4" />
                Stop
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                Start
              </>
            )}
          </Button>
          <Button onClick={handleReset} variant="outline">
            Reset
          </Button>
        </div>

        {isListening && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Listening...
          </div>
        )}

        <Textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Your speech will appear here..."
          className="min-h-[100px]"
        />

        {isProcessing && (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">
              Processing intent...
            </span>
          </div>
        )}

        {intent && (
          <Alert>
            <AlertTitle className="flex items-center gap-2">
              Detected Intent:
              <span
                className={`px-2 py-1 rounded-md text-sm ${getIntentColor()}`}
              >
                {intent}
              </span>
            </AlertTitle>
            <AlertDescription>
              {intent === Intent.BANK
                ? "The player wants to bank their money."
                : "The player is attempting to answer the question."}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default SpeechGameAssistant;
