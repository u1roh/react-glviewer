import React from 'react';
import logo from './logo.svg';
import './App.css';
import GLCanvas from './GLCanvas';
import * as stl from './glview/stl';

function App() {
  const canvas: React.RefObject<GLCanvas> = React.createRef();
  function inputOnChanged(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files != null && files.length >= 1 && canvas.current != null) {
      const view = canvas.current.view;
      stl.STLFormat.readFile(files[0]).then(tris => {
        view?.setScene(tris);
        view?.fit();
        view?.render();
      });
    }
  }
  return (
    <div className="App">
      <input id="import" type="file" accept=".stl" onChange={inputOnChanged} /><br></br>
      <GLCanvas useWebGL2={true} ref={canvas}></GLCanvas>
      <p>Powered by React.<img src={logo} className="App-logo" alt="logo" /></p>
    </div>
  );
}

export default App;
