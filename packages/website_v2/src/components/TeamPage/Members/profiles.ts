import davidImg from './profiles/david.png';
import dordeImg from './profiles/dorde.png';
import adriImg from './profiles/adri.png';
import alexImg from './profiles/alex.png';
import cristianoImg from './profiles/cristiano.png';
import danieleImg from './profiles/daniele.png';
import dhruvImg from './profiles/dhruv.png';
import georgeImg from './profiles/george.png';
import irinelImg from './profiles/irinel.png';
import jormaImg from './profiles/jorma.png';
import joshImg from './profiles/josh.png';
import krumImg from './profiles/krum.png';
import lazarImg from './profiles/lazar.png';
import milicaImg from './profiles/milica.png';
import olafImg from './profiles/olaf.png';
import pujeetImg from './profiles/pujeet.png';
import rtpImg from './profiles/rtp.png';
import stefanImg from './profiles/stefan.png';
import timImg from './profiles/tim.png';
import tonyImg from './profiles/tony.png';
import vukasinImg from './profiles/vukasin.png';
import yuvalImg from './profiles/yuval.png';

export interface Profile {
  name: string;
  fullname: string;
  avatar: string;
  title: string;
  twitter?: string;
  linkedIn?: string;
  github?: string;
  desc: string;
  isBuilder?: boolean;
  isCreator?: boolean;
  isConnector?: boolean;
}

export const FOUNDERS: Profile[] = [
  {
    name: 'David Garai',
    fullname: 'David Garai',
    avatar: davidImg,
    title: 'Founder',
    twitter: 'https://twitter.com/davgarai',
    linkedIn: 'https://www.linkedin.com/in/davidgarai/',
    desc: 'David is responsible for providing strategic, financial and operational leadership at Tempus. Before founding Tempus with Đorđe, he worked as a structured finance lawyer in London and Tokyo. In his spare time, David enjoys shitposting on Twitter.',
    isCreator: true,
    isConnector: true,
  },
  {
    name: 'Đorđe Mijović',
    fullname: 'Đorđe Mijović',
    avatar: dordeImg,
    title: 'Co-founder',
    twitter: 'https://twitter.com/mijovic988',
    linkedIn: 'https://www.linkedin.com/in/mijovic88',
    github: 'https://github.com/mijovic',
    desc: 'Đorđe takes responsibility for technological oversight at Tempus. Before co-founding Tempus with David, he worked as a core Solidity compiler developer at Ethereum Foundation.',
    isBuilder: true,
    isConnector: true,
  },
];

