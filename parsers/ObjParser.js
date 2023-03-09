function ObjParser(fileName){

	console.log("Now Loading file:", fileName );
	var modelStringData = loadFileAJAX(fileName);

	if (! modelStringData )
	{ alert("Could not retrieve model data:"+fileName) ;   }

	// console.log( modelStringData );

	var lineSplit = modelStringData.split("\n");

	var tempVertexPositionList = [];
	var tempVertexTextureList = [];
	var tempVertexNormalList = [];

	this.vertexPositions = [];
	this.vertexTextures = [];
	this.vertexNormals = [];

	var minX, maxX, minY, maxY, minZ, maxZ;

	var vertexCount = 0;

	for (var lineId =0; lineId<lineSplit.length;lineId++) //Iterate over all the lines within the obj file

	{

		if ( lineSplit[lineId][0]=='v' && lineSplit [lineId][1]==' ') //If the line begins with "v ". Defining a vertex point in 3D

		{
			vertexCount++;
			var posString= lineSplit[lineId].split(" ");  //Split the current line by spaces to seperate the X Y and Z values within the string into an array

			var newPos = [parseFloat(posString[1]),parseFloat(posString[2]),parseFloat(posString[3])]; //Creates an array of three elements that are now floating point numbers and no longer ascii strings

			tempVertexPositionList.push( newPos ); //Push the current point onto the models temporary vertex position list

			if (vertexCount == 1)
			{
				minX = maxX = newPos[0];

				minY = maxY = newPos[1];

				minZ = maxZ = newPos[2];
			}
			else
			{
				if (minX > newPos[0])
					minX = newPos[0];

				if (maxX < newPos[0])
					maxX = newPos[0];

				if (minY > newPos[1])
					minY = newPos[1];

				if (maxY < newPos[1])
					maxY = newPos[1];

				if (minZ > newPos[2])
					minZ = newPos[2];

				if (maxZ < newPos[2])
					maxZ = newPos[2];
			}

		}

		if (lineSplit[lineId][0]=='v' && lineSplit[lineId][1]=='t')
		{
			var textString = lineSplit[lineId].split(" ");
			newText = [parseFloat(textString[1]), parseFloat(textString[2])];
			tempVertexTextureList.push(newText);
		}


		if (lineSplit[lineId][0]=='v' && lineSplit[lineId][1]=='n')
		{
			var textString = lineSplit[lineId].split(" ");
			newText = [parseFloat(textString[1]), parseFloat(textString[2]), parseFloat(textString[3])]; // as normal data is 3D
			tempVertexNormalList.push(newText); // normal data to be stored in the list.
		}

		if ( lineSplit[lineId][0]=='f' && lineSplit [lineId][1]==' ') //If the line begins with "v ". Defining a vertex point in 3D

		{

			var posString = lineSplit[lineId].split(" ");  //Split the current line by spaces to separate the X Y and Z values within the string into an array

			for (var elementIdx = 1; elementIdx < posString.length; elementIdx++)
			{
				var vertex = posString[elementIdx].split("/");
				this.vertexPositions.push(tempVertexPositionList[vertex[0]-1]);
				this.vertexTextures.push(tempVertexTextureList[vertex[1]-1]);
				this.vertexNormals.push(tempVertexNormalList[vertex[2]-1]);	//We are interested in the 3rd index of  face data (e.g. f 1/1/1)
				// index starts from 1 but the index for this structure starts from 0 hence we put '-1' to be consistent
				//	console.log(tempVertexNormalList[vertex[2]-1]);
				// output the normal data to see whether it works
			}

		}

	}
	this.span = Math.max(maxX-minX, maxY-minY, maxZ-minZ);
	this.center = [(maxX+minX)/2.0, (maxY+minY)/2.0, (maxZ+minZ)/2.0];
	this.radius = Math.sqrt((this.center[0]-minX)*(this.center[0]-minX) + (this.center[1]-minY)*(this.center[1]-minY) + (this.center[2]-minZ)*(this.center[2]-minZ));
	// console.log( tempVertexPositionList );
	// console.log( this.vertexPositions);
	// console.log( this.vertexTextures);
	// console.log( this.span );
	// console.log( this.offset);

} 