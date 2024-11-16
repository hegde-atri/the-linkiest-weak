import SpeechToText from "@/components/stt";
import TextToSpeech from "@/components/tts";

export default function Home() {
  return (
    <div className="flex flex-col">
      <TextToSpeech />
    </div>
  );
}
