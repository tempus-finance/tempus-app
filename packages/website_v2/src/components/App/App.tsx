import About from '../About';
import Header from '../Header';
import Hero from '../Hero';
import Blog from '../Blog';
import Footer from '../Footer';
import Investors from '../Investors';

import './App.scss';

const App = (): JSX.Element => (
  <>
    <Header />
    <Hero />
    <About />
    <Investors />
    <Blog />
    <Footer />
  </>
);
export default App;
