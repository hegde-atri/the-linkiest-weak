"use client";

import { useState, useEffect } from "react";
import { Play, Square, Volume2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function TextToSpeech() {
  const [text, setText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSynth(window.speechSynthesis);
    }
  }, []);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = synth?.getVoices() || [];
      console.log("Available voices:", availableVoices); // Debug log
      setVoices(availableVoices);

      // Set default voice (preferably English)
      const defaultVoice = availableVoices.find((voice) =>
        voice.lang.startsWith("en-"),
      );
      if (defaultVoice) {
        setSelectedVoice(defaultVoice.name);
      } else if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    if (synth) {
      // Initial load
      loadVoices();

      // Handle dynamic voice loading
      synth.onvoiceschanged = loadVoices;
    }

    // Cleanup
    return () => {
      if (synth) {
        synth.cancel();
      }
    };
  }, [synth]);

  const speak = () => {
    if (!synth || !text) return;

    // Cancel any ongoing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Set voice
    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) {
      utterance.voice = voice;
    }

    // Set properties
    utterance.pitch = pitch;
    utterance.rate = rate;

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      console.log("Speech started"); // Debug log
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      console.log("Speech ended"); // Debug log
    };
    utterance.onerror = (event) => {
      console.error("Speech error:", event); // Debug log
      setIsSpeaking(false);
    };

    synth.speak(utterance);
    setIsSpeaking(true);
  };

  const stopSpeaking = () => {
    if (synth) {
      synth.cancel();
      setIsSpeaking(false);
    }
  };

  const pauseSpeaking = () => {
    if (synth) {
      synth.pause();
      setIsSpeaking(false);
    }
  };

  const resumeSpeaking = () => {
    if (synth) {
      synth.resume();
      setIsSpeaking(true);
    }
  };

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Text to Speech
        </CardTitle>
        <CardDescription>
          Convert your text to natural-sounding speech
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="text">Text to convert</Label>
          <Input
            id="text"
            placeholder="Enter text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        {voices.length > 0 && (
          <div className="space-y-2">
            <Label>Select Voice ({voices.length} available)</Label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger>
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((voice) => (
                  <SelectItem key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label>Pitch: {pitch.toFixed(1)}</Label>
          <Slider
            value={[pitch]}
            min={0.5}
            max={2}
            step={0.1}
            onValueChange={([value]) => setPitch(value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Speed: {rate.toFixed(1)}</Label>
          <Slider
            value={[rate]}
            min={0.5}
            max={2}
            step={0.1}
            onValueChange={([value]) => setRate(value)}
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={speak}
            className="flex-1"
            variant={isSpeaking ? "secondary" : "default"}
            disabled={!text || !synth}
          >
            {isSpeaking ? "Pause" : "Speak"}
            {isSpeaking ? (
              <Square className="ml-2 h-4 w-4" />
            ) : (
              <Play className="ml-2 h-4 w-4" />
            )}
          </Button>
          {isSpeaking && (
            <Button onClick={stopSpeaking} variant="destructive">
              Stop
            </Button>
          )}
        </div>

        {voices.length === 0 && (
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            Loading voices... If no voices appear, your browser might not
            support speech synthesis.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default TextToSpeech;
