import React from 'react'
import Game from '../model/chess'
import Square from '../model/square'
import { Stage, Layer } from 'react-konva';
import Board from '../assets/chessBoard.png'
import useSound from 'use-sound'
import chessMove from '../assets/moveSoundEffect.mp3'
import Piece from './piece'
import piecemap from './piecemap'
import { useParams } from 'react-router-dom'
import { ColorContext } from '../../context/colorcontext'
//import VideoChatApp from '../../connection/videochat'

const socket = require('../../connection/socket').socket


class ChessGame extends React.Component {

    state = {
        gameState: new Game(this.props.color),
        draggedPieceTargetId: "", //cadena vacía significa que no se está arrastrando ninguna pieza
        playerTurnToMoveIsWhite: true,
        whiteKingInCheck: false,
        blackKingInCheck: false
    }


    componentDidMount() {
        console.log(this.props.myUserName)
        console.log(this.props.opponentUserName)
        // registrar oyentes de eventos
        socket.on('opponent move', move => {
            // move == [pieceId, finalPosition]
            // console.log("opponenet's move: " + move.selectedId + ", " + move.finalPosition)
            if (move.playerColorThatJustMovedIsWhite !== this.props.color) {
                this.movePiece(move.selectedId, move.finalPosition, this.state.gameState, false)
                this.setState({
                    playerTurnToMoveIsWhite: !move.playerColorThatJustMovedIsWhite
                })
            }
        })
    }

    startDragging = (e) => {
        this.setState({
            draggedPieceTargetId: e.target.attrs.id
        })
    }


    movePiece = (selectedId, finalPosition, currentGame, isMyMove) => {
        /**
         * "actualización" es la conexión entre el modelo y la interfaz de usuario 
         * This could also be an HTTP request and the "update" could be the server response.
         * (model is hosted on the server instead of the browser)
         */
        var whiteKingInCheck = false
        var blackKingInCheck = false
        var blackCheckmated = false
        var whiteCheckmated = false
        const update = currentGame.movePiece(selectedId, finalPosition, isMyMove)

        if (update === "moved in the same position.") {
            this.revertToPreviousState(selectedId) // pase la identificación seleccionada para identificar la pieza que se estropeó
            return
        } else if (update === "user tried to capture their own piece") {
            this.revertToPreviousState(selectedId)
            return
        } else if (update === "b is in check" || update === "w is in check") {
            // cambia el relleno del rey enemigo o de tu rey según el lado que esté en jaque. 
            // reproducir un sonido o algo
            if (update[0] === "b") {
                blackKingInCheck = true
            } else {
                whiteKingInCheck = true
            }
        } else if (update === "b has been checkmated" || update === "w has been checkmated") {
            if (update[0] === "b") {
                blackCheckmated = true
            } else {
                whiteCheckmated = true
            }
        } else if (update === "invalid move") {
            this.revertToPreviousState(selectedId)
            return
        }

        // deja que el servidor y el otro cliente sepan tu movimiento
        if (isMyMove) {
            socket.emit('new move', {
                nextPlayerColorToMove: !this.state.gameState.thisPlayersColorIsWhite,
                playerColorThatJustMovedIsWhite: this.state.gameState.thisPlayersColorIsWhite,
                selectedId: selectedId,
                finalPosition: finalPosition,
                gameId: this.props.gameId
            })
        }


        this.props.playAudio()

        // establece el nuevo estado del juego. 
        this.setState({
            draggedPieceTargetId: "",
            gameState: currentGame,
            playerTurnToMoveIsWhite: !this.props.color,
            whiteKingInCheck: whiteKingInCheck,
            blackKingInCheck: blackKingInCheck
        })

        if (blackCheckmated) {
            alert("WHITE WON BY CHECKMATE!")
        } else if (whiteCheckmated) {
            alert("BLACK WON BY CHECKMATE!")
        }
    }


    endDragging = (e) => {
        const currentGame = this.state.gameState
        const currentBoard = currentGame.getBoard()
        const finalPosition = this.inferCoord(e.target.x() + 80, e.target.y() + 80, currentBoard)
        const selectedId = this.state.draggedPieceTargetId
        this.movePiece(selectedId, finalPosition, currentGame, true)
    }

    revertToPreviousState = (selectedId) => {
        /**
         * Should update the UI to what the board looked like before. 
         */
        const oldGS = this.state.gameState
        const oldBoard = oldGS.getBoard()
        const tmpGS = new Game(true)
        const tmpBoard = []

        for (var i = 0; i < 8; i++) {
            tmpBoard.push([])
            for (var j = 0; j < 8; j++) {
                if (oldBoard[i][j].getPieceIdOnThisSquare() === selectedId) {
                    tmpBoard[i].push(new Square(j, i, null, oldBoard[i][j].canvasCoord))
                } else {
                    tmpBoard[i].push(oldBoard[i][j])
                }
            }
        }

        // temporarily remove the piece that was just moved
        tmpGS.setBoard(tmpBoard)

        this.setState({
            gameState: tmpGS,
            draggedPieceTargetId: "",
        })

        this.setState({
            gameState: oldGS,
        })
    }


