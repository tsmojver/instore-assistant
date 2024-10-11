import { useEffect, useState } from "react"

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

export const useWebSpeech = (callback) => {
  console.log('start useWebSpeech');
  const [isListening, setIsListening]  = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [result, setResult] = useState(null);

  const grammarWords = [
    "Hey Dom"
  ];
  
  const grammar = `#JSGF V1.0; grammar wake; public <wake> = ${grammarWords.join(" | ")}`;
  useEffect(() => {
    const recognition = new SpeechRecognition();
    const speechRecognitionList = new SpeechGrammarList();
    speechRecognitionList.addFromString(grammar, 1);
    recognition.grammars = speechRecognitionList;
    recognition.continious = true;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      if (event.results[0][0].transcript.toLowerCase() == "hey dom") {
        console.log("wake word recognized");
        setIsListening(true);
        document.querySelector("#sound").play();
        return;
      }
      if (isListening) {
        console.log("wake word heard", event.results[0][0].transcript)
        setResult(event.results[0][0].transcript)
        callback(event.results[0][0].transcript);
        setIsListening(false);
      }
    }
    recognition.onend = () => {
      if (!isStopped) {
        console.log("starting again");
        recognition.start();
      }
    };

    
    recognition.start();

  }, []);
  const stop = () => {
    setIsStopped(true);
    console.log("stop initiated")
  }
  const start = () => {
    setIsStopped(false);
    console.log('start initiated')
    //recognition.start();
  }
  return {
    isListening,
    isStopped,
    result,
    start,
    stop
  }
}