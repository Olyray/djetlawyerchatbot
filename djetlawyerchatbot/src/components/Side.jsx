import sb from '../images/Bot (1).png'
import create from '../images/Create.png'
import trash from '../images/Trash Can.png'

export default function Side (){
    return(
        <div className='side'>
            <div className='bar'>
            <img src={sb}/>
            <p>New Chat</p>
            <img src={create} className='trash'/>
            </div>
            <div className='bar'>
            <img src={sb}/>
            <p>New Chat</p>
            <img src={trash} className='trash'/>
            </div>
            <div className='bar'>
            <img src={sb}/>
            <p>New Chat</p>
            <img src={trash} className='trash'/>
            </div>
        </div>
    )
}