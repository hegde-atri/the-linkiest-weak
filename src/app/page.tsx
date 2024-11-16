import SpeechToText from "@/components/stt";
import TextToSpeech from "@/components/tts";
import SpeechPlayer from "@/components/another_tts";

export default function Home() {
  return (
    <div className="flex flex-col">
      <TextToSpeech />
      <SpeechPlayer />
    </div>
  );
}
