import React from "react"
import Header from "./components/Header"
import Side from "./components/Side"

export default function App (){

    const [history, sethistory] = React.useState([])

    React.useEffect(() => {

    }, )

    return(
        <div>
            <Header />
            <Side />
        </div>
    )
}