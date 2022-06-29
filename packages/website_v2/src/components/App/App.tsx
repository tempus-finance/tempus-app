import About from '../About';
import Header from '../Header';
import Hero from '../Hero';
import Blog from '../Blog';
import Footer from '../Footer';
import Investors from '../Investors';
import Join from '../Join';
import FundsAvailable from '../FundsAvailable';

const App = (): JSX.Element => (
  <>
    <Header />
    <Hero />
    <FundsAvailable />
    <About />
    <Investors />
    <Blog />
    <Join />
    <Footer />
  </>
);
export default App;
