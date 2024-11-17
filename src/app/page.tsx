import SpeechToText from "@/components/stt";
import TextToSpeech from "@/components/tts";
import SpeechPlayer from "@/components/another_tts";
import ConfettiComponent from "@/components/confetti";
import Hero from "@/components/hero";

export default function Home() {
  return (
    <div className="flex flex-col items-center space-y-5">
      <Hero />
      <ConfettiComponent />
      <SpeechToText />
      <TextToSpeech />
      <SpeechPlayer />
    </div>
  );
}
