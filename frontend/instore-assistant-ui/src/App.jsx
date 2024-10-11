import { useEffect, useRef, useState } from "react";
import styles from "./App.module.css";
import ChatMessage from "./components/ChatMessage";
import c from "classnames";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const AZURE_API_KEY = "3d6f86c1346c47d4880bb548c6b304ce";
const AZURE_BACKEND_URL =
  "https://odlu-m23ljsw2-eastus2.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-02-15-preview";

function App() {
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening]  = useState(false);
  const audioRef = useRef();
  const [promptValue, setPromptValue] = useState("");
  
  const handleHeyDom = () => {
    setIsListening(true);
    console.log('isListening');
    audioRef.current.play();
  }
  const handleWords = (words) => {
    console.log('handleWords', words, isListening);
    if (isListening) {
      setPromptValue(words);
      sendMessageToModel(words);
      setIsListening(false);
    }
  }
  const commands = [
    {
      command: 'Hey Dom',
      callback: () => handleHeyDom()
    },
    {
      command: '*',
      callback: (words) => handleWords(words)
    }
  ]
  const { listening, transcript, isMicrophoneAvailable } = useSpeechRecognition({ commands });

  
  useEffect(() => {
    console.log('isListening', listening, isListening, transcript, isMicrophoneAvailable);
  }, [listening, isListening, transcript, isMicrophoneAvailable])
  
  const sendMessageToModel = async (words) => {
    setMessages((messages) => [...messages, { text: words }]);
    try {
      const response = await fetch(AZURE_BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": AZURE_API_KEY,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: [
                {
                  type: "text",
                  text: words,
                },
              ],
            },
          ],
        }),
      });

      console.log("Success:", response);
      const responseJSON = await response.json();
      setMessages((messages) => [
        ...messages,
        { text: responseJSON?.choices[0]?.message?.content },
      ]);
      console.log(responseJSON?.choices[0]?.message?.content);
      setPromptValue("");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  SpeechRecognition.startListening({
    continuous: true
  });

  // adding chat component in full screen container
  return (
    <div className={styles.App}>
      <audio ref={audioRef} src="/dinner-bell.wav"></audio>
      <section className={styles.topNav}>In Store Assistant</section>
      <section
        className={c(
          styles.messagesContainer,
          !messages.length && styles.noMessages
        )}
      >
        {messages.length ? (
          messages.map((message, index) => {
            return (
              <ChatMessage key={index} isLeftAligned={index % 2 ? false : true}>
                {message.text}
              </ChatMessage>
            );
          })
        ) : (
          <div>No messages</div>
        )}
      </section>
      <section className={styles.inputRow}>
        <textarea
          className={styles.input}
          onInput={(e) => setPromptValue(e.currentTarget.value)}
          type="text"
          inputMode="text"
          value={promptValue}
        />
        <button onClick={() => {}}>Record</button>
        <button onClick={sendMessageToModel}>Send</button>
      </section>
    </div>
  );
}

export default App;
