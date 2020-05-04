
import React, { useEffect, useRef } from 'react';
import './App.css';
import * as glview from './glview/glview';
import { STLFormat } from './glview/stl';


export class GLCanvas extends React.PureComponent<{ useWebGL2: boolean }> {
    view: glview.GLView | null = null;
    private canvas: React.RefObject<HTMLCanvasElement>;
    constructor(props: { useWebGL2: boolean }) {
        super(props);
        this.canvas = React.createRef();
    }
    public componentDidMount() {
        if (this.canvas.current != null) {
            this.view = new glview.GLView(this.canvas.current, this.props.useWebGL2);
            STLFormat.readURL("sample.stl").then(tris => {
                this.view?.setScene(tris);
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
    useEffect(() => {
        if (canvas.current != null) {
            view.current = new glview.GLView(canvas.current, props.useWebGL2);
        }
    }, [canvas, props.useWebGL2]);
    useEffect(() => {
        if (view.current != null && props.scene != null) {
            view.current.setScene(props.scene);
            view.current.fit();
            view.current.render();
        }
    }, [props.scene]);
    return (
        <div>
            <canvas ref={canvas} width="600" height="400" >WebGL 2.0 must be supported.</canvas>
        </div>
    );
}
