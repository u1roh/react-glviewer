
import React from 'react';
import './App.css';
import * as glview from './glview/glview';
import { STLFormat } from './glview/stl';


interface GLCanvasProps {
    useWebGL2: boolean
}

class GLCanvas extends React.PureComponent<GLCanvasProps> {
    glview: glview.GLView | null = null;
    canvas: React.RefObject<HTMLCanvasElement>;
    constructor(props: GLCanvasProps) {
        super(props);
        this.canvas = React.createRef();
    }
    public componentDidMount() {
        console.log("GLCanvas.componentDidMount()");
        if (this.canvas.current != null) {
            this.glview = new glview.GLView(this.canvas.current, this.props.useWebGL2);
            STLFormat.readURL("sample.stl").then(tris => {
                this.glview?.setScene(tris);
                this.glview?.fit();
                this.glview?.render();
            })
            this.glview.render();
        }
    }
    public render() {
        return (
            <div>
                <p>GLCanvas</p>
                <canvas ref={this.canvas} width="600" height="400" >WebGL 2.0 must be supported.</canvas>
            </div>
        );
    }
}

export default GLCanvas;
