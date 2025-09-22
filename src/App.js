
import './App.css';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  deleteUser
} from "firebase/auth";
import { getFirestore,collection,
  addDoc,
  query as firestoreQuery,
  orderBy,
  limit,  serverTimestamp} from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRef, useState, useEffect } from 'react';
//eslint-disable-next-line

const firebaseconfig = null // place firebase config details here

 const loaded = initializeApp(firebaseconfig)
 const auth = getAuth(loaded)
 const db = getFirestore(loaded)

 function Googlesignin() {
    const o2 = new GoogleAuthProvider();
    signInWithPopup(auth,o2)
 }

 function Trytheapp() {
  signInAnonymously(auth)
 }

 function Login() {
  return(
    <>
  <button onClick={Googlesignin}>Sign in with google </button>
  <button onClick={Trytheapp}>Try App</button>
  </>
  )
 }



function ChitChat() {
  const messagesRef = collection(db, 'messages');
  const messagesQuery = firestoreQuery(messagesRef, orderBy('createdAt'), limit(25));
  const [formValue, setFormValue] = useState('');
  const messagesEndRef = useRef(null);
  const [messages] = useCollectionData(messagesQuery, { idField: 'id' });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, displayName, photoURL } = auth.currentUser;

    setFormValue('');

    await addDoc(collection(db, "messages"), {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      username: displayName,
      photoURL
    });
  };

  return (
    <>
      <div className="chat-header">
        <button onClick={() => signOut(auth) && deleteUser(auth) }>Sign Out</button>
      </div>

      <div className="messages-container">
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={messagesEndRef}></div>
      </div>
      
      <form onSubmit={sendMessage}>
        <input 
          placeholder="Type a message..." 
          value={formValue} 
          onChange={(e) => setFormValue(e.target.value)} 
        />
        <button type='submit'>Send</button>
      </form>
    </>
  );
}
 


function ChatMessage(props) {
  const { text, uid, username, photoURL} = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';



  
  return (
    <div className={`message ${messageClass}`}>
      <img 
        src={photoURL} 
        alt="avatar" 
        className="avatar" 
      />
      <div className="message-content">
        <p className="username">{username}</p>
        <p className="text">{text}</p>
      </div>
    </div>
  );
}

function App() {
  const [loggedin] = useAuthState(auth);
  return (
    <div className="App">
      <header className="App-header">
        {loggedin ? (
          <>
            <ChitChat />
          </>
        ) : (
          <Login />
        )}
      </header>
    </div>
  );
}
export default App;
