import React, { useState, useEffect } from 'react';
import './App.css';
import GLCanvas from './GLCanvas';
import * as stl from './glview/stl';
import * as giview from './glview/glview';
import * as img from './glview/image';

/*
import * as mesh from './glview/mesh';
import * as pnts from './glview/points';
import { PointNormal, Vec3 } from './glview/vecmath';

function createTetraMesh(): mesh.Mesh<pnts.PointNormals> {
  const points = pnts.createInterleavedPointNormals([
    new PointNormal(new Vec3(0, 0, 0), new Vec3(-1, -1, -1).normalize()),
    new PointNormal(new Vec3(1, 0, 0), new Vec3(1, 0, 0)),
    new PointNormal(new Vec3(0, 1, 0), new Vec3(0, 1, 0)),
    new PointNormal(new Vec3(0, 0, 1), new Vec3(0, 0, 1)),
  ]);
  return new mesh.Mesh(mesh.Facets.tetra(), points);
}
*/

function App() {
  let [scene, setScene] = useState<giview.DrawableSource | undefined>();
  useEffect(() => {
    stl.STLFormat.readURL("react-glviewer/sample.stl").then(setScene);
    //setScene(createTetraMesh());
    //stl.STLFormat.readURL("sample.stl").then(tris => tris.toWireframe()).then(setScene);
  }, []);

  function inputOnChanged(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files != null && files.length >= 1) {
      stl.STLFormat.readFile(files[0]).then(setScene);
    }
  }
  function inputImageOnChanged(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files != null && files.length >= 1) {
      const reader = new FileReader();
      const image = new Image();
      reader.onload = e => {
        if (e.target != null) {
          if (typeof e.target.result === "string") {
            image.src = e.target.result;
          }
        }
      };
      image.onload = e => {
        console.log("image loaded");
        console.log(e);
        setScene(new img.ImageBoard(image));
      };
      reader.readAsDataURL(files[0]);
    }
  }
  return (
    <div className="App">
      <input id="import" type="file" accept=".stl" onChange={inputOnChanged} /><br></br>
      <span>画像</span><input id="importImage" type="file" accept=".jpg" onChange={inputImageOnChanged} /><br></br>
      <GLCanvas useWebGL2={true} scene={scene} renderInterval={10}></GLCanvas>
    </div>
  );
}

export default App;
