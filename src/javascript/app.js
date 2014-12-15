var $ = require('jquery');
var store = require('store');
var ntc = require('ntc');
var WCAGColorContrast = require('WCAGColorContrast');
var fuzzyColor = require('fuzzy-color');
var unit = require('css-units');
var ColorScheme = require('color-scheme');

var utils = require('./includes/util.js');

// UI
var $error = $('.error');
var $input = $('#rgbinput');
var $container = $('.container');

// WCAG
var $wcag = $('.js-wcag');
var $wcagContrast = $('.js-wcag-example');

// Color
var $colorList = $('.js-color-list');
var $colorVariable = $('.js-color-variable');
var $colorTable = $('.js-color-table');

// Units
var $units = $('.js-unit-conversions');

// Misc
var $charCount = $('.js-char-count');
var $wordCount = $('.js-word-count');
var $keypress = $('.js-key-code');

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
	var validUnit = utils.findUnit(value);

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
				hex = '#' + utils.rgbToHex(validColor.raw);
				colorStr = hex;
				break;
			case 'hex':
				rgb = utils.hexToRgb(validColor.string, true);
				hex = validColor.string;
				colorStr = rgb;
				break;
		}

		currentColor = hex.replace('#', '');
		updateColorStore(rgb);

		var contrastText = WCAGColorContrast.ratio(currentColor, wcagBackground) >= 7 ? 'WCAG Pass' : 'WCAG Fail';

		// Content
		$colorTable.text(colorStr);
		$colorVariable.text('$' + ntc.name(hex)[1].toLowerCase().replace(' ', '') + ': ' + rgb + ';');

		$wcag.text(contrastText);
		$wcagContrast.css({'color': '#'+currentColor, 'background': '#'+wcagBackground});

		// Style
		$container.css('background', validColor.string);
		$container.removeClass('light-theme dark-theme').addClass(utils.darkOrLight(utils.hexToRgb(hex)));
	}

	if (!validColor && !validUnit) {
		$error.show().text('no valid colors or units found');
	} else {
		$error.hide();
	}

	$charCount.text(value.length+' chars');
	$wordCount.text(value.split(' ').length+' words');
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