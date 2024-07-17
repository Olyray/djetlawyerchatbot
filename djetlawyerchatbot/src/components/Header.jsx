
import logo from "../images/djetlawyer logo 1.svg"
import menu from "../images/Menu bar.svg"

export default function Header (){

    
    return(
        <div className="header">
            <img src={menu} className="menu"/>
           <img src={logo} className="logo"/>
        </div>
    )
}