export const DEVELOPMENTS: Profile[] = [
  {
    name: 'Alex',
    fullname: 'Alex Beregszaszi',
    avatar: alexImg,
    title: 'Blockchain Engineer',
    twitter: 'https://twitter.com/alexberegszaszi',
    linkedIn: 'https://www.linkedin.com/in/alexberegszaszi/',
    github: 'https://github.com/axic',
    desc: 'Alex enjoys thinking about protocol designs at Tempus. He has worked in embedded software development, fintech, and for the past 10 years with blockchain systems.',
    isBuilder: true,
  },
  {
    name: 'Cristiano',
    fullname: 'Cristiano Ventricelli',
    avatar: cristianoImg,
    title: 'Quantitative Analyst',
    twitter: 'https://twitter.com/Cristianoventr2',
    desc: "Cristiano is our resident quantitative guru. He has over 7 years' experience in financial modeling and risk analytics in banks, insurance companies, and asset management firms.",
    isCreator: true,
  },
  {
    name: 'Daniele',
    fullname: 'Daniele Damiani',
    avatar: danieleImg,
    title: 'Frontend Lead',
    twitter: 'https://twitter.com/_danieledamiani',
    linkedIn: 'https://www.linkedin.com/in/danieledamiani/',
    github: 'https://github.com/danieledamiani',
    desc: "Daniele is one of Tempus' frontend engineers. He has worked in a wide array of industries, including gaming, insurance, fintech, banking, and now DeFi.",
    isBuilder: true,
  },
  {
    name: 'George',
    fullname: 'George Cao',
    avatar: georgeImg,
    title: 'Head of Research',
    linkedIn: 'https://www.linkedin.com/in/george-cao-3aa07625/',
    desc: "George heads up research at Tempus. He has over 15 years' experience working in global hedge funds, investment banks, and fintechs, where he has researched, trained, and traded.",
    isCreator: true,
  },
  {
    name: 'Irinel',
    fullname: 'Irinel Tapalaga',
    avatar: irinelImg,
    title: 'QA Engineer',
    twitter: 'https://twitter.com/TapalagaIrinel',
    linkedIn: 'https://www.linkedin.com/in/irinel-tapalaga/',
    github: 'https://github.com/irinelT',
    desc: "Irinel is responsible for ensuring Tempus meets specified requirements. He has over 5 years' experience of manual and automated QA. He also has a PhD in Physics.",
    isBuilder: true,
  },
  {
    name: 'Jorma',
    fullname: 'Jorma Rebane',
    avatar: jormaImg,
    title: 'Blockchain Engineer',
    twitter: 'https://twitter.com/jorma_rebane',
    linkedIn: 'https://www.linkedin.com/in/jorma-rebane-319067126/',
    github: 'https://github.com/RedFox20',
    desc: "Jorma is one of Tempus' blockchain engineers. He has over 12 years' software engineering experience with high performance computing and high frequency trading.",
    isBuilder: true,
  },
  {
    name: 'Krum',
    fullname: 'Krum Pashov',
    avatar: krumImg,
    title: 'Blockchain Engineer',
    linkedIn: 'https://www.linkedin.com/in/krum-krasimirov-pashov/',
    github: 'https://github.com/pashov',
    desc: 'Krum is one of Tempus’ blockchain engineers. He has experience in a variety of sectors, including finance, cloud, and crypto. Prior to joining Tempus, he worked at Nexo where he built and scaled crypto exchange products and carried out integrations with various DeFi projects.',
    isBuilder: true,
  },
  {
    name: 'Lazar',
    fullname: 'Lazar Mitić',
    avatar: lazarImg,
    title: 'Frontend Engineer',
    linkedIn: 'https://www.linkedin.com/in/lazarmitic/',
    github: 'https://github.com/lazarmitic',
    desc: "Lazar is one of Tempus' frontend engineers. He has over 6 years' software engineering experience. Before joining Tempus, he worked as a software graphics engineer making 3D and VR applications.",
    isBuilder: true,
  },
  {
    name: 'Olaf',
    fullname: 'Olaf Kuusik',
    avatar: olafImg,
    title: 'UX Designer',
    twitter: 'https://twitter.com/OlafKuusik',
    linkedIn: 'https://www.linkedin.com/in/olaf-k-37943ab4/',
    desc: "Olaf is responsible for making Tempus as easy to use as possible. He has over 8 years' experience as a designer working in both traditional finance and various design agencies making web and product designs.",
    isCreator: true,
  },
  {
    name: 'Richard',
    fullname: 'Richard Thomas-Pryce',
    avatar: rtpImg,
    title: 'Head of Product',
    twitter: 'https://twitter.com/RTPthefirst',
    linkedIn: 'https://www.linkedin.com/in/rtp/',
    desc: 'Richard is responsible for shipping products that users love. He previously worked at some of the largest banks focusing on global markets and derivatives. He also has a Masters degree in Cognitive and Decision Sciences from UCL.',
    isCreator: true,
    isConnector: true,
  },
  {
    name: 'Stefan',
    fullname: 'Stefan Vitorović',
    avatar: stefanImg,
    twitter: 'https://twitter.com/StefanVitorovic',
    linkedIn: 'https://www.linkedin.com/in/stefan-vitorovi%C4%87-317b5170/',
    github: 'https://github.com/StefanVitor',
    title: 'Blockchain Engineer',
    desc: "Stefan is one of Tempus' blockchain engineers. He has over 8 years' full stack and system architect experience in developing and implementing different systems. Before joining Tempus, Stefan worked at Composable Finance.",
    isBuilder: true,
  },
  {
    name: 'Tim',
    fullname: 'Tim Liu',
    avatar: timImg,
    title: 'Frontend Engineer',
    twitter: 'https://twitter.com/shawtim_eth',
    github: 'https://github.com/ShawTim/',
    desc: "Tim is one of Tempus' frontend engineers. He worked at IBM for over 8 years and for a further 5 years as a developer in various startups. He is also a Doge meme lover.",
    isBuilder: true,
  },
  {
    name: 'Vukašin',
    fullname: 'Vukašin Manojlović',
    avatar: vukasinImg,
    title: 'Frontend Engineer',
    twitter: 'https://twitter.com/iamvukasin',
    linkedIn: 'https://linkedin.com/in/vukasin-manojlovic',
    github: 'https://github.com/iamvukasin',
    desc: "Vukašin is one of Tempus' frontend engineers. Before joining Tempus, he was an intern at the Microsoft Mixed Reality & AI Lab team and worked as an iOS developer at a Swiss video-oriented start-up.",
    isBuilder: true,
  },
  {
    name: 'Yuval',
    fullname: 'Yuval Weiss',
    avatar: yuvalImg,
    title: 'Blockchain Engineer',
    linkedIn: 'https://www.linkedin.com/in/yuval-weiss-610b5816a/',
    github: 'https://github.com/yuval-weiss',
    desc: "Yuval is one of Tempus' blockchain engineers. He has over 5 years' experience at both Web3 startups such as Bancor and Web2 software companies like Microsoft.",
    isBuilder: true,
  },
];

