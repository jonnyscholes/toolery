module.exports = {
	findUnit: findUnit,
	hexToRgb: hexToRgb,
	rgbToHex: rgbToHex,
	darkOrLight: darkOrLight
};


function findUnit(str) {
	var s = str.replace(/\s/g,'').match(/\d(in|cm|pc|mm|pt|px|deg|rad|s|ms|ex)\b/);
	if (s) {
		return s[1];
	}
	return false;
}


function hexToRgb(hex, asString) {
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function (m, r, g, b) {
		return r + r + g + g + b + b;
	});

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (asString) {
		return result ? 'rgb(' + parseInt(result[1], 16) + ', ' + parseInt(result[2], 16) + ', ' + parseInt(result[3], 16) + ')' : null;
	} else {
		return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
	}
}


function rgbToHex(rgb) {
	return ((1 << 24) + (parseInt(rgb[0], 10) << 16) + (parseInt(rgb[1], 10) << 8) + parseInt(rgb[2], 10)).toString(16).slice(1);
}


function darkOrLight(rgb) {
	var brightness;
	brightness = (parseInt(rgb[0], 10) * 299) + (parseInt(rgb[1], 10) * 587) + parseInt((rgb[2], 10) * 114);
	brightness = brightness / 255000;

	if (brightness >= 0.5) {
		return 'dark-theme';
	} else {
		return 'light-theme';
	}
}