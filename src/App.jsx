import React, { useState, useEffect } from 'react';
import './App.css';
import { Button, FormControl, InputLabel, Input } from '@mui/material';
import Message from './Message';
import db from './firebase';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import SendIcon from '@mui/icons-material/Send';
import { IconButton } from '@mui/material';
import ThemeToggle from './ThemeToggle'; 


function App() {
  {/* input field */ }
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]); 
  const [username, setUsername] = useState('');

  //useEffect = block of code hich gets executed based on the conditions
  //useState = variable in REACT

  useEffect(() => {
    db.collection('messages')
      .orderBy('timestamp', 'desc')
      .onSnapshot(snapshot => {
        setMessages(snapshot.docs.map(doc => doc.data()))
      });

  }, [])

  useEffect(() => {
    // if there is no condition inside [] , code run once as the component loads
    setUsername(prompt('Please enter your name'));

  }, []) //condition

  const sendMessage = (event) => {
    //All the logic to send message goes
    event.preventDefault();
    db.collection('messages').add({
      message: input,
      username: username,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    setInput('');
  }

  return (
    <div className='App'>
      <ThemeToggle />
      <div className="logo-wrapper">
        <img src="/messenger-logo.png" alt="Messenger Logo" className="logo" />
      </div>
      {/* <h1>Hello Clever Programer 🚀</h1> */}
      <h2>Welcome {username}</h2>
      <div>
        <form className='app_form'>
          <FormControl className='app_formControl'>
            {/* <InputLabel>Enter a message</InputLabel> */}
            <Input className='app_input' placeholder='Enter a message...' value={input} onChange={event => setInput(event.target.value)} />
            <IconButton className='app_iconButton' disabled={!input} variant="contained" type='submit' onClick={sendMessage}>
              <SendIcon />
            </IconButton>
          </FormControl>
        </form>
      </div>

      {
        messages.map((message, index) => (
          <Message key={index} message={message} username={username} />
        ))
      }


    </div>
  );
};

export default App;
