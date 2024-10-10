import { useState } from "react";
import styles from "./App.module.css";
import ChatMessage from "./components/ChatMessage";
import c from "classnames";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

const AZURE_API_KEY = "3d6f86c1346c47d4880bb548c6b304ce";
const AZURE_BACKEND_URL =
  "https://odlu-m23ljsw2-eastus2.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-02-15-preview";

var subscriptionKey = "bd12a82306f448b1bb537464ea58ca8c";
var serviceRegion = "eastus";

function App() {

  const [messages, setMessages] = useState([]);

  // const [allSpokenWords] = '';
  const [promptValue, setPromptValue] = useState("");
  var speechConfig = sdk.SpeechConfig.fromSubscription(
    subscriptionKey,
    serviceRegion
  );
  var audioConfig;

  const startMicrophoneInput = async () => {
    audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();

    // setting the recognition language to English.
    speechConfig.speechRecognitionLanguage = "en-US";

    // create the speech recognizer.
    var recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    // start the recognizer and wait for a result.
    recognizer.recognizeOnceAsync(
      function (result) {
        console.log("Result:", result);
        setPromptValue(result.text);

        recognizer.close();
        recognizer = undefined;
      },
      function (err) {
        console.trace("err - " + err);

        recognizer.close();
        recognizer = undefined;
      }
    );
  };

  const sendMessageToModel = async () => {
    setMessages((messages) => [...messages, { text: promptValue }]);

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
                  text: promptValue,
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

  // adding chat component in full screen container
  return (
    <div className={styles.App}>
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
        <button onClick={startMicrophoneInput}>Record</button>
        <button onClick={sendMessageToModel}>Send</button>
      </section>
    </div>
  );
}

export default App;
