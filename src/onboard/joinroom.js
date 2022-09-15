import React from 'react'
import JoinGame from './joingame'
import ChessGame from '../chess/ui/chessgame'
import "../assets-global/chess.css";

/**
 * Onboard is where we create the game room.
 */

class JoinRoom extends React.Component {
    state = {
        didGetUserName: false,
        inputText: ""
    }

    constructor(props) {
        super(props);
        this.textArea = React.createRef();
    }

    typingUserName = () => {
        // grab the input text from the field from the DOM 
        const typedText = this.textArea.current.value
        
        // set the state with that text
        this.setState({
            inputText: typedText
        })
    }

    render() {
    
        return (<React.Fragment>
            {
                this.state.didGetUserName ? 
                <React.Fragment>
                    <JoinGame userName = {this.state.inputText} isCreator = {false}/>
                    <ChessGame myUserName = {this.state.inputText}/>
                </React.Fragment>
            :
               <div>
                    <img style={{width: "240px", marginTop: "62px", marginLeft: String((window.innerWidth / 2) - 120) + "px"  }} src="../chessLogo.png" alt="Logo"/>
                    <h1 style={{textAlign: "center", marginTop: "3em", fontSize: "14pt"}}>Nombre de rival:</h1>

                    <input style={{marginLeft: String((window.innerWidth / 2) - 120) + "px", width: "240px", marginTop: "62px"}} 
                           ref = {this.textArea}
                           onInput = {this.typingUserName}></input>
                           
                    <button className="btn btn-primary" 
                        style = {{marginLeft: String((window.innerWidth / 2) - 60) + "px", width: "120px", marginTop: "62px"}} 
                        disabled = {!(this.state.inputText.length > 0)} 
                        onClick = {() => {
                            // Cuando se presiona el botón 'Enviar' desde la pantalla de nombre de usuario,
                            // Deberíamos enviar una solicitud al servidor para crear una nueva sala con
                            // La uuid que generamos aquí.
                            this.setState({
                                didGetUserName: true
                            })
                        }}>Entrar a la sala</button>
                </div>
            }
            </React.Fragment>)
    }
}

export default JoinRoom