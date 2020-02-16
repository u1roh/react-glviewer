
import React from 'react';
import './App.css';
import * as glview from './glview/glview';
import { STLFormat } from './glview/stl';


interface GLCanvasProps {
    useWebGL2: boolean
}

class GLCanvas extends React.PureComponent<GLCanvasProps> {
    view: glview.GLView | null = null;
    private canvas: React.RefObject<HTMLCanvasElement>;
    constructor(props: GLCanvasProps) {
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

export default GLCanvas;
