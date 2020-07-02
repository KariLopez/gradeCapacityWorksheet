import React, {useState} from 'react';
import NavButton from '../components/NavButton.jsx';
import Header from '../components/Header.jsx';
import ReturnHome from '../components/ReturnHome.jsx';
import ExtLink from '../components/ExtLink.jsx';
import Story from '../components/Story.jsx';
import work from '../assets/linkedIn.png';
import code from '../assets/gitHub.png'
import volunteer from '../assets/CFG.JPG';
import panel from '../assets/GRWebDevPanel.jpg';
import momPanel from '../assets/MomTechPanel.png';
import itc from '../assets/SeptemberITC.jpg';
import styles from '../styling/styles.css';


function App(){
    return( <div>
        <div className='Home'>
        <Header/>
        <ExtLink src={work} newWindow='https://www.linkedin.com/in/karina-lopez11/' />
        <ExtLink src={code} newWindow='https://github.com/KariLopez'/ >
        </div>
        <div className='ImageReel'>
            <Story src={itc} caption='Teaching an Intro to Coding Class hosted by Grand Circus'/>
            <Story src={volunteer} caption='Volunteering at Weekend for Good with Citizen Labs Team'/>
            <Story src={panel} caption='Honored to have been part of this great panel with other women working in tech from West Michigan!'/>
            <Story src={momPanel} caption='I was so excited to be a part of this panel in collaboration with The Hive, such a cool co-working space concept'/>
            </div>
            <div className='quoteBlock'><div className='apiQuote'><p className='quote'>Quote Here</p><p className='author'>Author</p></div></div>
        <div className="NavBar">
            <NavButton label="Download Resume" Navigation="https://drive.google.com/u/0/uc?id=1Ts3_3VFz0pn8XzAHk7eI5u2VLX9-FHYq&export=download"/>    
</div>
<ReturnHome/>
        </div>)
       
    
}

export default App;

