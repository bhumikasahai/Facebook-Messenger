import React, { useState, useEffect } from 'react';
import './App.css';

import {
  Button,
  FormControl,
  Input,
  TextField
} from '@mui/material';

import Message from './Message';
import db, { auth } from './firebase';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

import SendIcon from '@mui/icons-material/Send';
import { IconButton } from '@mui/material';

import ThemeToggle from './ThemeToggle';


function App() {

  // ==========================================
  // AUTHENTICATION STATES
  // ==========================================

  const [user, setUser] = useState(null);

  const [authLoading, setAuthLoading] = useState(true);

  const [authorizationLoading, setAuthorizationLoading] =
    useState(false);

  const [isAuthorized, setIsAuthorized] = useState(false);

  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [name, setName] = useState('');

  const [authError, setAuthError] = useState('');


  // ==========================================
  // CHAT STATES
  // ==========================================

  const [input, setInput] = useState('');

  const [messages, setMessages] = useState([]);


  // ==========================================
  // CHECK FIREBASE AUTHENTICATION STATE
  // ==========================================

  useEffect(() => {

    const unsubscribe = auth.onAuthStateChanged(
      (currentUser) => {

        setUser(currentUser);

        setAuthLoading(false);

      }
    );

    return () => unsubscribe();

  }, []);


  // ==========================================
  // CHECK WHETHER USER IS AUTHORIZED
  // ==========================================

  useEffect(() => {

    const checkAuthorization = async () => {

      if (!user) {

        setIsAuthorized(false);

        return;

      }

      setAuthorizationLoading(true);

      try {

        // The Firebase UID is used as the
        // document ID inside authorizedUsers

        const authorizedUser =
          await db
            .collection('authorizedUsers')
            .doc(user.uid)
            .get();


        // User exists AND approved == true

        if (
          authorizedUser.exists &&
          authorizedUser.data().approved === true
        ) {

          setIsAuthorized(true);

        } else {

          setIsAuthorized(false);

          // Automatically sign out
          // unauthorized user

          await auth.signOut();

          setAuthError(
            'Your account has not been authorized to access this chat.'
          );

        }

      } catch (error) {

        console.error(
          'Authorization check failed:',
          error
        );

        setIsAuthorized(false);

        await auth.signOut();

        setAuthError(
          'Unable to verify your authorization.'
        );

      } finally {

        setAuthorizationLoading(false);

      }

    };


    checkAuthorization();

  }, [user]);


  // ==========================================
  // GET MESSAGES FROM FIRESTORE
  // ==========================================

  useEffect(() => {

    if (!user || !isAuthorized) {

      setMessages([]);

      return;

    }


    const unsubscribe = db
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .onSnapshot(

        (snapshot) => {

          setMessages(

            snapshot.docs.map((doc) => ({

              id: doc.id,

              ...doc.data()

            }))

          );

        },

        (error) => {

          console.error(
            'Error loading messages:',
            error
          );

        }

      );


    return () => unsubscribe();

  }, [user, isAuthorized]);


  // ==========================================
  // LOGIN / SIGN UP
  // ==========================================

  const handleAuthentication = async (event) => {

    event.preventDefault();

    setAuthError('');

    try {

      // ========================================
      // LOGIN
      // ========================================

      if (isLogin) {

        await auth.signInWithEmailAndPassword(
          email,
          password
        );

      }

      // ========================================
      // SIGN UP
      // ========================================

      else {

        const result =
          await auth.createUserWithEmailAndPassword(
            email,
            password
          );


        // Save user's name inside Firebase Auth

        await result.user.updateProfile({

          displayName: name

        });


        /*
         IMPORTANT:

         We DO NOT automatically authorize
         the newly created user.

         The user must be manually added to
         authorizedUsers by the application owner.
        */

        await auth.signOut();

        setAuthError(
          'Account created successfully. Please wait for the administrator to authorize your account.'
        );

        setIsLogin(true);

      }


      setEmail('');

      setPassword('');

      setName('');

    }

    catch (error) {

      console.error(error);

      // Convert Firebase error messages
      // into simpler messages

      switch (error.code) {

        case 'auth/user-not-found':

          setAuthError(
            'No account found with this email.'
          );

          break;


        case 'auth/wrong-password':

          setAuthError(
            'Incorrect password.'
          );

          break;


        case 'auth/email-already-in-use':

          setAuthError(
            'An account with this email already exists.'
          );

          break;


        case 'auth/invalid-email':

          setAuthError(
            'Please enter a valid email address.'
          );

          break;


        case 'auth/weak-password':

          setAuthError(
            'Password should be at least 6 characters.'
          );

          break;


        default:

          setAuthError(
            error.message
          );

      }

    }

  };


  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {

    try {

      await auth.signOut();

      setUser(null);

      setIsAuthorized(false);

      setMessages([]);

    }

    catch (error) {

      console.error(
        'Logout error:',
        error
      );

    }

  };


  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const sendMessage = async (event) => {

    event.preventDefault();


    // Prevent unauthorized users
    // from sending messages

    if (
      !input.trim() ||
      !user ||
      !isAuthorized
    ) {

      return;

    }


    try {

      await db
        .collection('messages')
        .add({

          message: input.trim(),

          username:
            user.displayName ||
            user.email,

          userId: user.uid,

          timestamp:
            firebase.firestore
              .FieldValue
              .serverTimestamp()

        });


      setInput('');

    }

    catch (error) {

      console.error(
        'Message sending error:',
        error
      );

    }

  };


  // ==========================================
  // AUTHENTICATION LOADING SCREEN
  // ==========================================

  if (authLoading) {

    return (

      <div className="auth-page">

        <ThemeToggle />

        <div className="auth-card">

          <img
            src="/messenger-logo.png"
            alt="Messenger Logo"
            className="auth-logo"
          />

          <h2>Loading...</h2>

          <p className="auth-subtitle">
            Checking your session
          </p>

        </div>

      </div>

    );

  }


  // ==========================================
  // AUTHORIZATION LOADING SCREEN
  // ==========================================

  if (
    user &&
    authorizationLoading
  ) {

    return (

      <div className="auth-page">

        <ThemeToggle />

        <div className="auth-card">

          <img
            src="/messenger-logo.png"
            alt="Messenger Logo"
            className="auth-logo"
          />

          <h2>Checking access...</h2>

          <p className="auth-subtitle">
            Verifying your authorization
          </p>

        </div>

      </div>

    );

  }


  // ==========================================
  // LOGIN / SIGNUP SCREEN
  // ==========================================

  if (!user) {

    return (

      <div className="auth-page">

        <ThemeToggle />


        <div className="auth-card">

          <img
            src="/messenger-logo.png"
            alt="Messenger Logo"
            className="auth-logo"
          />


          <h1>

            {isLogin
              ? 'Welcome back'
              : 'Create Account'}

          </h1>


          <p className="auth-subtitle">

            {isLogin

              ? 'Login to continue to Messenger'

              : 'Create your account to request access'}

          </p>


          <form
            onSubmit={handleAuthentication}
            className="auth-form"
          >


            {!isLogin && (

              <TextField

                label="Name"

                variant="outlined"

                value={name}

                onChange={(event) =>
                  setName(event.target.value)
                }

                required

                fullWidth

              />

            )}


            <TextField

              label="Email"

              type="email"

              variant="outlined"

              value={email}

              onChange={(event) =>
                setEmail(event.target.value)
              }

              required

              fullWidth

            />


            <TextField

              label="Password"

              type="password"

              variant="outlined"

              value={password}

              onChange={(event) =>
                setPassword(event.target.value)
              }

              required

              fullWidth

            />


            {authError && (

              <p className="auth-error">

                {authError}

              </p>

            )}


            <Button

              type="submit"

              variant="contained"

              fullWidth

              className="auth-button"

            >

              {isLogin
                ? 'LOGIN'
                : 'SIGN UP'}

            </Button>


          </form>


          <Button

            className="auth-switch"

            onClick={() => {

              setIsLogin(!isLogin);

              setAuthError('');

            }}

          >

            {isLogin

              ? 'New user? Create an account'

              : 'Already have an account? Login'}

          </Button>


        </div>

      </div>

    );

  }


  // ==========================================
  // USER EXISTS BUT IS NOT AUTHORIZED
  // ==========================================

  if (
    user &&
    !isAuthorized
  ) {

    return (

      <div className="auth-page">

        <ThemeToggle />

        <div className="auth-card">

          <img
            src="/messenger-logo.png"
            alt="Messenger Logo"
            className="auth-logo"
          />

          <h1>Access Restricted</h1>

          <p className="auth-subtitle">

            Your account has not been authorized
            to access this chat.

          </p>


          <Button

            variant="contained"

            onClick={handleLogout}

            className="auth-button"

          >

            Logout

          </Button>

        </div>

      </div>

    );

  }


  // ==========================================
  // MESSENGER SCREEN
  // ==========================================

  return (

    <div className="App">

      <ThemeToggle />


      {/* HEADER */}

      <div className="chat-header">

        <div className="logo-wrapper">

          <img
            src="/messenger-logo.png"
            alt="Messenger Logo"
            className="logo"
          />

        </div>


        <div className="chat-user">

          <div>

            <h2>
              Messenger
            </h2>

            <p>
              {user.displayName || user.email}
            </p>

          </div>


          <Button
            variant="outlined"
            onClick={handleLogout}
          >

            Logout

          </Button>

        </div>

      </div>


      {/* MESSAGES */}

      <div className="messages-container">

        {messages.length === 0 ? (

          <div className="empty-chat">

            <h3>
              No messages yet
            </h3>

            <p>
              Start the conversation 👋
            </p>

          </div>

        ) : (

          messages.map((message) => (

            <Message

              key={message.id}

              message={message}

              username={
                user.displayName ||
                user.email
              }

            />

          ))

        )}

      </div>


      {/* MESSAGE INPUT */}

      <form
        className="app_form"
        onSubmit={sendMessage}
      >

        <FormControl
          className="app_formControl"
        >

          <Input

            className="app_input"

            placeholder="Enter a message..."

            value={input}

            onChange={(event) =>
              setInput(event.target.value)
            }

          />


          <IconButton

            className="app_iconButton"

            disabled={!input.trim()}

            type="submit"

          >

            <SendIcon />

          </IconButton>


        </FormControl>

      </form>


    </div>

  );

}


export default App;