import sb from '../images/Bot (1).png'
import create from '../images/Create.png'
import trash from '../images/Trash Can.png'
import bot from '../images/Bot.png'
import Send from '../images/Send Letter.png'
import question from '../images/Ask Question.png'


export default function Side (){
    return(
        <div className='main'>
            <div className='side'>
                <div className='bar'>
                    <img src={sb}/>
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
                    <img src={bot}/>
                    <h3>How may I help you today?</h3>
                </div>
                <div className='question'>
                    <p>Tell me about legal law <br /> <small>Legal law is a set of rules that sjsas ds ds ds d</small></p>
                    <p>Tell me about legal law <br /> <small>Legal law is a set of rules that sjsas ds ds ds d</small></p>
                    <p>Tell me about legal law <br /> <small>Legal law is a set of rules that sjsas ds ds ds d</small></p>
                    <p>Tell me about legal law <br /> <small>Legal law is a set of rules that sjsas ds ds ds d</small></p>
                </div>
                <div className='ask'>
                <p>Tell me about legal law <br /> <small>Legal law is a set of rules that sjsas ds ds ds d</small></p>
                <img src={Send}/>
                </div>
            </div>    
            <img src={question} className='qMark'/>
        </div>
       
    )
}