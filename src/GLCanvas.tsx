
import React, { useEffect, useRef } from 'react';
import './App.css';
import * as glview from './glview/glview';
import { STLFormat } from './glview/stl';


export class GLCanvas extends React.PureComponent<{ useWebGL2: boolean }> {
    view?: glview.GLView;
    private canvas: React.RefObject<HTMLCanvasElement>;
    private sceneGraph = new glview.SceneGraph();
    constructor(props: { useWebGL2: boolean }) {
        super(props);
        this.canvas = React.createRef();
    }
    public componentDidMount() {
        if (this.canvas.current) {
            this.view = new glview.GLView(this.canvas.current, this.sceneGraph, this.props.useWebGL2);
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

export function GLCanvas2(props: { useWebGL2: boolean, scene?: glview.DrawableSource, renderInterval?: number }) {
    let view = useRef<glview.GLView | undefined>();
    const canvas = useRef<HTMLCanvasElement>(null);
    const sceneGraph = useRef(new glview.SceneGraph());
    useEffect(() => {
        if (props.scene) {
            sceneGraph.current.addNode(props.scene);
        }
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
