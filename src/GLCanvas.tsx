
import React, { useEffect, useRef } from 'react';
import './App.css';
import * as glview from './glview/glview';


export default function GLCanvas(props: { useWebGL2: boolean, scene?: glview.DrawableSource, renderInterval?: number }) {
    let view = useRef<glview.GLView | undefined>();
    const canvas = useRef<HTMLCanvasElement>(null);
    const sceneGraph = useRef(new glview.SceneGraph());
    useEffect(() => {
        if (canvas.current) {
            view.current = new glview.GLView(canvas.current, sceneGraph.current, props.useWebGL2, props.renderInterval);
        }
    }, [canvas, props.useWebGL2, props.renderInterval]);
    useEffect(() => {
        if (view.current && props.scene) {
            sceneGraph.current.clearNodes();
            sceneGraph.current.addNode(props.scene);
            view.current.fit();
            view.current.render();
        }
    }, [props.scene]);
    return (
        <canvas ref={canvas} width="800" height="600" style={{ borderStyle: "solid" }}>WebGL 2.0 must be supported.</canvas>
    );
}