    inferCoord = (x, y, chessBoard) => {
        // console.log("actual mouse coordinates: " + x + ", " + y)
        /*
            Should give the closest estimate for new position. 
        */
        var hashmap = {}
        var shortestDistance = Infinity
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                const canvasCoord = chessBoard[i][j].getCanvasCoord()
                // calculate distance
                const delta_x = canvasCoord[0] - x
                const delta_y = canvasCoord[1] - y
                const newDistance = Math.sqrt(delta_x ** 2 + delta_y ** 2)
                hashmap[newDistance] = canvasCoord
                if (newDistance < shortestDistance) {
                    shortestDistance = newDistance
                }
            }
        }

        return hashmap[shortestDistance]
    }

    render() {
        // console.log(this.state.gameState.getBoard())
        //  console.log("it's white's move this time: " + this.state.playerTurnToMoveIsWhite)
        /*
            Look at the current game state in the model and populate the UI accordingly
        */
        // console.log(this.state.gameState.getBoard())

        return (
            <React.Fragment>
    
                <div style={{ backgroundImage: `url(${Board})`, width: "727px", height: "727px",}}
            
              

                >
                    <Stage width={727} height={727}>
                        <Layer>
                            {this.state.gameState.getBoard().map((row) => {
                                return (<React.Fragment>
                                    {row.map((square) => {
                                        if (square.isOccupied()) {
                                            return (
                                                <Piece
                                                    x={square.getCanvasCoord()[0]}
                                                    y={square.getCanvasCoord()[1]}
                                                    imgurls={piecemap[square.getPiece().name]}
                                                    isWhite={square.getPiece().color === "white"}
                                                    draggedPieceTargetId={this.state.draggedPieceTargetId}
                                                    onDragStart={this.startDragging}
                                                    onDragEnd={this.endDragging}
                                                    id={square.getPieceIdOnThisSquare()}
                                                    thisPlayersColorIsWhite={this.props.color}
                                                    playerTurnToMoveIsWhite={this.state.playerTurnToMoveIsWhite}
                                                    whiteKingInCheck={this.state.whiteKingInCheck}
                                                    blackKingInCheck={this.state.blackKingInCheck}
                                                />)
                                        }
                                        return
                                    })}
                                </React.Fragment>)
                            })}
                        </Layer>
                    </Stage>
                </div>
            </React.Fragment>)
    }
}



const ChessGameWrapper = (props) => {
    /**
     * player 1
     *      - socketId 1
     *      - socketId 2 ???
     * player 2
     *      - socketId 2
     *      - socketId 1
     */



    // obtenga el gameId de la URL aquí y páselo al componente chessGame como accesorio. 
    const domainName = 'http://3.129.209.52:3000'
    const color = React.useContext(ColorContext)
    const { gameid } = useParams()
    const [play] = useSound(chessMove);
    const [opponentSocketId, setOpponentSocketId] = React.useState('')
    const [opponentDidJoinTheGame, didJoinGame] = React.useState(false)
    const [opponentUserName, setUserName] = React.useState('')
    const [gameSessionDoesNotExist, doesntExist] = React.useState(false)

    React.useEffect(() => {
        socket.on("playerJoinedRoom", statusUpdate => {
            console.log("A new player has joined the room! Username: " + statusUpdate.userName + ", Game id: " + statusUpdate.gameId + " Socket id: " + statusUpdate.mySocketId)
            if (socket.id !== statusUpdate.mySocketId) {
                setOpponentSocketId(statusUpdate.mySocketId)
            }
        })

        socket.on("status", statusUpdate => {
            console.log(statusUpdate)
            alert(statusUpdate)
            if (statusUpdate === 'This game session does not exist.' || statusUpdate === 'There are already 2 people playing in this room.') {
                doesntExist(true)
            }
        })


        socket.on('start game', (opponentUserName) => {
            console.log("START!")
            if (opponentUserName !== props.myUserName) {
                setUserName(opponentUserName)
                didJoinGame(true)
            } else {
                // in chessGame, pass opponentUserName as a prop and label it as the enemy. 
                // in chessGame, use reactContext to get your own userName
                // socket.emit('myUserName')
                socket.emit('request username', gameid)
            }
        })


        socket.on('give userName', (socketId) => {
            if (socket.id !== socketId) {
                console.log("give userName stage: " + props.myUserName)
                socket.emit('recieved userName', { userName: props.myUserName, gameId: gameid })
            }
        })

        socket.on('get Opponent UserName', (data) => {
            if (socket.id !== data.socketId) {
                setUserName(data.userName)
                console.log('data.socketId: data.socketId')
                setOpponentSocketId(data.socketId)
                didJoinGame(true)
            }
        })
    }, [])


    return (
        <React.Fragment>
            {opponentDidJoinTheGame ? (
                <div>
                    <h4> Oponente: {opponentUserName} </h4><h4> Tu: {props.myUserName} </h4>
                    <div style={{display: "flex"}}>
                        <ChessGame
                            playAudio={play}
                            gameId={gameid}
                            color={color.didRedirect}
                        />
                        { 
                            // <VideoChatApp
                            //     mySocketId={socket.id}
                            //     opponentSocketId={opponentSocketId}
                            //     myUserName={props.myUserName}
                            //     opponentUserName={opponentUserName}
                            // /> 
                        }
                    </div>
                    
                </div>
            ) : gameSessionDoesNotExist ? (
                <div>
                    <h1 style={{ textAlign: "center", marginTop: "200px" }}> No existe esta sala sorry</h1>
                </div>
            ) : (
                <div className='heading-text.small'>
                    <h1 style={{ textAlign: "center", fontSize: "14pt" }}
                    >Hola <strong>{props.myUserName}</strong> Envia este enlace a un amigo para que se una a tu partida:
                    </h1>
                    <textarea
                        style={{ marginLeft: String((window.innerWidth / 2) - 290) + "px", width: "540px", height: "30px" }}
                        onFocus={(event) => {
                            console.log('sd')
                            event.target.select()
                        }}
                        value={domainName + "/game/" + gameid}
                        type="text">
                    </textarea>
                    <br></br>

                    <h1 style={{ textAlign: "center", marginTop: "1em" }}>
                        {" "}
                        Esperando a tu amigo...{" "}
                    </h1>
                </div>
            )}
        </React.Fragment>
    );
};

export default ChessGameWrapper
