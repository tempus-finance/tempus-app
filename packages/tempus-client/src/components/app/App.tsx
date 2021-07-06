import Header from '../header/header';
import Landing from '../landing/landing';

import './App.scss';

function App(): JSX.Element {
  return (
    <div className="app-container">
      <Header />
      <Landing />
    </div>
  );
}

export default App;
