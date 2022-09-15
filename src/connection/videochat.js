import React, { useEffect, useState, useRef } from 'react';
import Peer from "simple-peer";
import styled from "styled-components";
const socket  = require('../connection/socket').socket


const Container = styled.div`
  height: 100vh;
  width: 100%;
  flex-direction: column;
`;

const Row = styled.div`
  width: 100%;
`;

const Video = styled.video`
  border: 1px solid blue;
`;

function VideoChatApp(props) {
  /**
   * estado inicial: ambos jugadores son neutrales y tienen la opción de llamarse entre sí
   * 
   * El jugador 1 llama al jugador 2: El jugador 1 debe mostrar: 'Llamando a {nombre de usuario del jugador 2}', y el
   *                          El botón 'CallPeer' debería desaparecer para el jugador 1.
   *                          El jugador 2 debería mostrar '{nombre de usuario del jugador 1} te está llamando' y
   *                          el botón 'CallPeer' para el jugador 2 también debería desaparecer. 
   * 
   * Caso 1: el jugador 2 acepta la llamada: comienza el chat de video y no hay un botón para finalizarlo.
   * 
   * Caso 2: el jugador 2 ignora la llamada del jugador 1 - no pasa nada. Espere hasta que se agote el tiempo de conexión. 
   * 
   */

  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [isCalling, setIsCalling] = useState(false)
  const userVideo = useRef();
  const partnerVideo = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      setStream(stream);
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    })

    socket.on("hey", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
    })
  }, []);

  function callPeer(id) {
    setIsCalling(true)
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", data => {
      socket.emit("callUser", { userToCall: id, signalData: data, from: props.mySocketId})
    })

    peer.on("stream", stream => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = stream;
      }
    });

    socket.on("callAccepted", signal => {
      setCallAccepted(true);
      peer.signal(signal);
    })

  }

  function acceptCall() {
    setCallAccepted(true);
    setIsCalling(false)
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", data => {
      socket.emit("acceptCall", { signal: data, to: caller })
    })

    peer.on("stream", stream => {
      partnerVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
  }

  let UserVideo;
  if (stream) {
    UserVideo = (
      <Video playsInline muted ref={userVideo} autoPlay style = {{width: "50%", height: "50%", marginTop: "50px"}} />
    );
  }

  let mainView;

  if (callAccepted) {
    mainView = (
      <Video playsInline ref={partnerVideo} autoPlay style = {{width: "50%", height: "50%"}} />
    );
  } else if (receivingCall) {
    mainView = (
      <div>
        <h1>{props.opponentUserName} te está llamando</h1>
        <button className='button' onClick={acceptCall}><h1>Aceptar</h1></button>
      </div>
    )
  } else if (isCalling) {
    mainView = (
      <div>
        <h1>Llamando actualmente{props.opponentUserName}...</h1>
      </div>
    )
  } else {
    mainView = (<button className='button' onClick = {() => {callPeer(props.opponentSocketId)}}><h1>¡Videollamada</h1></button>)
  }



  return (<Container>
      <Row>
        {mainView}
        {UserVideo}
      </Row>
    </Container>);
}

export default VideoChatApp;
