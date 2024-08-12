"use client";
import { Box, Stack, TextField, Button } from "@mui/material";
import { useState, useRef, useEffect } from "react";

function parseResponse(text) {
  const lines = text.split("\n").filter((line) => line.trim() !== "");

  return lines.map((line, index) => {
    if (line.startsWith("*")) {
      // Handle bullet points and sub-bullet points
      return <li key={index}>{line.replace("*", "").trim()}</li>;
    } else if (line.includes(":")) {
      // Handle titles or strong text
      return (
        <p key={index}>
          <strong>{line}</strong>
        </p>
      );
    } else {
      // Default case for paragraphs
      return <p key={index}>{line}</p>;
    }
  });
}

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "model",
      content:
        "Hi! I'm the HeadStarter support model. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "model", content: "" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messages, { role: "user", content: message }]),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      console.log(response);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);
        return [
          ...otherMessages,
          {
            ...lastMessage,
            content:
              "I'm sorry, but I encountered an error. Please try again later.",
          },
        ];
      });
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box
      sx={{ backgroundColor: "white" }}
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      py={5}
      px={2.5}
    >
      <Stack
        direction="column"
        width="100%"
        maxWidth="600px"
        height="100%"
        border="1px solid black"
        py={2}
        spacing={3}
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
          px={2}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "model" ? "flex-start" : "flex-end"
              }
            >
              <Box
                bgcolor={
                  message.role === "model" ? "primary.main" : "secondary.main"
                }
                color="white"
                borderRadius={16}
                p={3}
                className="chatbot-response"
              >
                {message.content}
                {/* {parseResponse(message.content)} */}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction="row" spacing={2} px={2}>
          <TextField
            label="message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
