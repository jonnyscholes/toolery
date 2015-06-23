var $ = require('jquery');

var store = require('store');

var WCAGColorContrast = require('WCAGColorContrast');

var unit = require('css-units');

var ntc = require('ntc');
var fuzzyColor = require('fuzzy-color');
var colorConvert = require('color-convert')();
var ColorScheme = require('color-scheme');

var utils = require('./includes/util.js');


// UI
var $error = $('.error');
var $input = $('#rgbinput');
var $container = $('.container');

// WCAG
var $wcag = $('.js-wcag-result');
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
var storageKey = 'rgbto-colors-v2';
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

	$wcagContrast.click(function (e) {
		if (currentColor) {
			wcagBackground = currentColor;
			$wcagContrast.css({'background': '#' + wcagBackground});
		}
	});

	$(document).on('keydown', function (e) {
		$keypress.text(e.keyCode + '  e.keyCode');
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
		});

		updateUnitTable(units);
	}

	if (validColor) {
		var hex;
		var rgb;
		var rgbRaw;
		var colorStr;

		switch (validColor.type) {
			// @todo: Add cmyk / hsl support
			case 'rgb':
			case 'rgba':
				rgb = validColor.string;
				rgbRaw = validColor.raw;
				hex = '#' + utils.rgbToHex(validColor.raw);
				colorStr = hex;
				break;
			case 'hex':
				rgb = utils.hexToRgb(validColor.string, true);
				rgbRaw = utils.hexToRgb(validColor.string, false);
				hex = validColor.string;
				colorStr = rgb;
				break;
		}

		currentColor = hex.replace('#', '');
		updateColorStore(rgbRaw, rgb);

		// Colors
		$colorVariable.text('$' + ntc.name(hex)[1].toLowerCase().replace(' ', '') + ': ' + rgb + ';');
		updateColorTable(rgb, rgbRaw, hex);

		// WCAG
		$wcag.text(wcagResultString(currentColor, wcagBackground));
		$wcagContrast.css({'color': '#'+currentColor, 'background': '#'+wcagBackground});

		// UI
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


function updateUnitTable(units) {
	$units.html('');
	units.forEach(function(el){
		$units.append($('<div class="unit-conversions--table-single data-table--cell" />').text(el));
	});
}

function updateColorTable(rgb, rgbRaw, hex) {
	$colorTable.html('');
	$colorTable
		.append($('<div class="color-conversions--table-single data-table--cell" />')
			.text(rgb));
	$colorTable
		.append($('<div class="color-conversions--table-single data-table--cell" />')
			.text(hex));
	$colorTable
		.append($('<div class="color-conversions--table-single data-table--cell" />')
			.text('hsl('+colorConvert.rgb(rgbRaw.slice(0,3)).hsl().join(',')+')'));
	$colorTable
		.append($('<div class="color-conversions--table-single data-table--cell" />')
			.text('cmyk('+colorConvert.rgb(rgbRaw.slice(0,3)).cmyk().join(',')+')'));
}

function updateColorListHtml(colors) {
	var html = [];

	for (var i = 0; i < colors.length-1; i++) {
		var el = $('<div class="color-list--item"/>');
		el.append($('<a class="color-list--item-cover" href="#"/>')
			.css('background', colors[i].string)
			.attr('data-color', colors[i].raw));

		el.append(createColorSchemeHtml(colors[i].raw, 'triade'));
		el.append(createColorSchemeHtml(colors[i].raw, 'mono'));
		el.append(createColorSchemeHtml(colors[i].raw, 'contrast'));
		el.append(createColorSchemeHtml(colors[i].raw, 'tetrade'));
		html.push(el);
	}
	$colorList.html(html);
}

function createColorSchemeHtml(color, scheme) {
	var scm = new ColorScheme();
	var clrs = scm.from_hue(colorConvert.rgb(color.slice(0,3)).hsl()[0]).scheme(scheme).colors();
	var shtml = $('<div class="color-scheme"/>');

	clrs.forEach(function(c){
		shtml.append($('<a class="color-scheme--item" href="#"/>').css('background', '#'+c).attr('data-color', c));
	});

	return shtml;
}

function rgbToString(rgb) {
	return rgb.length === 3 ? 'rgb('+rgb.join(',')+')' : 'rgba('+rgb.join(',')+')';
}

function wcagResultString(wcagForeground, wcagBackground) {
	// >= 7 on 16px normal === AAA
	// >= 4.5 on 16px bold === AAA

	// >= 4.5 on 16px normal === AA
	// >= 3 on 16px bold === AA

	var s = WCAGColorContrast.ratio(wcagForeground, wcagBackground) >= 7 ? ' AAA Pass' : ' AAA Fail';
	s = WCAGColorContrast.ratio(wcagForeground, wcagBackground) >= 4.5 ? s+'  AA Pass' : s+' AA Fail';
	return 'WCAG ' + s;
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


function updateColorStore(newColor, newColorString) {
	colorList = store.get(storageKey);

	if (colorList) {
		colorList = JSON.parse(store.get(storageKey));
		if(newColor && colorList.map(function (elm) {return elm.string;}).indexOf(newColorString) === -1) {
			colorList.push({raw: newColor, string: newColorString});
		}
		store.set(storageKey, JSON.stringify(colorList));
		updateColorListHtml(colorList);
	} else {
		store.set(storageKey, JSON.stringify([{raw: newColor, string: newColorString}]));
		updateColorListHtml({raw: newColor, string: newColorString});
	}
}