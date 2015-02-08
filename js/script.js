"use strict";
var debugMessage = '';
var enableDebug = true;

var $addBlock = {};
var $addMix = {}; 
var myMap;

$(function() {
	$('input#phone_number').mask("+7 (999) 999-99-99");

	$('#person #radio label').on('click', function(e) {
		e.preventDefault();

		$(this).addClass('active').siblings().removeClass('active');
		var isLegal = $('input#legal').parent().is('.active');

		if(isLegal === true) {
			$('#company_name').removeClass('hide');
		} else {
			$('#company_name').addClass('hide');
		}
	});

	$( "#products #category, #products #material, #products #manufacturer" )
      .selectmenu()
      .selectmenu( "menuWidget" )
        .addClass( "overflow" );

    $("#products #material,#products  #manufacturer" )
      .selectmenu("option", "disabled", true);

    
	

	$('#products #category').selectmenu({change: function(e, ui) {
		var $elem = $(ui.item.element);

		if(!$elem.prop('id')) return;

		var parentId = $elem.parent().attr('id');

		var id = $elem.attr('id').split(parentId + '-').join('');
		// console.log(id,parentId);

		$.post('ajax.php?getItems', {'type':parentId, 'id':id}, function(data) {
			var $materialEl = $('#products #material');
			$materialEl.selectmenu('disable').find(':not(.not_sel)').remove();
			$('#products #manufacturer').selectmenu('disable').find(':not(.not_sel)').remove();

			if(data!==null && data['items'] !== null &&  data['items'].length != 0) {

				var materials = data['items'];

				for(var i in materials) {
					var el = materials[i];
					$materialEl.append('<option id="material-'+el['id']+'">'+el['name'] + '</option>');
				}

			$materialEl.selectmenu('refresh').selectmenu('enable');

			}


		}, 'json');
	}});

	$('#products #material').selectmenu({change: function(e, ui) {
		var $elem = $(ui.item.element);

		if(!$elem.prop('id')) return;

		var parentId = $elem.parent().attr('id');
		var id = $elem.attr('id').split(parentId + '-').join('');
		// var id = $('#category option:selected').attr('id').split(parentId + '-').join('');
		// console.log(id,parentId);

		$.post('ajax.php?getItems', {'type':parentId, 'id':id}, function(data) {
			showUnvisible();

			var $manufacturerEl = $('#products #manufacturer');
			$manufacturerEl.selectmenu('disable').find(':not(.not_sel)').remove();

			if(data!==null && data['items'] !== null &&  data['items'].length != 0) {

				var manufacturers = data['items'];

				for(var i in manufacturers) {
					var el = manufacturers[i];
					$manufacturerEl.append('<option id="manufacturer-'+el['id']+'">'+el['name'] + '</option>');
				}

				$manufacturerEl.selectmenu('refresh').selectmenu('enable');

			}


		}, 'json');
	}});

	// block input data
	$('#add_block').on('click', function(e){
		$addBlock.clone().insertAfter($('.form_cont.block:last')).find('select').selectmenu()
      .selectmenu( "menuWidget" )
        .addClass( "overflow" );
	});

	$('#add_mix').on('click', function(e) {
		$addMix.clone().insertAfter($('.form_cont.mix:last')).find('select').selectmenu()
      .selectmenu( "menuWidget" )
        .addClass( "overflow" );
	});

	if(enableDebug) showUnvisible();  

});

function initMap() {
	ymaps.ready(function () {
	    myMap = new ymaps.Map("ya_map", {
	        center: [55.76, 37.64],
	        zoom: 10,
	        // type: "yandex#satellite",
	        controls: []
	    });
	});  
	// https://tech.yandex.ru/maps/doc/jsapi/2.1/update/concepts/update-docpage/
	// https://tech.yandex.ru/maps/doc/constructor/concepts/About-docpage/
	// http://meganavigator.com/blogposts/podkluchenie-yandeks-kart-k-saity---bystryi-start

	// may be https://tech.yandex.ru/maps/keys/get/
}


function showUnvisible() {
	$( document ).tooltip();

	$( "#date_of_prepayment, #delivery_date, #shipment_date" ).datepicker( $.datepicker.regional[ "ru" ] );

	$('.close').on('click', function(e) {
		$(this).parents('.form_cont').remove();
	});

	$('.unvisible').removeClass('unvisible');

	//button view  	
	$( "#input_data input[type=submit], #additionally input[type=submit]" )
      .button()
      .click(function( event ) {
        event.preventDefault();
	});	


    $addBlock = $('.form_cont.block').clone();
	$addMix = $('.form_cont.mix').clone();

	initMap();

}

