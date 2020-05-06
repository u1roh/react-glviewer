import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import * as glc from './GLCanvas';
import * as stl from './glview/stl';
import * as giview from './glview/glview';

/*
function App() {
  const canvas: React.RefObject<glc.GLCanvas> = React.createRef();
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
      <glc.GLCanvas useWebGL2={true} ref={canvas}></glc.GLCanvas>
      <p>Powered by React.<img src={logo} className="App-logo" alt="logo" /></p>
    </div>
  );
}
*/

//*
function App() {
  let [scene, setScene] = useState<giview.DrawableSource | null>(null);
  useEffect(() => {
    //stl.STLFormat.readURL("sample.stl").then(setScene);
    stl.STLFormat.readURL("sample.stl").then(tris => tris.toWireframe()).then(setScene);
  }, []);

  function inputOnChanged(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files != null && files.length >= 1) {
      stl.STLFormat.readFile(files[0]).then(setScene);
    }
  }
  return (
    <div className="App">
      <input id="import" type="file" accept=".stl" onChange={inputOnChanged} /><br></br>
      <glc.GLCanvas2 useWebGL2={true} scene={scene}></glc.GLCanvas2>
      <p>Powered by React.<img src={logo} className="App-logo" alt="logo" /></p>
    </div>
  );
}
//*/

export default App;
