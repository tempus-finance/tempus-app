import About from '../About';
import Header from '../Header';
import Hero from '../Hero';
import Footer from '../Footer';
import Investors from '../Investors';
import Join from '../Join';

import './App.scss';

const App = (): JSX.Element => (
  <>
    <Header />
    <Hero />
    <About />
    <Investors />
    <Join />
    <Footer />
  </>
);
export default App;
