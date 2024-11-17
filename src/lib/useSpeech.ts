import { ElevenLabsClient } from "elevenlabs";

export const speak = async (text: string) => {
  try {
    const elevenlabs = new ElevenLabsClient({
      apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
    });

    const audio = await elevenlabs.generate({
      voice: "Sarah",
      text: text,
      model_id: "eleven_multilingual_v2"
    });

    // Convert Readable to Uint8Array
    const chunks: Uint8Array[] = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Create blob from buffer
    const audioBlob = new Blob([buffer], { type: 'audio/mpeg' });
    // Create audio URL
    const audioUrl = URL.createObjectURL(audioBlob);
    // Create and play audio
    const audioElement = new Audio(audioUrl);
    
    await audioElement.play();
    new Promise(resolve => setTimeout(resolve, 10000));
  } catch (error) {
    console.error("Error playing audio:", error);
  }
};
