import { useEffect, useRef, useState } from 'react'
import { Chat } from "react-chat-module";
import "react-chat-module/dist/index.css";
import styles from './App.module.css';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const AZURE_API_KEY = "3d6f86c1346c47d4880bb548c6b304ce";
const AZURE_BACKEND_URL = "https://odlu-m23ljsw2-eastus2.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-02-15-preview"

const testComponent = () => {
  return <div>Test</div>;
}


function App() {
  const [isListening, setIsListening]  = useState(false);
  const audioRef = useRef();
  // add initial set of example messages
  // const [messages, setMessages] = useState([
  //   {
  //     createdAt: new Date(Date.now()),
  //     messageId: "1",
  //     senderId: "1",
  //     profilePicture: "https://via.placeholder.com/150",
  //     type: "text",
  //     text: "Hello, how are you?",
  //     name: "You"
  //   },
  //   {
  //     createdAt: new Date(Date.now() + 2000),
  //     messageId: "2",
  //     senderId: "2",
  //     profilePicture: "https://via.placeholder.com/150",
  //     type: "text",
  //     text: "Hungry, and you?"
  //   },
  // ]);

  // const [allSpokenWords] = '';
  const handleHeyDom = () => {
    setIsListening(true);
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
  const { listening, resetTranscript, transcript, browserSupportsSpeechRecognition } = useSpeechRecognition({ commands });
  const [promptValue, setPromptValue] = useState('')
  const handleResult = (value) => {
    setPromptValue(value);
    sendMessageToModel();
  }
  // const {
  //   isListening,
  //   isStopped,
  //   result,
  //   start,
  //   stop
  // } = useWebSpeech(handleResult);
  // useEffect(() => {
  //   console.log('Recording')
  //   const recognition = new webkitSpeechRecognition();
  //   recognition.lang = "en-US";
  //   recognition.interimResults = false;
  //   recognition.maxAlternatives = 1;
  //   recognition.continuous = true;

  //   console.log('starting recognition')
  //   recognition.start();
  //   recognition.onresult = (event) => {
  //     console.log(event)
  //     const speechResult = event.results[event.results.length - 1][0].transcript;
  //     console.log('Result:', speechResult)
  //     setPromptValue(speechResult)
  //   }
  //   recognition.onend = () => {
  //     console.log('ended')
  //   }
  //   recognition.onerror = (event) => {
  //     console.log('Error:', event.error)
  //   }

  //   return () => {
  //     console.log('stopping recognition')
  //     recognition.stop();
  //   }
  // }, [])

  // const onSend = async (message) => {
  //   // build new message received from chat component
  //   const messageId = parseInt(messages[messages.length - 1].messageId) + 1;
  //   const newMessage = {
  //     messageId: `${messageId}`,
  //     senderId: "1",
  //     profilePicture: "https://via.placeholder.com/150",
  //     type: message.type,
  //     text: message.text,
  //     createdAt: message.createdAt,
  //     read: false
  //   };

  //   // store user message in messages state and add "server" message
  //   // to simulate typing
  //   setMessages([
  //     ...(messages.filter((message) => message.type !== "typing")),
  //     newMessage, {
  //       messageId: `${messageId + 1}`,
  //       senderId: "2",
  //       profilePicture: "https://via.placeholder.com/150",
  //       type: "typing",
  //       createdAt: new Date(Date.now()),
  //       read: false
  //     }
  //   ]);

  //   setTimeout(() => {
  //     // send generated answer after 2secs of "typing"
  //     const answer = Object.assign({}, newMessage);
  //     answer.senderId = "2";
  //     answer.createdAt = new Date(Date.now());
  //     answer.messageId = `${messageId + 1}`;
  //     setMessages((messages) => [
  //       ...(messages.filter((message) => message.type !== "typing")),
  //       answer
  //     ]);
  //   }, 2000);
  // };
  SpeechRecognition.startListening({
    continuous: true
  });
  const sendMessageToModel = async (words) => {
    try {
      const response = await fetch(AZURE_BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_API_KEY
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: [{
                type: 'text',
                text: words
              }],
            }
          ]
        })
      });

      console.log('Success:', response);
      const responseJSON = await response.json();
      console.log(responseJSON?.choices[0]?.message?.content);
      setPromptValue('')
    } catch (error) {
      console.error('Error:', error);
    }
  }
  // adding chat component in full screen container
  return (
    <div className={styles.App}>
      {/* <Chat messages={messages} userId={"1"} onSend={onSend} disableAttachments customFactories={{
        test: {
          hasText: false,
          factory: testComponent
        }
      }} /> */}
      <audio ref={audioRef} controls={false} src="/dinner-bell.wav"></audio>
      <section className={styles.topNav}>In Store Assistant</section>
      <section className={styles.messagesContainer}>
        Chat Messages {Boolean(listening) && 'Listening' || 'Not Listening'} {Boolean(browserSupportsSpeechRecognition) ? 'Supports' : 'Doesn\'t Support' }
      </section>
      <section className={styles.inputRow}>
        <textarea className={styles.input} onInput={e => setPromptValue(e.currentTarget.value)} type="text" inputMode='text' value={promptValue} />
        <button onClick={() => { }}>Record</button>
        <button onClick={sendMessageToModel}>Send</button>
      </section>
    </div>
  );
}

export default App
