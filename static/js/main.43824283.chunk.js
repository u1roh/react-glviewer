(this["webpackJsonpreact-glviewer"]=this["webpackJsonpreact-glviewer"]||[]).push([[0],{10:function(t,e,n){},13:function(t,e,n){t.exports=n(20)},18:function(t,e,n){},20:function(t,e,n){"use strict";n.r(e);var i=n(2),r=n.n(i),o=n(11),s=n.n(o),a=(n(18),n(6)),u=(n(10),n(0)),c=n(1),h=n(4),l=n(3),f=n(5),d=function(){function t(e,n){Object(u.a)(this,t),this.x=void 0,this.y=void 0,this.x=e,this.y=n}return Object(c.a)(t,[{key:"to3d",value:function(){return new v(this.x,this.y,0)}},{key:"clone",value:function(){return new t(this.x,this.y)}},{key:"lengthSquared",value:function(){return this.x*this.x+this.y*this.y}},{key:"length",value:function(){return Math.sqrt(this.lengthSquared())}},{key:"neg",value:function(){return new t(-this.x,-this.y)}},{key:"add",value:function(e){return new t(this.x+e.x,this.y+e.y)}},{key:"sub",value:function(e){return new t(this.x-e.x,this.y-e.y)}},{key:"mul",value:function(e){return new t(e*this.x,e*this.y)}}]),t}();d.ZERO=new d(0,0),d.EX=new d(1,0),d.EY=new d(0,1);var v=function(){function t(e,n,i){Object(u.a)(this,t),this.x=void 0,this.y=void 0,this.z=void 0,this.x=e,this.y=n,this.z=i}return Object(c.a)(t,[{key:"clone",value:function(){return new t(this.x,this.y,this.z)}},{key:"lengthSquared",value:function(){return this.x*this.x+this.y*this.y+this.z*this.z}},{key:"length",value:function(){return Math.sqrt(this.lengthSquared())}},{key:"neg",value:function(){return new t(-this.x,-this.y,-this.z)}},{key:"add",value:function(e){return new t(this.x+e.x,this.y+e.y,this.z+e.z)}},{key:"sub",value:function(e){return new t(this.x-e.x,this.y-e.y,this.z-e.z)}},{key:"mul",value:function(e){return new t(e*this.x,e*this.y,e*this.z)}},{key:"cross",value:function(e){return new t(this.y*e.z-this.z*e.y,this.z*e.x-this.x*e.z,this.x*e.y-this.y*e.x)}}]),t}();v.ZERO=new v(0,0,0),v.EX=new v(1,0,0),v.EY=new v(0,1,0),v.EZ=new v(0,0,1);var m=function(){function t(e){if(Object(u.a)(this,t),this.a=void 0,16!==e.length)throw new Error("Matrix4: a.length != 16");this.a=e}return Object(c.a)(t,[{key:"mul",value:function(e){for(var n=new Array(16),i=0;i<4;++i)for(var r=0;r<4;++r)for(var o=0;o<4;++o)n[i+4*r]+=this.a[i+4*o]*e.a[4*r+o];return new t(n)}},{key:"array",get:function(){return this.a}}],[{key:"ZERO",get:function(){return new t([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])}},{key:"UNIT",get:function(){return new t([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}}]),t}(),g=function(){function t(e,n){Object(u.a)(this,t),this.center=void 0,this.radius=void 0,this.center=e,this.radius=n}return Object(c.a)(t,null,[{key:"boundaryOfTwo",value:function(e,n){var i=n.center.sub(e.center),r=i.length();if(r+n.radius<e.radius)return e;if(r+e.radius<n.radius)return n;var o=(r+n.radius-e.radius)/2;return new t(e.center.add(i.mul(o/r)),r+e.radius+n.radius/2)}},{key:"boundaryOfArray",value:function(e){switch(e.length){case 0:return new t(v.ZERO,0);case 1:return e[0];case 2:return t.boundaryOfTwo(e[0],e[1]);default:for(var n=function(t){var n=e[t];return e[t]=e[e.length-1],e.pop(),n},i=n(e.reduce((function(t,n,i){return e[t].radius>n.radius?t:i}),0));e.length>0;){for(var r=0,o=i.center.sub(e[0].center).length()+e[0].radius,s=1;s<e.length;++s){var a=i.center.sub(e[s].center).length()+e[s].radius;a>o&&(o=a,r=s)}i=t.boundaryOfTwo(i,n(r))}return i}}}]),t}();g.UNIT=new g(v.ZERO,1);var y=function(){function t(e,n){if(Object(u.a)(this,t),this.lower=void 0,this.upper=void 0,e>n)throw"invalid interval";this.lower=e,this.upper=n}return Object(c.a)(t,null,[{key:"new",value:function(e,n){return e<=n?new t(e,n):void 0}}]),Object(c.a)(t,[{key:"width",get:function(){return this.upper-this.lower}},{key:"center",get:function(){return(this.lower+this.upper)/2}}]),t}();y.UNIT=new y(0,1),y.INFINITY=new y(Number.NEGATIVE_INFINITY,Number.POSITIVE_INFINITY);var w=function(){function t(){Object(u.a)(this,t),this.lower=Number.POSITIVE_INFINITY,this.upper=Number.NEGATIVE_INFINITY}return Object(c.a)(t,[{key:"add",value:function(t){t<this.lower&&(this.lower=t),t>this.upper&&(this.upper=t)}},{key:"build",value:function(){return y.new(this.lower,this.upper)}}]),t}(),b=function(){function t(e,n){Object(u.a)(this,t),this.x=void 0,this.y=void 0,this.x=e,this.y=n}return Object(c.a)(t,[{key:"points",value:function(){return[this.ll,this.ul,this.lu,this.uu]}},{key:"points_ccw",value:function(){return[this.ll,this.ul,this.uu,this.lu]}},{key:"ll",get:function(){return new d(this.x.lower,this.y.lower)}},{key:"ul",get:function(){return new d(this.x.upper,this.y.lower)}},{key:"lu",get:function(){return new d(this.x.lower,this.y.upper)}},{key:"uu",get:function(){return new d(this.x.upper,this.y.upper)}},{key:"lower",get:function(){return this.ll}},{key:"upper",get:function(){return this.uu}},{key:"center",get:function(){return new d(this.x.center,this.y.center)}}],[{key:"new",value:function(e,n){return e&&n?new t(e,n):void 0}}]),t}();b.UNIT=new b(y.UNIT,y.UNIT);var p=function(){function t(e,n,i){Object(u.a)(this,t),this.x=void 0,this.y=void 0,this.z=void 0,this.x=e,this.y=n,this.z=i}return Object(c.a)(t,[{key:"boundingSphere",value:function(){var t=this.center,e=this.upper.sub(t).length();return new g(t,e)}},{key:"lower",get:function(){return new v(this.x.lower,this.y.lower,this.z.lower)}},{key:"upper",get:function(){return new v(this.x.upper,this.y.upper,this.z.upper)}},{key:"center",get:function(){return new v(this.x.center,this.y.center,this.z.center)}}],[{key:"new",value:function(e,n,i){return e&&n&&i?new t(e,n,i):void 0}},{key:"boundaryOf",value:function(t){for(var e=new x,n=0;n<t.length;n+=3)e.add(t[n+0],t[n+1],t[n+2]);return e.build()}}]),t}(),x=function(){function t(){Object(u.a)(this,t),this.x=new w,this.y=new w,this.z=new w}return Object(c.a)(t,[{key:"add",value:function(t,e,n){"number"===typeof t?(this.x.add(t),this.y.add(e||0),this.z.add(n||0)):(this.x.add(t.x),this.y.add(t.y),this.z.add(t.z))}},{key:"build",value:function(){return p.new(this.x.build(),this.y.build(),this.z.build())}}]),t}(),E=function t(e,n,i){Object(u.a)(this,t),this.p1=void 0,this.p2=void 0,this.p3=void 0,this.p1=e,this.p2=n,this.p3=i},j=function(){function t(e,n,i,r){Object(u.a)(this,t),this.w=void 0,this.x=void 0,this.y=void 0,this.z=void 0,this.w=e,this.x=n,this.y=i,this.z=r}return Object(c.a)(t,[{key:"clone",value:function(){return new t(this.w,this.x,this.y,this.z)}},{key:"conjugate",value:function(){return new t(this.w,-this.x,-this.y,-this.z)}},{key:"mul",value:function(e){return new t(this.w*e.w-this.x*e.x-this.y*e.y-this.z*e.z,this.w*e.x+this.x*e.w+this.y*e.z-this.z*e.y,this.w*e.y-this.x*e.z+this.y*e.w+this.z*e.x,this.w*e.z+this.x*e.y-this.y*e.x+this.z*e.w)}}]),t}();j.UNIT=new j(1,0,0,0);var k=function(){function t(e){Object(u.a)(this,t),this.q=void 0,this.q=e}return Object(c.a)(t,[{key:"clone",value:function(){return new t(this.q.clone())}},{key:"transform",value:function(t){var e=this.q.mul(new j(1,t.x,t.y,t.z)).mul(this.q.conjugate());return new v(e.x,e.y,e.z)}},{key:"inverse",value:function(){return new t(this.q.conjugate())}},{key:"mul",value:function(e){return new t(this.q.mul(e.q))}},{key:"toMatrix",value:function(){var t=this.q,e=t.w*t.w,n=t.x*t.x,i=t.y*t.y,r=t.z*t.z,o=t.w*t.x,s=t.w*t.y,a=t.w*t.z,u=t.x*t.y,c=t.y*t.z,h=t.z*t.x;return new m([e+n-i-r,2*(u+a),2*(h-s),0,2*(u-a),e-n+i-r,2*(c+o),0,2*(h+s),2*(c-o),e-n-i+r,0,0,0,0,1])}},{key:"u",get:function(){return this.transform(v.EX)}},{key:"v",get:function(){return this.transform(v.EY)}},{key:"n",get:function(){return this.transform(v.EZ)}}],[{key:"ofAxis",value:function(e,n){var i=Math.cos(.5*n),r=Math.sin(.5*n)/e.length();return isFinite(r)||(r=0),new t(new j(i,r*e.x,r*e.y,r*e.z))}}]),t}();k.UNIT=new k(j.UNIT);var O=function(){function t(e,n){Object(u.a)(this,t),this.r=void 0,this.t=void 0,this.r=e,this.t=n}return Object(c.a)(t,[{key:"clone",value:function(){return new t(this.r.clone(),this.t.clone())}},{key:"transform",value:function(t){return this.r.transform(t).add(this.t)}},{key:"inverse",value:function(){var e=this.r.inverse(),n=e.transform(this.t).neg();return new t(e,n)}},{key:"toMatrix",value:function(){var t=this.r.toMatrix();return t.array[12]=this.t.x,t.array[13]=this.t.y,t.array[14]=this.t.z,t}}]),t}();O.UNIT=new O(k.UNIT,v.ZERO);var T=n(12),R=function(){function t(e){Object(u.a)(this,t),this.gl=void 0,this.program=void 0,this.atrPosition=void 0,this.uniModelViewMatrix=void 0,this.uniProjMatrix=void 0,this.uniColor=void 0,this.gl=e,this.program=Y(e,t.vs,t.fs),this.atrPosition=e.getAttribLocation(this.program,"position"),this.uniModelViewMatrix=e.getUniformLocation(this.program,"modelViewMatrix"),this.uniProjMatrix=e.getUniformLocation(this.program,"projMatrix"),this.uniColor=e.getUniformLocation(this.program,"color")}return Object(c.a)(t,[{key:"draw",value:function(t,e,n,i){if(t.gl!==this.gl||e.gl!==this.gl)throw new Error("PointsProgram: GL rendering context mismatch");var r=t.gl;r.useProgram(this.program),r.uniform3f(this.uniColor,i.r,i.g,i.b),t.glUniformModelViewMatrix(this.uniModelViewMatrix),t.glUniformProjectionMatrix(this.uniProjMatrix),e.enablePoints(this.atrPosition),r.drawArrays(n,0,e.vertexCount)}}]),t}();R.get=X((function(t){return new R(t)})),R.vs="\n    attribute vec4 position;\n    uniform mat4 modelViewMatrix;\n    uniform mat4 projMatrix;\n    void main() {\n        gl_Position = projMatrix * modelViewMatrix * position;\n    }",R.fs="\n    precision mediump float;\n    uniform vec3 color;\n    void main(){\n        gl_FragColor = vec4(color, 1);\n    }";var P=function(){function t(e,n,i){Object(u.a)(this,t),this.gl=void 0,this.program=void 0,this.atrPosition=void 0,this.atrNormal=void 0,this.uniModelViewMatrix=void 0,this.uniProjMatrix=void 0,this.gl=e,this.program=Y(e,n,i),this.atrPosition=e.getAttribLocation(this.program,"position"),this.atrNormal=e.getAttribLocation(this.program,"normal"),this.uniModelViewMatrix=e.getUniformLocation(this.program,"modelViewMatrix"),this.uniProjMatrix=e.getUniformLocation(this.program,"projMatrix")}return Object(c.a)(t,[{key:"draw",value:function(t,e,n){if(t.gl!==this.gl||e.gl!==this.gl)throw new Error("GL rendering context mismatch");var i=t.gl;i.useProgram(this.program),t.glUniformModelViewMatrix(this.uniModelViewMatrix),t.glUniformProjectionMatrix(this.uniProjMatrix),e.enablePoints(this.atrPosition),e.enableNormals(this.atrNormal),i.drawArrays(n,0,e.vertexCount)}}]),t}(),M=function t(){Object(u.a)(this,t)};M.vs="\n    attribute vec4 position;\n    attribute vec3 normal;\n    varying vec3 fPos;\n    varying vec3 fNrm;\n    uniform mat4 modelViewMatrix;\n    uniform mat4 projMatrix;\n    void main() {\n        vec4 pos = modelViewMatrix * position;\n        fPos = pos.xyz;\n        fNrm = mat3(modelViewMatrix) * normal;\n        gl_Position = projMatrix * pos;\n    }",M.vs2="#version 300 es\n    in vec4 position;\n    in vec3 normal;\n    out vec3 fPos;\n    out vec3 fNrm;\n    uniform mat4 modelViewMatrix;\n    uniform mat4 projMatrix;\n    void main() {\n        vec4 pos = modelViewMatrix * position;\n        fPos = pos.xyz;\n        fNrm = mat3(modelViewMatrix) * normal;\n        gl_Position = projMatrix * pos;\n    }";var F=function(t){function e(t){var n;return Object(u.a)(this,e),n=function(t){return t.getParameter(t.VERSION).startsWith("WebGL 2.0")}(t)?Object(h.a)(this,Object(l.a)(e).call(this,t,M.vs2,e.fs2)):Object(h.a)(this,Object(l.a)(e).call(this,t,M.vs,e.fs)),Object(h.a)(n)}return Object(f.a)(e,t),e}(P);F.get=X((function(t){return new F(t)})),F.fs="\n    precision mediump float;\n    varying vec3 fPos;\n    varying vec3 fNrm;\n    void main(){\n        vec4 lightPos = vec4(1.0, 1.0, 1.0, 0.0);\n        float shininess = 2.0;\n        float ambient = 0.1;\n        vec3 col = vec3(0.0, 0.8, 0.0);\n\n        vec3 light = normalize((lightPos - vec4(fPos, 1) * lightPos.w).xyz);\n        vec3 nrm = normalize(fNrm);\n        vec3 refDir = reflect(-light, nrm);\n        float diffuse = max(dot(light, nrm), 0.0);\n        //float specular = 0.0;\n        float specular = pow(max(refDir.z, 0.0), shininess);\n\n        gl_FragColor = vec4((diffuse + ambient) * col + vec3(specular), 1);\n    }",F.fs2="#version 300 es\n    precision mediump float;\n    in vec3 fPos;\n    in vec3 fNrm;\n    out vec4 color;\n    void main(){\n        vec4 lightPos = vec4(1.0, 1.0, 1.0, 0.0);\n        float shininess = 2.0;\n        float ambient = 0.1;\n        vec3 col = vec3(0.0, 0.8, 0.0);\n\n        vec3 light = normalize((lightPos - vec4(fPos, 1) * lightPos.w).xyz);\n        vec3 nrm = normalize(fNrm);\n        vec3 refDir = reflect(-light, nrm);\n        float diffuse = max(dot(light, nrm), 0.0);\n        //float specular = 0.0;\n        float specular = pow(max(refDir.z, 0.0), shininess);\n\n        color = vec4((diffuse + ambient) * col + vec3(specular), 1);\n    }";var U=function(t){function e(t){return Object(u.a)(this,e),Object(h.a)(this,Object(l.a)(e).call(this,t,M.vs2,e.fs2))}return Object(f.a)(e,t),e}(P);U.get=X((function(t){return new U(t)})),U.fs2="#version 300 es\n    precision mediump float;\n    in vec3 fPos;\n    in vec3 fNrm;\n    out vec4 color;\n    void main(){\n        const vec4 lightPos = vec4(1.0, 1.0, 1.0, 0.0);\n        const float shininess = 2.0;\n        const float ambient = 0.3;\n        const vec3 col = vec3(0.0, 0.8, 0.0);\n\n        vec3 light = normalize((lightPos - vec4(fPos, 1) * lightPos.w).xyz);\n        vec3 nrm = normalize(fNrm);\n        vec3 refDir = reflect(-light, nrm);\n        float diffuse = dot(light, nrm) < 0.0 ? 0.0 : 1.0;\n        float specular = pow(max(refDir.z, 0.0), shininess);\n        specular = specular < 0.5 ? 0.0 : 0.7;\n\n        color = vec4((diffuse + ambient) * col + vec3(specular), 1);\n    }";var A=function(t){function e(t){return Object(u.a)(this,e),Object(h.a)(this,Object(l.a)(e).call(this,t,e.vs2,e.fs2))}return Object(f.a)(e,t),e}(P);A.get=X((function(t){return new A(t)})),A.vs2="#version 300 es\n    in vec4 position;\n    in vec3 normal;\n    out vec3 fPos;\n    out vec3 fNrm;\n    out vec2 fUV;\n    out vec3 fVecU;\n    out vec3 fVecV;\n    uniform mat4 modelViewMatrix;\n    uniform mat4 projMatrix;\n    void main() {\n        vec4 pos = modelViewMatrix * position;\n        fPos = pos.xyz;\n        fNrm = mat3(modelViewMatrix) * normal;\n        gl_Position = projMatrix * pos;\n\n        vec3 a = abs(normal);\n        if (a.x <= a.y && a.x <= a.z) {\n            fVecU = normalize(vec3(0, normal.z, -normal.y));\n        }\n        else if (a.y <= a.x && a.y <= a.z) {\n            fVecU = normalize(vec3(-normal.z, 0, normal.x));\n        }\n        else {\n            fVecU = normalize(vec3(normal.y, -normal.x, 0));\n        }\n        fVecV = normalize(cross(normal, fVecU));\n        float u = dot(position.xyz, fVecU);\n        float v = dot(position.xyz, fVecV);\n        fUV = vec2(u, v);\n        fVecU = mat3(modelViewMatrix) * fVecU;\n        fVecV = mat3(modelViewMatrix) * fVecV;\n    }",A.fs2="#version 300 es\n    precision mediump float;\n    in vec3 fPos;\n    in vec3 fNrm;\n    in vec2 fUV;\n    in vec3 fVecU;\n    in vec3 fVecV;\n    out vec4 color;\n    void main(){\n        const vec4 lightPos = vec4(1.0, 1.0, 1.0, 0.0);\n        const float shininess = 2.0;\n        const float ambient = 0.2;\n        const vec3 col = vec3(0.0, 0.8, 0.0);\n\n        vec3 nrm = normalize(fNrm);\n        const float SCALE = 10.0;\n        float u = 2.0 * (fUV.x / SCALE - round(fUV.x / SCALE));\n        float v = 2.0 * (fUV.y / SCALE - round(fUV.y / SCALE));\n        float r2 = u * u + v * v;\n        if (r2 < 1.0) {\n            float n = sqrt(1.0 - r2);\n            nrm = u * fVecU + v * fVecV + n * nrm;\n        }\n\n        vec3 light = normalize((lightPos - vec4(fPos, 1) * lightPos.w).xyz);\n        vec3 refDir = reflect(-light, nrm);\n        float diffuse = max(dot(light, nrm), 0.0);\n        float specular = pow(max(refDir.z, 0.0), shininess);\n\n        color = vec4((diffuse + ambient) * col + vec3(specular), 1);\n    }";var N=function(t){function e(t){var n;Object(u.a)(this,e),(n=Object(h.a)(this,Object(l.a)(e).call(this,t,e.vs2,F.fs2))).uniSeconds=void 0,n.uniAmplitude=void 0,n.seconds=0,n.uniSeconds=t.getUniformLocation(n.program,"seconds"),n.uniAmplitude=t.getUniformLocation(n.program,"amplitude");return setInterval((function(){n.seconds+=.01}),10),n}return Object(f.a)(e,t),Object(c.a)(e,[{key:"draw",value:function(t,n,i){if(t.gl!==this.gl||n.gl!==this.gl)throw new Error("GL rendering context mismatch");var r=t.gl;r.useProgram(this.program),r.uniform1f(this.uniSeconds,this.seconds),r.uniform1f(this.uniAmplitude,2),Object(T.a)(Object(l.a)(e.prototype),"draw",this).call(this,t,n,i)}}]),e}(P);N.get=X((function(t){return new N(t)})),N.vs2="#version 300 es\n    in vec4 position;\n    in vec3 normal;\n    out vec3 fPos;\n    out vec3 fNrm;\n    uniform mat4 modelViewMatrix;\n    uniform mat4 projMatrix;\n    uniform float seconds;\n    uniform float amplitude;\n    const float PERIOD = 2.0;\n    const float PI = 3.141592653589793;\n    void main() {\n        float delta = amplitude * sin(2.0 * PI * seconds / PERIOD);\n        vec4 pos = modelViewMatrix * (position + delta * vec4(normal, 0));\n        fPos = pos.xyz;\n        fNrm = mat3(modelViewMatrix) * normal;\n        gl_Position = projMatrix * pos;\n    }";var z=function(){function t(e,n,i,r){Object(u.a)(this,t),this.program=void 0,this.buffer=void 0,this.entity=void 0,this.mode=void 0,this.program=R.get(e),this.buffer=n,this.entity=r,this.mode=i}return Object(c.a)(t,[{key:"dispose",value:function(){this.buffer.dispose()}},{key:"draw",value:function(t){this.program.draw(t,this.buffer,this.mode,new V(0,1,0))}},{key:"drawForSelection",value:function(t,e){this.program.draw(t,this.buffer,this.mode,e.emitColor3f(this.entity))}}]),t}(),B=function(){function t(e,n,i,r){Object(u.a)(this,t),this.shadingPrograms=void 0,this.selectionProgram=void 0,this.buffer=void 0,this.entity=void 0,this.mode=void 0,this.shadingPrograms=[F.get(e),U.get(e),A.get(e),N.get(e)],this.selectionProgram=R.get(e),this.buffer=n,this.entity=r,this.mode=i}return Object(c.a)(t,null,[{key:"incrementShaderNo",value:function(){++this.shaderNo}}]),Object(c.a)(t,[{key:"dispose",value:function(){this.buffer.dispose()}},{key:"draw",value:function(e){var n=t.shaderNo%this.shadingPrograms.length;this.shadingPrograms[n].draw(e,this.buffer,this.mode)}},{key:"drawForSelection",value:function(t,e){this.selectionProgram.draw(t,this.buffer,this.mode,e.emitColor3f(this.entity))}}]),t}();B.shaderNo=0;var V=function(){function t(e,n,i){Object(u.a)(this,t),this.r=void 0,this.g=void 0,this.b=void 0,this.r=e,this.g=n,this.b=i}return Object(c.a)(t,[{key:"to3f",value:function(){return new t(this.r/255,this.g/255,this.b/255)}},{key:"to3b",value:function(){return new t(Math.round(255*this.r),Math.round(255*this.g),Math.round(255*this.b))}}]),t}(),I=function(){function t(e,n){Object(u.a)(this,t),this.focus=void 0,this.scale=void 0,this.focus=e,this.scale=n}return Object(c.a)(t,null,[{key:"orthoMatrix",value:function(t){var e=t.center,n=t.x.upper-e.x,i=t.y.upper-e.y,r=t.z.upper-e.z;return new m([1/n,0,0,0,0,1/i,0,0,0,0,1/r,0,-e.x/n,-e.y/i,-e.z/r,1])}},{key:"makeProjMatrix",value:function(t,e,n,i){var r=n<i?[e,e*i/n]:[e*n/i,e],o=Object(a.a)(r,2),s=o[0],u=o[1],c=new p(new y(-s,s),new y(-u,u),t);return this.orthoMatrix(c)}}]),Object(c.a)(t,[{key:"fit",value:function(t){this.focus=new O(this.focus.r,t.center),this.scale=t.radius}},{key:"createMatrix",value:function(e,n,i){var r=this.focus.inverse(),o=r.transform(e.center).z;return[t.makeProjMatrix(new y(o-e.radius,o+e.radius),this.scale,n,i),r.toMatrix()]}}]),t}(),C=function(){function t(){Object(u.a)(this,t),this.objects=[]}return Object(c.a)(t,[{key:"emitColor3f",value:function(e){return this.objects.push(e),t.encodeToColor3b(this.objects.length).to3f()}},{key:"getObject",value:function(e){var n=t.decodeFromColor3b(e);return 0<n&&n<=this.objects.length?this.objects[n-1]:null}}],[{key:"encodeToColor3b",value:function(t){return new V(t%256,Math.floor(t/256)%256,Math.floor(t/65536)%256)}},{key:"decodeFromColor3b",value:function(t){return t.r+256*t.g+65536*t.b}}]),t}(),S=function(){function t(e,n){Object(u.a)(this,t),this.gl=void 0,this.renderFunc=void 0,this.fb=void 0,this.depthBuf=void 0,this.colorBuf=void 0,this.canvasWidth=-1,this.canvasHeight=-1,this.session=null,this.gl=e,this.renderFunc=n,this.fb=e.createFramebuffer(),this.depthBuf=e.createRenderbuffer(),this.colorBuf=e.createTexture(),e.bindFramebuffer(e.FRAMEBUFFER,this.fb),e.bindRenderbuffer(e.RENDERBUFFER,this.depthBuf),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.RENDERBUFFER,this.depthBuf),e.bindRenderbuffer(e.RENDERBUFFER,null),e.bindTexture(e.TEXTURE_2D,this.colorBuf),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,this.colorBuf,0),e.bindTexture(e.TEXTURE_2D,null),e.bindFramebuffer(e.FRAMEBUFFER,null)}return Object(c.a)(t,[{key:"dispose",value:function(){this.gl.deleteFramebuffer(this.fb),this.gl.deleteRenderbuffer(this.depthBuf),this.gl.deleteTexture(this.colorBuf)}},{key:"clearSession",value:function(){this.session=null}},{key:"select",value:function(t,e,n,i){var r=this.gl;r.bindFramebuffer(r.FRAMEBUFFER,this.fb),n===this.canvasWidth&&i===this.canvasHeight||(console.log("setup depth-buffer, color-buffer"),this.session=null,this.canvasWidth=n,this.canvasHeight=i,r.bindRenderbuffer(r.RENDERBUFFER,this.depthBuf),r.renderbufferStorage(r.RENDERBUFFER,r.DEPTH_COMPONENT16,n,i),r.bindRenderbuffer(r.RENDERBUFFER,null),r.bindTexture(r.TEXTURE_2D,this.colorBuf),r.texImage2D(r.TEXTURE_2D,0,r.RGB,n,i,0,r.RGB,r.UNSIGNED_BYTE,null),r.bindTexture(r.TEXTURE_2D,null),r.viewport(0,0,n,i)),null===this.session&&(console.log("render for selection"),this.session=this.render());var o=new Uint8Array(3);r.readPixels(t,this.canvasHeight-e,1,1,r.RGB,r.UNSIGNED_BYTE,o);var s=new V(o[0],o[1],o[2]);return r.bindFramebuffer(r.FRAMEBUFFER,null),this.session.getObject(s)}},{key:"render",value:function(){var t=new C;return this.gl.clearColor(0,0,0,0),this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT),this.renderFunc(t),this.gl.flush(),t}}]),t}(),_=function(){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];Object(u.a)(this,t),this.items=void 0,this.items=e}return Object(c.a)(t,[{key:"dispose",value:function(){var t=!0,e=!1,n=void 0;try{for(var i,r=this.items[Symbol.iterator]();!(t=(i=r.next()).done);t=!0){i.value.dispose()}}catch(o){e=!0,n=o}finally{try{t||null==r.return||r.return()}finally{if(e)throw n}}}},{key:"draw",value:function(t){var e=!0,n=!1,i=void 0;try{for(var r,o=this.items[Symbol.iterator]();!(e=(r=o.next()).done);e=!0){r.value.draw(t)}}catch(s){n=!0,i=s}finally{try{e||null==o.return||o.return()}finally{if(n)throw i}}}},{key:"drawForSelection",value:function(t,e){var n=!0,i=!1,r=void 0;try{for(var o,s=this.items[Symbol.iterator]();!(n=(o=s.next()).done);n=!0){o.value.drawForSelection(t,e)}}catch(a){i=!0,r=a}finally{try{n||null==s.return||s.return()}finally{if(i)throw r}}}}]),t}(),D=function(){function t(){Object(u.a)(this,t),this.nodes=[],this.world=null,this.drawer=null}return Object(c.a)(t,[{key:"getDrawer",value:function(t){return null===this.drawer&&(this.drawer=new _(this.nodes.map((function(e){return e.getDrawer(t)})))),this.drawer}},{key:"boundingSphere",value:function(){if(null===this.world){var t=this.nodes.map((function(t){return t.boundingSphere()})).filter((function(t){return void 0!==t})).map((function(t){return t}));this.world=0===t.length?g.UNIT:g.boundaryOfArray(t)}return this.world}},{key:"getNode",value:function(t){return this.nodes[t]}},{key:"setNodes",value:function(t){this.nodes=t,this.world=null,this.drawer=null}},{key:"clearNodes",value:function(){this.setNodes([])}},{key:"addNode",value:function(t){this.nodes.push(t),this.world=null,this.drawer=null}},{key:"nodeCount",get:function(){return this.nodes.length}}]),t}(),L=function(){function t(e,n,i,r){var o,s=this;Object(u.a)(this,t),this.canvas=void 0,this.gl=void 0,this.camera=new I(O.UNIT,1),this.sceneGraph=void 0,this.selectionBuf=void 0;var a=e.getContext(n?"webgl2":"webgl");this.canvas=e,this.gl=a,this.sceneGraph=i,this.selectionBuf=new S(a,(function(t){var e=s.createContext();s.sceneGraph.getDrawer(s.gl).drawForSelection(e,t)})),r&&setInterval((function(){s.render()}),r),a.clearDepth(0),a.enable(a.DEPTH_TEST),a.depthFunc(a.GREATER),e.oncontextmenu=function(){return!1},e.addEventListener("mousedown",(function(t){if(2===t.button){var e=s.camera.scale,n=s.camera.focus,i=s.lengthPerPixel(),r=[t.offsetX,t.offsetY],o=r[0],a=r[1],u=function(t){var r=t.offsetX-o,u=t.offsetY-a,c=n.r.transform(new v(i*r,-i*u,0));if(t.shiftKey)s.camera.focus=new O(s.camera.focus.r,n.t.sub(c));else if(t.ctrlKey){var h=Math.abs(u)/40,l=u>0?1/(1+h):1+h;s.camera.scale=l*e}else{var f=c.cross(n.r.n),d=c.length()/s.camera.scale;s.camera.focus=new O(k.ofAxis(f,d).mul(n.r),s.camera.focus.t)}s.render()};document.addEventListener("mousemove",u),document.addEventListener("mouseup",(function t(e){document.removeEventListener("mousemove",u),document.removeEventListener("mouseup",t)}))}})),e.addEventListener("wheel",(function(t){var e=.1*Math.abs(t.deltaY)/100,n=t.deltaY>0?1/(1+e):1+e;s.camera.scale*=n,s.render()})),e.addEventListener("mousedown",(function(t){if(0===t.button){var e=s.selectionBuf.select(t.offsetX,t.offsetY,s.canvas.width,s.canvas.height);console.log(e)}})),null===(o=e.ownerDocument)||void 0===o||o.addEventListener("keydown",(function(t){"1"===t.key&&(B.incrementShaderNo(),s.render())}))}return Object(c.a)(t,[{key:"fit",value:function(){this.camera.fit(this.sceneGraph.boundingSphere())}},{key:"render",value:function(){var t=this.createContext();this.gl.clearColor(.3,.3,.3,1),this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT),this.sceneGraph.getDrawer(this.gl).draw(t),this.selectionBuf.clearSession()}},{key:"createContext",value:function(){var t=this,e=this.camera.createMatrix(this.sceneGraph.boundingSphere(),this.canvas.width,this.canvas.height),n=Object(a.a)(e,2),i=n[0],r=n[1];return{gl:this.gl,canvasWidth:this.canvas.width,canvasHeight:this.canvas.height,camera:this.camera,glUniformProjectionMatrix:function(e){return t.gl.uniformMatrix4fv(e,!1,i.array)},glUniformModelViewMatrix:function(e){return t.gl.uniformMatrix4fv(e,!1,r.array)}}}},{key:"lengthPerPixel",value:function(){return 2*this.camera.scale/Math.min(this.canvas.width,this.canvas.height)}},{key:"resize",value:function(t,e){this.canvas.width=t,this.canvas.height=e,this.gl.viewport(0,0,this.canvas.width,this.canvas.height),this.render()}},{key:"resizeToWindow",value:function(){var t=this.canvas.getBoundingClientRect(),e=t.left;this.resize(window.innerWidth-2*e,window.innerHeight-t.top-e)}}]),t}();function G(t,e,n){var i=t.createShader(e);if(null==i)throw new Error("shader is null");if(t.shaderSource(i,n),t.compileShader(i),!t.getShaderParameter(i,t.COMPILE_STATUS))throw console.log(t.getShaderInfoLog(i)),new Error("compile error");return i}function Y(t,e,n){var i=G(t,t.VERTEX_SHADER,e),r=G(t,t.FRAGMENT_SHADER,n),o=t.createProgram();if(null==o)throw new Error("program is null");if(t.attachShader(o,i),t.attachShader(o,r),t.linkProgram(o),!t.getProgramParameter(o,t.LINK_STATUS))throw console.log(t.getProgramInfoLog(o)),new Error("Link Error");return o}function X(t){var e=[];return function(n){var i=e.find((function(t){return t.key===n}));return void 0===i&&(i={key:n,value:t(n)},e.push(i)),i.value}}var W=n(7),q=n.n(W),H=n(8);function Z(t,e){return new J(t,e)}function K(t,e){var n=t.createBuffer();return t.bindBuffer(t.ARRAY_BUFFER,n),t.bufferData(t.ARRAY_BUFFER,e,t.STATIC_DRAW),n}var J=function(){function t(e,n){Object(u.a)(this,t),this.gl=void 0,this.points=void 0,this.vertexCount=void 0,this.gl=e,this.points=K(e,n),this.vertexCount=n.length/3}return Object(c.a)(t,[{key:"dispose",value:function(){this.gl.deleteBuffer(this.points)}},{key:"enablePoints",value:function(t){this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.points),this.gl.enableVertexAttribArray(t),this.gl.vertexAttribPointer(t,3,this.gl.FLOAT,!1,0,0)}}]),t}(),$=function(){function t(e,n){Object(u.a)(this,t),this.gl=void 0,this.pointNormals=void 0,this.vertexCount=void 0,this.gl=e,this.pointNormals=K(e,n),this.vertexCount=n.length/6}return Object(c.a)(t,[{key:"dispose",value:function(){this.gl.deleteBuffer(this.pointNormals)}},{key:"enablePoints",value:function(t){this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.pointNormals),this.gl.enableVertexAttribArray(t),this.gl.vertexAttribPointer(t,3,this.gl.FLOAT,!1,24,0)}},{key:"enableNormals",value:function(t){this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.pointNormals),this.gl.enableVertexAttribArray(t),this.gl.vertexAttribPointer(t,3,this.gl.FLOAT,!0,24,12)}}]),t}(),Q=function(){function t(e){var n,i=this,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;Object(u.a)(this,t),this.points=void 0,this.boundary=void 0,this.entity=void 0,this.getDrawer=X((function(t){return new z(t,Z(t,i.points),t.LINES,i.entity)})),this.points=e,this.boundary=null===(n=p.boundaryOf(e))||void 0===n?void 0:n.boundingSphere(),this.entity=null===r?this:r}return Object(c.a)(t,[{key:"boundingSphere",value:function(){return this.boundary}}]),t}(),tt=function(){function t(e){var n=this,i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;Object(u.a)(this,t),this.vertices=void 0,this.entity=void 0,this.getDrawer=X((function(t){return new B(t,n.vertices.createVertexBuffer(t),t.TRIANGLES,n.entity)})),this.vertices=e,this.entity=null===i?this:i}return Object(c.a)(t,[{key:"boundingSphere",value:function(){return this.vertices.boundingSphere()}},{key:"getTriangle",value:function(t){return new E(this.vertices.getPoint(3*t+0),this.vertices.getPoint(3*t+1),this.vertices.getPoint(3*t+2))}},{key:"toWireframe",value:function(){for(var t=new Float32Array(6*this.vertices.count),e=0;e<this.triangleCount;++e)for(var n=0;n<3;++n){var i=3*e+n,r=3*e+(n+1)%3,o=this.vertices.getPoint(i),s=this.vertices.getPoint(r);t[3*(2*i+0)+0]=o.x,t[3*(2*i+0)+1]=o.y,t[3*(2*i+0)+2]=o.z,t[3*(2*i+1)+0]=s.x,t[3*(2*i+1)+1]=s.y,t[3*(2*i+1)+2]=s.z}return new Q(t,this.entity)}},{key:"triangleCount",get:function(){return this.vertices.count/3}}]),t}();var et=function(){function t(e,n){var i,r=this;Object(u.a)(this,t),this.data=void 0,this.boundary=void 0,this.entity=void 0,this.getDrawer=X((function(t){return new B(t,r.createVertexBuffer(t),t.POINTS,r.entity)})),this.data=e,this.entity=n||this;for(var o=new x,s=0;s<this.count;++s)o.add(this.getPoint(s));this.boundary=null===(i=o.build())||void 0===i?void 0:i.boundingSphere()}return Object(c.a)(t,[{key:"boundingSphere",value:function(){return this.boundary}},{key:"createVertexBuffer",value:function(t){return function(t,e){return new $(t,e)}(t,this.data)}},{key:"getPoint",value:function(t){return new v(this.data[6*t+0],this.data[6*t+1],this.data[6*t+2])}},{key:"getNormal",value:function(t){return new v(this.data[6*t+3],this.data[6*t+4],this.data[6*t+5])}},{key:"count",get:function(){return this.data.length/6}}]),t}(),nt=function(){function t(){Object(u.a)(this,t)}return Object(c.a)(t,null,[{key:"readFile",value:function(t){return new Promise((function(e){var n=new FileReader;n.onload=function(){return e(n.result)},n.readAsArrayBuffer(t)}))}}]),t}(),it=function(){function t(){Object(u.a)(this,t)}return Object(c.a)(t,null,[{key:"readBuf",value:function(t){for(var e=new DataView(t),n=e.getUint32(80,!0),i=new Float32Array(18*n),r=function(t){for(var n=84+50*t,r=function(){return n+=4,e.getFloat32(n-4,!0)},o=r(),s=r(),a=r(),u=0;u<3;++u){var c=6*(3*t+u);i[c+0]=r(),i[c+1]=r(),i[c+2]=r(),i[c+3]=o,i[c+4]=s,i[c+5]=a}},o=0;o<n;++o)r(o);return new tt(function(t,e){return new et(t,e)}(i))}},{key:"readFile",value:function(){var e=Object(H.a)(q.a.mark((function e(n){var i;return q.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,nt.readFile(n);case 2:return i=e.sent,e.abrupt("return",t.readBuf(i));case 4:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}()},{key:"readURL",value:function(){var e=Object(H.a)(q.a.mark((function e(n){var i,r;return q.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,fetch(n);case 2:return i=e.sent,e.next=5,i.arrayBuffer();case 5:return r=e.sent,e.abrupt("return",t.readBuf(r));case 7:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}()}]),t}();r.a.PureComponent;function rt(t){var e=Object(i.useRef)(null),n=Object(i.useRef)(null),o=Object(i.useRef)(new D);return Object(i.useEffect)((function(){null!==t.scene&&o.current.addNode(t.scene),null!=n.current&&(e.current=new L(n.current,t.useWebGL2,o.current,t.renderInterval))}),[n,t.useWebGL2,t.renderInterval]),Object(i.useEffect)((function(){null!=e.current&&null!=t.scene&&(o.current.clearNodes(),o.current.addNode(t.scene),e.current.fit(),e.current.render())}),[t.scene]),r.a.createElement("canvas",{ref:n,width:"800",height:"600",style:{borderStyle:"solid"}},"WebGL 2.0 must be supported.")}var ot=function(){function t(e){Object(u.a)(this,t),this.gl=void 0,this.program=void 0,this.atrPosition=void 0,this.atrTexCoord=void 0,this.uniModelViewMatrix=void 0,this.uniProjMatrix=void 0,this.uniTexture=void 0,this.uniColor=void 0,this.uniIsTextureEnabled=void 0,this.gl=e,this.program=Y(e,"\nattribute vec4 position;\nattribute vec2 texCoord;\nuniform mat4 modelViewMatrix;\nuniform mat4 projMatrix;\nvarying vec2 oTexCoord;\nvoid main() {\n    gl_Position = projMatrix * modelViewMatrix * position;\n    oTexCoord = vec2(texCoord.x, 1.0 - texCoord.y);\n}\n","\nprecision mediump float;\nuniform sampler2D texture;\nuniform vec3 color;\nuniform bool isTextureEnabled;\nvarying vec2 oTexCoord;\nvoid main(){\n    if (isTextureEnabled) {\n        gl_FragColor = vec4(color, 1) * texture2D(texture, oTexCoord);\n    } else {\n        gl_FragColor = vec4(color, 1);\n    }\n}\n"),this.atrPosition=e.getAttribLocation(this.program,"position"),this.atrTexCoord=e.getAttribLocation(this.program,"texCoord"),this.uniModelViewMatrix=e.getUniformLocation(this.program,"modelViewMatrix"),this.uniProjMatrix=e.getUniformLocation(this.program,"projMatrix"),this.uniTexture=e.getUniformLocation(this.program,"texture"),this.uniColor=e.getUniformLocation(this.program,"color"),this.uniIsTextureEnabled=e.getUniformLocation(this.program,"isTextureEnabled")}return Object(c.a)(t,[{key:"draw",value:function(t,e,n,i,r){if(t.gl!==this.gl)throw new Error("TrianglesDrawerProgram: GL rendering context mismatch");var o=t.gl;o.useProgram(this.program),t.glUniformModelViewMatrix(this.uniModelViewMatrix),t.glUniformProjectionMatrix(this.uniProjMatrix),"r"in e?(o.uniform3f(this.uniColor,e.r,e.g,e.b),o.uniform1i(this.uniIsTextureEnabled,0)):(o.bindTexture(o.TEXTURE_2D,e),o.uniform1i(this.uniTexture,0),o.uniform3f(this.uniColor,1,1,1),o.uniform1i(this.uniIsTextureEnabled,1)),o.bindBuffer(o.ARRAY_BUFFER,n),o.enableVertexAttribArray(this.atrPosition),o.vertexAttribPointer(this.atrPosition,3,o.FLOAT,!1,0,0),o.bindBuffer(o.ARRAY_BUFFER,i),o.enableVertexAttribArray(this.atrTexCoord),o.vertexAttribPointer(this.atrTexCoord,2,o.FLOAT,!1,0,0),o.drawArrays(o.TRIANGLE_FAN,0,r)}},{key:"createBuffer",value:function(t){var e=this.gl.createBuffer();return this.gl.bindBuffer(this.gl.ARRAY_BUFFER,e),this.gl.bufferData(this.gl.ARRAY_BUFFER,t,this.gl.STATIC_DRAW),e}},{key:"createTexCoordBuffer",value:function(){var t=new Float32Array(8);return t[0]=0,t[1]=0,t[2]=1,t[3]=0,t[4]=1,t[5]=1,t[6]=0,t[7]=1,this.createBuffer(t)}},{key:"createTexture",value:function(t){var e=this.gl,n=e.createTexture();return e.bindTexture(e.TEXTURE_2D,n),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,t),e.generateMipmap(e.TEXTURE_2D),e.bindTexture(e.TEXTURE_2D,null),n}}]),t}();ot.get=X((function(t){return new ot(t)}));var st=function(){function t(e,n,i,r){Object(u.a)(this,t),this.program=void 0,this.count=void 0,this.points=void 0,this.texCoords=void 0,this.texture=void 0,this.entity=void 0,this.program=ot.get(e),this.count=i.length/3,this.points=this.program.createBuffer(i),this.texCoords=this.program.createTexCoordBuffer(),this.texture=this.program.createTexture(n),this.entity=r}return Object(c.a)(t,[{key:"dispose",value:function(){this.program.gl.deleteBuffer(this.points),this.program.gl.deleteTexture(this.texture)}},{key:"draw",value:function(t){this.program.draw(t,this.texture,this.points,this.texCoords,this.count)}},{key:"drawForSelection",value:function(t,e){this.program.draw(t,e.emitColor3f(this.entity),this.points,this.texCoords,this.count)}}]),t}(),at=function(){function t(e){var n=this,i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:new b(new y(0,e.width),new y(0,e.height)),r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:O.UNIT,o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:null;Object(u.a)(this,t),this.image=void 0,this.pos=void 0,this.area=void 0,this.boundary=void 0,this.entity=void 0,this.getDrawer=X((function(t){return new st(t,n.image,n.genRectPoints(),n.entity)})),this.image=e,this.pos=r,this.area=i,this.boundary=new g(r.transform(i.center.to3d()),i.lower.sub(i.center).length()),this.entity=null===o?this:o}return Object(c.a)(t,[{key:"boundingSphere",value:function(){return this.boundary}},{key:"genRectPoints",value:function(){for(var t=this.area.points_ccw(),e=new Float32Array(3*t.length),n=0;n<t.length;++n){var i=this.pos.transform(t[n].to3d());e[3*n+0]=i.x,e[3*n+1]=i.y,e[3*n+2]=i.z}return e}}]),t}();var ut=function(){var t=Object(i.useState)(null),e=Object(a.a)(t,2),n=e[0],o=e[1];return Object(i.useEffect)((function(){it.readURL("sample.stl").then(o)}),[]),r.a.createElement("div",{className:"App"},r.a.createElement("input",{id:"import",type:"file",accept:".stl",onChange:function(t){var e=t.target.files;null!=e&&e.length>=1&&it.readFile(e[0]).then(o)}}),r.a.createElement("br",null),r.a.createElement("span",null,"\u753b\u50cf"),r.a.createElement("input",{id:"importImage",type:"file",accept:".jpg",onChange:function(t){var e=t.target.files;if(null!=e&&e.length>=1){var n=new FileReader,i=new Image;n.onload=function(t){null!=t.target&&"string"===typeof t.target.result&&(i.src=t.target.result)},i.onload=function(t){console.log("image loaded"),console.log(t),o(new at(i))},n.readAsDataURL(e[0])}}}),r.a.createElement("br",null),r.a.createElement(rt,{useWebGL2:!0,scene:n,renderInterval:10}))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));s.a.render(r.a.createElement(ut,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(t){t.unregister()})).catch((function(t){console.error(t.message)}))}},[[13,1,2]]]);
//# sourceMappingURL=main.43824283.chunk.js.map