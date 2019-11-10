'use strict';

const Jimp = require('jimp');
const util = require('util');

const width = 256;
const height = 256;
const numIterations = 2000;
let maxHeight = 0;
let minHeight = 0;

const colorRamp = [
	[0,0,100],
	[0,0,155],
	[0,0,170],
	[0,0,180],
	[0,0,255],
	[0,0,255],
	[0,0,255],
	[0,0,255],
	[0,127,127],
	[0,255,0],
	[42,255,0],
	[85,255,0],
	[127,255,0],
	[170,255,0],
	[212,255,0],
	[255,255,0],
	[246,226,0],
	[238,197,0],
	[230,168,0],
	[222,139,0],
	[214,110,0],
	[206,81,0],
	[214,110,42],
	[222,139,85],
	[230,168,127],
	[238,197,170],
	[246,226,212],
	[255,255,255],
];

async function generateImage() {
	const heightData = new Array(width * height).fill(0);

	for (let i = 0; i < numIterations; i++) {
		shiftSide(heightData);
		// if ([10, 50, 100, 500, 1000, 2000].includes(i + 1)) {
		// 	await saveImage(heightDataToColorBuffer(heightData), (i + 1) + '_iterations.png');
		// }
	}

	return heightDataToColorBuffer(heightData);
}

function heightDataToColorBuffer(heightData) {
	const colorData = [];
	for (let i = 0; i < height; i++) {
		for (let k = 0; k < width; k++) {
			let currentHeight = heightData[k + i * width];
			let colorIndex = Math.floor(normalize(currentHeight, minHeight, maxHeight) * (colorRamp.length - 1));
			colorData.push(...colorRamp[colorIndex]);
		}
	}

	return Buffer.from(colorData);
}

function normalize(num, min, max) {
	return (num - min) / (max - min);
}

// generate random line by picking 2 random points
// go through all points and raise/lower them depending
// on which side of the line segment they lie on
function shiftSide(heightData) {
	let x1 = getRandomInt(0, width - 1);
	let y1 = getRandomInt(0, height - 1);
	let x2 = getRandomInt(0, width - 1);
	let y2 = getRandomInt(0, height - 1);
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			let d = pointSide(x, y, x1, y1, x2, y2);
			const i = x + y * width;
			if (d > 0) {
				heightData[i] ++;
			} else if (d < 0) {
				heightData[i] --;
			}
			if (heightData[i] > maxHeight) {
				maxHeight = heightData[i];
			}
			if (heightData[i] < minHeight) {
				minHeight = heightData[i];
			}
		}
	}
}

// min, max inclusive
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// https://math.stackexchange.com/a/274728/49923
function pointSide(x, y, x1, y1, x2, y2) {
	return ((x - x1) * (y2 - y1)) - ((y - y1) * (x2 - x1));
}

// save buffer to file, buffer is rgb data
const saveImage = util.promisify(function (buffer, filename, callback) {
	new Jimp({ data: buffer, width: width, height: height }, (err, image) => {
		if (err) {
			return callback(err);
		}
		image.write(filename, callback)
	});
});

(async () => {
	try {
		const now = Date.now();
		const buffer = await generateImage();
		await saveImage(buffer, 'test.png');
		console.log(numIterations + ' iterations took ' + (Date.now() - now) + ' ms');
	} catch (e) {
		console.error(e);
	}
})();
