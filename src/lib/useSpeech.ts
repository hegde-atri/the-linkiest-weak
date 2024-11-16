import { useState, useEffect } from "react";

export const useSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentUtterance, setCurrentUtterance] = 
    useState<SpeechSynthesisUtterance | null>(null);

  const speak = (text: string) => {
    console.log(text)
    window.speechSynthesis.cancel();
    setIsPaused(false);

    const utterance = new SpeechSynthesisUtterance(text);

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

    setCurrentUtterance(utterance);
    window.speechSynthesis.speak(utterance);
  };

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

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return {
    isPlaying,
    isPaused,
    currentUtterance,
    speak,
    toggleSpeech,
    stopSpeech
  };
};
