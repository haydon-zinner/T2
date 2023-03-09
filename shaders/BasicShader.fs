precision mediump float; 

varying vec2 vTextureCoordinate;

uniform sampler2D myTexture;
uniform float alphaSetting;

void main()
{ 
	gl_FragColor = vec4(texture2D(myTexture, vTextureCoordinate).xyz,alphaSetting); 
}          