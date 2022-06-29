import About from '../About';
import Header from '../Header';
import Hero from '../Hero';
import Blog from '../Blog';
import Footer from '../Footer';
import Investors from '../Investors';
import Join from '../Join';
import Treasury from '../Treasury';
import Invest from '../Invest';
import Products from '../Products';

const App = (): JSX.Element => (
  <>
    <Header />
    <Hero />
    <Treasury />
    <About />
    <Products />
    <Invest />
    <Investors />
    <Blog />
    <Join />
    <Footer />
  </>
);
export default App;
