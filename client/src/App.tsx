import { connectSocket } from './services/socket';

import { Chat } from './components/Chat';

const accessToken = prompt('Enter token') || '';

connectSocket(accessToken);

function App() {
  return <Chat accessToken={accessToken} />;
}

export default App;
