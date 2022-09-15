import React from 'react'
import { useParams } from 'react-router-dom'
import "../assets-global/chess.css";

const socket  = require('../connection/socket').socket

/**
 * 'Join game' is where we actually join the game room. 
 */


const JoinGameRoom = (gameid, userName, isCreator) => {
    /**
     * For this browser instance, we want 
     * to join it to a gameRoom. For now
     * assume that the game room exists 
     * on the backend. 
     *  
     * 
     * TODO: handle the case when the game room doesn't exist. 
     */
    const idData = {
        gameId : gameid,
        userName : userName,
        isCreator: isCreator
    }
    socket.emit("playerJoinGame", idData)
}
  
  
const JoinGame = (props) => {
    /**
     * Extract the 'gameId' from the URL. 
     * the 'gameId' is the gameRoom ID. 
     * 
     * <h3 style = {{textAlign: "center", marginTop: "2em"}}><a href = '' target = '_blank'>Aprende a jugar</a><a href = '' target = '_blank'>Torneos</a><a href = '.' target = '_blank'>.</a>.</h3>
    
     */
    const { gameid } = useParams()
    JoinGameRoom(gameid, props.userName, props.isCreator)
    return <div className=''>
        
        
        
        
        
        <div style={{width: "100%", height: "50%", padding: "30px", textAlign: "center"}}>
            <h1 style = {{textAlign: "center", color: "#e6ecf5"}}>Bienvenido</h1>
            <img style={{width: "180px"}} src="../chessLogo.png" alt="Logo"/>
            <br></br>
            <br></br>
            <button className="btn btn-outline-primary" style = {{margin: "3px"}}>Aprender</button>
            <button className="btn btn-outline-primary" style = {{margin: "3px"}}>Torneos</button>
        </div> 
    </div>
}

export default JoinGame
  
