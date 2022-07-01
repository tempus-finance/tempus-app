import { useRef } from 'react';
import About from '../About';
import Header from '../Header';
import Hero from '../Hero';
import Blog from '../Blog';
import Footer from '../Footer';
import Investors from '../Investors';
import Join from '../Join';
import Invest from '../Invest';
import Treasury from '../Treasury';
import Who from '../Who';

const App = (): JSX.Element => {
  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <div className="tw__root" ref={rootRef}>
      <Header />
      <Hero />
      <About />
      <Invest />
      <Treasury />
      <Who />
      <Investors />
      <Blog />
      <Join />
      <Footer />
    </div>
  );
};
export default App;
