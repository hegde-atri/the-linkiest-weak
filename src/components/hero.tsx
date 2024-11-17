"use client";
import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, ArrowRight, Users, Brain } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { speak } from "@/lib/useSpeech";

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
}

function ContinuousSpeechLanding() {
	const [isStarted, setIsStarted] = useState(false);
	const [stage, setStage] = useState(0);
	const [teams, setTeams] = useState(0);
	const [category, setCategory] = useState("");
	const [transcript, setTranscript] = useState("");
	const [announcementMade, setAnnouncementMade] = useState(false);

	const recognitionRef = useRef(null);
	const stageRef = useRef(0);
	const teamsRef = useRef(0);
	const announcementMadeRef = useRef(false);
	const categoryRef = useRef("");

	// Update refs when states change
	useEffect(() => {
		stageRef.current = stage;
		teamsRef.current = teams;
		categoryRef.current = category;
		announcementMadeRef.current = announcementMade;
	}, [stage, teams, category, announcementMade]);

	useEffect(() => {
    //@ts-ignore
		if (window.webkitSpeechRecognition) {
      //@ts-ignore
			const recognition = new window.webkitSpeechRecognition();
			recognition.continuous = true;
			recognition.interimResults = false;

      //@ts-ignore
			recognition.onresult = (event) => {
				const result = event.results[event.results.length - 1];
				const transcriptText = result[0].transcript.toLowerCase().trim();

        if (stage === 0 && !announcementMade) {
					speak("Welcome to Linkiest Weak! Say 'Start' to begin the game setup");
          setAnnouncementMade(true);
        }
				// Stage 0: Waiting for "start"
				if (stageRef.current === 0 && transcriptText.includes("start")) {
					setTranscript("Listening for number of teams...");
          if (!announcementMade) {
            speak("Specify the number of teams you want to play with - between 1 to 10");
            setAnnouncementMade(true);
          }
					setStage(1);
          setAnnouncementMade(false)
				}
				// Stage 1: Getting number of teams
				else if (stageRef.current === 1) {
					const wordToNumber = {
						one: 1,
						two: 2,
						three: 3,
						four: 4,
						five: 5,
						six: 6,
						seven: 7,
						eight: 8,
						nine: 9,
						ten: 10,
					};

					let number = transcriptText.match(/\d+/);

					if (!number) {
						for (const [word, num] of Object.entries(wordToNumber)) {
							if (transcriptText.includes(word)) {
								number = [num.toString()];
								break;
							}
						}
					}

					if (number) {
						const numTeams = parseInt(number[0]);
						if (numTeams > 0 && numTeams <= 10) {
							setTeams(numTeams);
							setTranscript(
								`Got ${numTeams} teams! Now tell me the category and say 'begin game' when ready`
							);
							setStage(2);
              !announcementMade ? speak(
                "Great, choose a category between general, sports, celebrities, or geography"
              ) : null;
						}
					}
				}
				// Stage 2: Getting category and waiting for "begin game"
				else if (stageRef.current === 2) {
					setTranscript(transcriptText);

					if (transcriptText.includes("begin game")) {
						const finalCategory = categoryRef.current || "general";
						window.location.href = `/game?teams=${
							teamsRef.current
						}&category=${encodeURIComponent(finalCategory)}`;
					} else {
						setCategory(transcriptText);
					}
				}
			};

			recognition.onend = () => {
				if (isStarted) {
					recognition.start();
				}
			};

			recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
				console.error("Speech recognition error:", event.error);
				setTranscript(`Error: ${event.error}. Please try again.`);
			};

			recognitionRef.current = recognition;
		}

		return () => {
			if (recognitionRef.current) {
        //@ts-ignore
				recognitionRef.current.stop();
			}
		};
	}, [isStarted]);

	const startContinuousListening = () => {
		if (recognitionRef.current && !isStarted) {
      //@ts-ignore
			recognitionRef.current.start();
			setIsStarted(true);
			setTranscript("Listening... Say 'Start' to begin the game setup");
		}
	};

	const stages = [
		{
			title: "Welcome to Voice Trivia!",
			description: "Say 'Start' to begin the game setup",
			icon: <Mic className="w-12 h-12 text-primary" />,
		},
		{
			title: "Team Setup",
			description: "Say a number between 1 and 10 for teams",
			icon: <Users className="w-12 h-12 text-primary" />,
		},
		{
			title: "Choose Category",
			description: "Say your preferred category and 'Begin Game' when ready",
			icon: <Brain className="w-12 h-12 text-primary" />,
		},
	];

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<div className="max-w-md w-full space-y-4">
				<Card className="w-full transition-all duration-500 transform hover:scale-105">
					<CardHeader className="text-center">
						<CardTitle className="text-2xl font-bold">
							{stages[stage].title}
						</CardTitle>
						<CardDescription>{stages[stage].description}</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col items-center space-y-4">
						<div className="p-4 bg-muted rounded-full transition-all duration-300 hover:bg-muted/80">
							{stages[stage].icon}
						</div>

						{!isStarted ? (
							<Button
								size="lg"
								className="transition-all duration-300"
								onClick={startContinuousListening}
							>
								<Mic className="mr-2 h-4 w-4" />
								Start Listening
							</Button>
						) : (
							<div className="flex items-center space-x-2 text-primary">
								<Mic className="h-6 w-6 animate-pulse" />
								<span>Listening...</span>
							</div>
						)}

						{transcript && (
							<Alert>
								<AlertDescription className="text-center animate-fade-in">
									{transcript}
								</AlertDescription>
							</Alert>
						)}

						<div className="flex items-center space-x-2">
							{Array.from({ length: 3 }).map((_, index) => (
								<div
									key={index}
									className={`w-3 h-3 rounded-full transition-all duration-300 ${
										index === stage ? "bg-primary scale-125" : "bg-muted"
									}`}
								/>
							))}
						</div>

						{teams > 0 && (
							<Alert>
								<AlertDescription className="text-center">
									Teams: {teams}
								</AlertDescription>
							</Alert>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export default ContinuousSpeechLanding;
