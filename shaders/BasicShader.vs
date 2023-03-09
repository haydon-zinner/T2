attribute vec4 aPosition; 
attribute vec2 aTextureCoordinate;

varying vec2 vTextureCoordinate;

uniform mat4 mWorldMatrix;

void main() 
{
	vTextureCoordinate	= aTextureCoordinate;
    gl_Position 		= mWorldMatrix * aPosition;
} 
           