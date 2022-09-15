import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import JoinRoom from './onboard/joinroom'
import { ColorContext } from './context/colorcontext'
import Onboard from './onboard/onboard'
import JoinGame from './onboard/joingame'
import ChessGame from './chess/ui/chessgame'
import '../src/assets-global/img/chessLogo.png'


/*
 *  Frontend flow: 
 * 
 * 1. el usuario primero abre esta aplicación en el navegador. 
 * 2. aparece una pantalla que le pide al usuario que envíe a su amigo la URL de su juego para iniciar el juego.
 * 3. el usuario envía a su amigo la URL de su juego
 * 4. el usuario hace clic en el botón 'iniciar' y espera a que el otro jugador se una.
 * 5. Tan pronto como la otra jugadora se une, el juego comienza.
 * 
 * 
 * Other player flow:
 * 1. el usuario recibe el enlace enviado por su amigo
 * 2. el usuario hace clic en el enlace y lo redirige a su juego. Si el 'anfitrión' aún no ha
 * hizo clic en el botón 'iniciar' todavía, el usuario esperará cuando el anfitrión haga clic en el botón de inicio.
 * Si el anfitrión decide irse antes de hacer clic en el botón "iniciar", se notificará al usuario
 * que el anfitrión ha terminado la sesión.
 * 3. Una vez que el host hace clic en el botón de inicio o ya se hizo clic en el botón de inicio
 * antes, ahí es cuando comienza el juego.
 * Onboarding screen =====> Game start. 
 * 
 * Cada vez que un usuario abre nuestro sitio desde la ruta '/', se crea automáticamente una nueva instancia de juego
 * en el back-end. Deberíamos generar el uuid en la interfaz, enviar la solicitud con el uuid
 * como parte del cuerpo de la solicitud. Si algún jugador se va, el otro jugador gana automáticamente. 
 * 
 */


function App() {

  const [didRedirect, setDidRedirect] = React.useState(false)

  const playerDidRedirect = React.useCallback(() => {
    setDidRedirect(true)
  }, [])

  const playerDidNotRedirect = React.useCallback(() => {
    setDidRedirect(false)
  }, [])

  const [userName, setUserName] = React.useState('')

  return (
    <ColorContext.Provider value = {{didRedirect: didRedirect, playerDidRedirect: playerDidRedirect, playerDidNotRedirect: playerDidNotRedirect}}>
      <Router>
        <Switch>
          <Route path = "/" exact>
            <Onboard setUserName = {setUserName}/>
          </Route>
          <Route path = "/game/:gameid" exact>
            {didRedirect ? 
              <React.Fragment>
                    <JoinGame userName = {userName} isCreator = {true} />
                    <ChessGame myUserName = {userName} />
              </React.Fragment> 
              :
              <JoinRoom />}
          </Route>
          <Redirect to = "/" />
        </Switch>
      </Router>
    </ColorContext.Provider>);
}

export default App;
