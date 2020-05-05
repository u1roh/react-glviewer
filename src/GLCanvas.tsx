
import React, { useEffect, useRef } from 'react';
import './App.css';
import * as glview from './glview/glview';
import { STLFormat } from './glview/stl';


export class GLCanvas extends React.PureComponent<{ useWebGL2: boolean }> {
    view: glview.GLView | null = null;
    private canvas: React.RefObject<HTMLCanvasElement>;
    private sceneGraph = new glview.SceneGraph();
    constructor(props: { useWebGL2: boolean }) {
        super(props);
        this.canvas = React.createRef();
    }
    public componentDidMount() {
        if (this.canvas.current != null) {
            this.view = new glview.GLView(this.canvas.current, this.props.useWebGL2, this.sceneGraph);
            STLFormat.readURL("sample.stl").then(tris => {
                this.sceneGraph.addNode(tris);
                this.view?.fit();
                this.view?.render();
            })
            this.view.render();
        }
    }
    public render() {
        return (
            <div>
                <canvas ref={this.canvas} width="600" height="400" >WebGL 2.0 must be supported.</canvas>
            </div>
        );
    }
}

export function GLCanvas2(props: { useWebGL2: boolean, scene: glview.DrawableSource | null }) {
    let view = useRef<glview.GLView | null>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    const sceneGraph = useRef(new glview.SceneGraph());
    useEffect(() => {
        if (props.scene !== null) {
            sceneGraph.current.addNode(props.scene);
        }
        if (canvas.current != null) {
            view.current = new glview.GLView(canvas.current, props.useWebGL2, sceneGraph.current);
        }
    }, [canvas, props.useWebGL2]);
    useEffect(() => {
        if (view.current != null && props.scene != null) {
            sceneGraph.current.addNode(props.scene);
            view.current.fit();
            view.current.render();
        }
    }, [props.scene]);
    return (
        <canvas ref={canvas} width="600" height="400" style={{ borderStyle: "solid" }}>WebGL 2.0 must be supported.</canvas>
    );
}
