//Callback function that is called once the data for the TGA is downloaded. Also takes a reference to the parser.
//Parses and sets the texture data in WebGL
function  parseTGAFile(binaryData, parser)
{
	if (!binaryData) {
		alert("Error no TGA file data loaded: "+fileName);
		return;
	}

	var binaryDataUint8Array = new Uint8Array(binaryData);
	var pixelDepth = binaryDataUint8Array[16];
	var height = (binaryDataUint8Array[15]<<8) + binaryDataUint8Array[14];
	var width = (binaryDataUint8Array[13]<<8) + binaryDataUint8Array[12];
	//console.log(height, width, pixelDepth, height*width*pixelDepth/3, binaryDataUint8Array.length);

	var nChannels = pixelDepth/3;
	var offset = 18;

	for (var i=0; i < width*height; i+=nChannels)
	{
		binaryDataUint8Array[i] = binaryDataUint8Array[i+offset+2];
		binaryDataUint8Array[i+1] = binaryDataUint8Array[i+offset+1];
		binaryDataUint8Array[i+2] = binaryDataUint8Array[i+offset];
	}

	//Creates a new texture within WebGL
	parser.texture = gl.createTexture();

	//Sets the current WebGL texture to the newly created texture
	gl.bindTexture(gl.TEXTURE_2D, parser.texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,  width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, binaryDataUint8Array);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.generateMipmap(gl.TEXTURE_2D);

}

function TGAParser(fileName){
	//Set texture reference to null
	this.texture=null;
	//Create a HTTP request
	var oReq;
	if (window.XMLHttpRequest)
	{
		oReq = new XMLHttpRequest();
	}

	if (oReq != null)
	{
		//Set the request parser to this object
		oReq.parser= this;
		//Request the given file in asynchronous mode       
		oReq.open("GET", fileName, true);
		//Request that the response data comes as an arraybuffer
		oReq.responseType = "arraybuffer";
		//When the response arrives call the function parseTGAFile and pass the fileData as a parameter       
		oReq.onreadystatechange = function()
		{
			if (oReq.readyState == 4 && oReq.status == 200)
			{
				parseTGAFile(oReq.response,oReq.parser);
				console.log("TGA file loaded: "+fileName);
			}
		}
		oReq.send();
	}
	else
	{
		window.alert("Error creating XmlHttpRequest object.");
	}
} 