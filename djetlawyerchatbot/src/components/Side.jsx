import sb from '../images/Bot (1).svg'
import create from '../images/Create.svg'
import trash from '../images/Trash Can.svg'
import bot from '../images/Bot.svg'
import Send from '../images/Send Letter.svg'
import question from '../images/Ask Question.svg'
import { useState } from 'react'


export default function Side (){

    const [historys, setHistorys] = useState([
        {id:1, text: 'Tell me about legal law', details: 'Legal law is a set of rules that sjsas ds ds ds d' },
        {id:2, text: 'Advantages of being a lawyer', details: 'Legal law is a set of rules that sjsas ds ds ds d'}
    ])

    const [inputValue, setInputValue] = useState('');


  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const newHistory = {
        id: historys.length + 1, 
        text: inputValue,
        details: '' 
      };
      setHistorys([...historys, newHistory]);
      setInputValue(''); 
    }
  };


  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

    function handleDelete(id){
        setHistorys(historys.filter(history => history.id !== id))
    }

    return(
        <div className='main'>
            <div className='side'>
                <div className='bar'>
                    <img src={bot}/>
                    <p>New Chat</p>
                    <img src={create} className='trash'/>
                </div>
                {historys.map(history => (
                        <div key={history.id} className='bar'>        
                    <p>{history.text}<br /> <small>{history.details}</small></p>
                    <img src={trash} className='trash' onClick={() => handleDelete(history.id)}/>
                </div>
                    ))
                }   
            </div>
            <div className='middle'>
                <div className='main1'>
                    <img src={sb}/>
                    <h3>How may I help you today?</h3>
                </div>
                <div className='question'>
                    <p>Explain Statutory Rape   <br /> <small>Like I’m a five year old</small></p>
                    <p>What is Cyber law  <br /> <small>Detailed Explanation</small></p>
                    <p>Write a short note on Health law <br /> <small>Not more than 300 words</small></p>
                    <p>What is Business law<br /> <small>Elaborate more on Antitrust law </small></p>
                </div>
                <form onSubmit={handleFormSubmit}>
                    <div className='ask'>
                    <input 
                    type='text'
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder='Ask a question'/>
                    <button type='submit'>
                    <img src={Send}/>
                    </button>
                    </div>
                </form>
            </div>    
            <img src={question} className='qMark'/>
        </div>
       
    )
}