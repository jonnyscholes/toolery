var $ = require('jquery');
var store = require('store');
var ntc = require('ntc');
var WCAGColorContrast = require('WCAGColorContrast');
var fuzzyColor = require('fuzzy-color');
var unit = require('css-units');

var $input = $('#rgbinput');
var $opposite = $('.opposite');
var $container = $('.container');
var $sass = $('.sass');
var $error = $('.error');
var $message = $('.message');
var $contrast = $('.contrast-example');
var $colorList = $('.color-list');
var $charcount = $('.char-count');
var $keypress = $('.keypress-code');
var $units = $('.units-code');

var wcagBackground = 'ffffff';
var storageKey = 'rgbto-colors';
var currentColor;
var colorList = [];


$(document).ready(function () {
	ntc.init();

	checkAndupdate($input.val());
	updateColorStore();

	$input.on('change paste keyup', function () {
		checkAndupdate($(this).val());
	});

	$(document).on('click', '.color-list a', function (e) {
		$input.val($(this).data('color'));
		$input.change();
		e.preventDefault();
	});

	$contrast.click(function (e) {
		if (currentColor) {
			wcagBackground = currentColor;
			$contrast.css({'background': '#' + wcagBackground});
		}
	});

	$(document).on('keydown', function (e) {
		$keypress.text(e.keyCode);
	});

	$('.info-toggle').click(function(){
		$('body').toggleClass('nav-is-active');
	});
});


function checkAndupdate(value) {
	var validColor = fuzzyColor(value, 'rgb');
	var validUnit = findUnit(value);

	if (value) {
		$container.addClass('has-color');
	}

	if (validUnit) {
		var units = convertUnits(value.replace(validUnit, ''), validUnit).map(function(i){
			if(i.unit === 'px') {
				return Math.ceil(i.value) + i.unit;
			} else {
				return i.value.toFixed(3) + i.unit;
			}
		}).join(' ');
		$units.text(units);
	}

	if (validColor) {
		var hex;
		var rgb;
		var colorStr;

		switch (validColor.type) {
			// @todo: Add cmyk / hsl support
			case 'rgb':
			case 'rgba':
				rgb = validColor.string;
				hex = '#' + rgbToHex(validColor.raw);
				colorStr = hex;
				break;
			case 'hex':
				rgb = hexToRgb(validColor.string, true);
				hex = validColor.string;
				colorStr = rgb;
				break;
		}

		currentColor = hex.replace('#', '');
		updateColorStore(rgb);

		var contrastText = WCAGColorContrast.ratio(currentColor, wcagBackground) >= 7 ? 'WCAG Pass' : 'WCAG Fail';

		// Content
		$opposite.text(colorStr);
		$sass.text('$' + ntc.name(hex)[1].toLowerCase().replace(' ', '') + ': ' + rgb + ';');
		$message.text(contrastText);
		$contrast.css({'color': '#'+currentColor, 'background': '#'+wcagBackground});

		// Style
		$container.css('background', validColor.string);
		$container.removeClass('light-theme dark-theme').addClass(darkOrLight(hexToRgb(hex)));
	}

	if (!validColor && !validUnit) {
		$error.show().text('no valid colors or units found');
	} else {
		$error.hide();
	}

	$charcount.text('chars: '+value.length+' words: '+value.split(' ').length);
}

function convertUnits(value, fromUnit) {
	var types = ['in', 'cm', 'pc', 'mm', 'pt', 'px', 'deg', 'rad', 's', 'ms', '%', 'em', 'ex'];
	var returnStrings = [];

	var baselineUnit = unit(value, fromUnit).convertTo('px');

	returnStrings.push({
		'unit': 'rem',
		'value': Math.ceil(baselineUnit.value) / 16
	});

	for (var i = 0; i < types.length; i++) {
		if (types[i] !== fromUnit) {
			try {
				returnStrings.push(unit(value, fromUnit).convertTo(types[i]));
			}
			catch (e) {
				// there is no conversion available between the two units.
			}
		}
	}

	return returnStrings;
}

function findUnit(str) {
	var s = str.match(/\d(in|cm|pc|mm|pt|px|deg|rad|s|ms|ex)\b/);
	if (s) {
		return s[1];
	}
	return false;
}


function updateColorStore(newColor) {
	colorList = store.get(storageKey);

	if (colorList) {
		colorList = JSON.parse(store.get(storageKey));

		if(newColor && colorList.indexOf(newColor) === -1) {
			colorList.push(newColor);
		}
		store.set(storageKey, JSON.stringify(colorList));
		updateColorListHtml(colorList);
	} else {
		store.set(storageKey, JSON.stringify([newColor]));
		updateColorListHtml([newColor]);
	}
}


function updateColorListHtml(colors) {
	var html = [];
	for (var i = 0; i < colors.length-1; i++) {
		html.push($('<a href="#"/>').css('background', colors[i]).attr('data-color', colors[i]));
	}
	$colorList.html(html);
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