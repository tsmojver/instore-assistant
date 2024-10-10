import { useEffect, useState } from 'react'
import { Chat } from "react-chat-module";
import "react-chat-module/dist/index.css";
import styles from './App.module.css';
import ChatMessage from './components/ChatMessage';
import c from 'classnames';

const AZURE_API_KEY = "3d6f86c1346c47d4880bb548c6b304ce";
const AZURE_BACKEND_URL = "https://odlu-m23ljsw2-eastus2.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-02-15-preview"

const testComponent = () => {
  return <div>Test</div>;
}


function App() {
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

  const [messages, setMessages] = useState([]);

  // const [allSpokenWords] = '';
  const [promptValue, setPromptValue] = useState('')

  useEffect(() => {
    console.log('Recording')
    const recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;

    console.log('starting recognition')
    recognition.start();
    recognition.onresult = (event) => {
      console.log(event)
      const speechResult = event.results[event.results.length - 1][0].transcript;
      console.log('Result:', speechResult)
      setPromptValue(speechResult)
    }
    recognition.onend = () => {
      console.log('ended')
    }
    recognition.onerror = (event) => {
      console.log('Error:', event.error)
    }

    return () => {
      console.log('stopping recognition')
      recognition.stop();
    }
  }, [])

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

  const sendMessageToModel = async () => {
    setMessages(messages => [...messages, { text: promptValue }])

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
                text: promptValue
              }],
            }
          ]
        })
      });

      console.log('Success:', response);
      const responseJSON = await response.json();
      setMessages(messages => [...messages, { text: responseJSON?.choices[0]?.message?.content }])
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
      <section className={styles.topNav}>In Store Assistant</section>
      <section className={c(styles.messagesContainer, !messages.length && styles.noMessages)}>
        {messages.length ? messages.map((message, index) => { return <ChatMessage key={index} isLeftAligned={index % 2 ? false : true}>{message.text}</ChatMessage> }) : <div>No messages</div>}
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
