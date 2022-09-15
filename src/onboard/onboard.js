import React from 'react'
import { Redirect } from 'react-router-dom'
import uuid from 'uuid/v4'
import { ColorContext } from '../context/colorcontext' 
import "../assets-global/chess.css";

const socket  = require('../connection/socket').socket

/**
 * Onboard is where we create the game room.
 */

class CreateNewGame extends React.Component {
    state = {
        didGetUserName: false,
        inputText: "",
        gameId: ""
    }

    constructor(props) {
        super(props);
        this.textArea = React.createRef();
    }
    
    send = () => {
        /**
         * Este método debería crear una nueva sala en el espacio de nombres '/'
         * con un identificador único. 
         */
        const newGameRoomId = uuid()

        // establecer el estado de este componente con el gameId para que podamos
        // Redirige a la usuario a esa URL más tarde. 
        this.setState({
            gameId: newGameRoomId
        })

        // emitir un evento al servidor para crear una nueva sala 
        socket.emit('createNewGame', newGameRoomId)
    }

    typingUserName = () => {
        // toma el texto de entrada del campo del DOM 
        const typedText = this.textArea.current.value
        
        // establecer el estado con ese texto
        this.setState({
            inputText: typedText
        })
    }

    render() {
        // !!! TODO: editar esto más tarde una vez que haya comprado su propio dominio.. 
 
        return (<React.Fragment>
            {
                this.state.didGetUserName ? 

                <Redirect to = {"/game/" + this.state.gameId}><button className="btn btn-success" style = {{marginLeft: String((window.innerWidth / 2) - 60) + "px", width: "120px"}}>Comenzar juego</button></Redirect>

            :
               <div className='heading-title'>
                    <img style={{width: "240px", marginTop: "62px", marginLeft: String((window.innerWidth / 2) - 120) + "px"  }} src="../chessLogo.png" alt="Logo"/>
                    <h1 style={{textAlign: "center", marginTop: "3em", fontSize: "14pt"}}>Retador:</h1>
                    <input style={{marginLeft: String((window.innerWidth / 2) - 120) + "px", width: "240px", marginTop: "62px"}} 
                           ref = {this.textArea}
                           onInput = {this.typingUserName}></input>
                           
                    <button className="btn btn-outline-primary" 
                        style = {{marginLeft: String((window.innerWidth / 2) - 60) + "px", width: "120px", marginTop: "62px"}} 
                        disabled = {!(this.state.inputText.length > 0)} 
                        onClick = {() => {
                            // Cuando se presiona el botón 'Enviar' desde la pantalla de nombre de usuario
                            // Deberíamos enviar una solicitud al servidor para crear una nueva sala con
                            // La uuid que generamos aquí.
                            this.props.didRedirect() 
                            this.props.setUserName(this.state.inputText) 
                            this.setState({
                                didGetUserName: true
                            })
                            this.send()
                        }}>Crear Sala</button>
                        
                </div>
            }
            </React.Fragment>)
    }
}

const Onboard = (props) => {
    const color = React.useContext(ColorContext)

    return <CreateNewGame didRedirect = {color.playerDidRedirect} setUserName = {props.setUserName}/>
}


export default Onboard