export const MARKETING_BDS: Profile[] = [
  {
    name: 'Dhruv',
    fullname: 'Dhruv Bhatia',
    avatar: dhruvImg,
    title: 'Business Development Manager',
    linkedIn: 'https://www.linkedin.com/in/dhruv-bhatia-2719738a',
    desc: "Dhruv manages relationships with Tempus' partners. Before joining Tempus, Dhruv worked as a debt finance lawyer at a major US law firm where he represented private equity sponsors on leveraged acquisitions.",
    isConnector: true,
  },
  {
    name: 'Josh',
    fullname: 'Josh Kelly',
    avatar: joshImg,
    title: 'Business Development Lead',
    twitter: 'https://twitter.com/joshkez95',
    linkedIn: 'https://www.linkedin.com/in/joshuakelly35/',
    desc: 'Josh is in charge of overseeing business development (including partnerships and integrations) at Tempus. Before joining the crypto scene, he previously worked as a financial services regulatory lawyer.',
    isConnector: true,
  },
  {
    name: 'Pujeet',
    fullname: 'Pujeet Manot',
    avatar: pujeetImg,
    title: 'Business Development Manager',
    twitter: 'https://twitter.com/pujeetmanot',
    linkedIn: 'https://www.linkedin.com/in/pujeetmanot/',
    desc: "Pujeet handles Tempus' relationship with its various partners. He is an MSc Economics student at the London School of Economics and is also the Director of London Blockchain Labs.",
    isConnector: true,
  },
  {
    name: 'Tony',
    fullname: 'Tony T',
    avatar: tonyImg,
    title: 'Head of Marketing',
    twitter: 'https://twitter.com/0xToro',
    linkedIn: 'https://www.linkedin.com/in/0xtoro/',
    desc: 'Tony leads our efforts to make Tempus well known in the multiverse. He’s a degen from the 2017 class who’s been working in the marketing teams of financial and blockchain companies for the last decade. Previously, he led communications at Polygon Hermez.',
    isCreator: true,
    isConnector: true,
  },
];

export const OPERATIONS: Profile[] = [
  {
    name: 'Adri',
    fullname: 'Adrienn Orosz',
    avatar: adriImg,
    title: 'Executive Assistant',
    twitter: 'https://twitter.com/oroszadri',
    linkedIn: 'https://www.linkedin.com/in/adriennorosz1227/',
    desc: "Adri is responsible for assisting with the smooth running of Tempus' operational affairs. Before joining Tempus, Adri worked in the FMCG sector at Danone and Mars as an internal and external communications specialist.",
    isConnector: true,
  },
  {
    name: 'Milica',
    fullname: 'Milica Cakić',
    avatar: milicaImg,
    title: 'Office Manager',
    twitter: 'https://twitter.com/MilicaCakic',
    linkedIn: 'https://www.linkedin.com/in/milica-cakic-551745137/',
    desc: "Milica is responsible for the general operation of Tempus' office. Before joining Tempus, Milica worked for the Embassy of Canada in Serbia, where she supported activities related to Protocol, Education, Culture and Trade.",
    isConnector: true,
  },
];
