import About from '../About';
import Header from '../Header';
import Hero from '../Hero';
import Footer from '../Footer';
import Investors from '../Investors';

import './App.scss';

const App = (): JSX.Element => (
  <>
    <Header />
    <Hero />
    <About />
    <Investors />
    <Footer />
  </>
);
export default App;
