import sb from '../images/Bot (1).svg'
import create from '../images/Create.svg'
import trash from '../images/Trash Can.svg'
import bot from '../images/Bot.svg'
import Send from '../images/Send Letter.svg'
import question from '../images/Ask Question.svg'


export default function Side (){
    return(
        <div className='main'>
            <div className='side'>
                <div className='bar'>
                    <img src={bot}/>
                    <p>New Chat</p>
                    <img src={create} className='trash'/>
                </div>
                <div className='bar'>        
                    <p>Tell me about legal law <br /> <small>Legal law is a set of rules that sjsas ds ds ds d</small></p>
                    <img src={trash} className='trash'/>
                </div>
                <div className='bar'>
                    <p>Advantages of being  a lawyer <br /> <small>Legal law is a set of rules that sjsas ds ds ds d</small></p>
                    <img src={trash} className='trash'/>
                </div>
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
                <div className='ask'>
                <p>Explain company law</p>
                <img src={Send}/>
                </div>
            </div>    
            <img src={question} className='qMark'/>
        </div>
       
    )
}