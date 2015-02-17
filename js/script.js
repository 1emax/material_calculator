"use strict";
var debugMessage = '';
var enableCalc = true;
var mapObjs = {};
var custmRoutersHelper = {};

var $addBlock = {};
var $addMix = {};
var inputDataItems = {"blocks":{"length":0,"items":{}},"mixes":{"length":0,"items":{}}};
var trArr = {"number_per_pallet":"Кол-во штук на 1 поддоне",	"number_per_cubic_meter":"Кол-во штук в 1 м<sup>3</sup>",	"weight":"Вес блока",	"weight_pallet_and_block":"Вес поддона с блоками",	"strength_class":"Класс прочности", "breaking_strength":"Предел прочности", "thermal_conductivity":"Теплопроводность",	"frost_resistance":"Морозостойкость"};
var trArrHelper = {"number_per_pallet":"шт",	"number_per_cubic_meter":"шт",	"weight":"кг",	"weight_pallet_and_block":"кг",	"strength_class":"-", "breaking_strength":"кг/см<sup>2</sup>", "thermal_conductivity":"Вт/м*C<sup>0</sup>",	"frost_resistance":"Циклов"};
var addTransportCols = ['',	'name','capacity','dimensions','pallets','rate','mcad','inside_mcad','inside_ttk','inside_sad_kolco'];

// usage sample
// addInpData(inputDataItems, 'blocks', {});
// addInpData(inputDataItems['blocks'], 'length', 0);
// addInpData(inputDataItems['blocks'], 'items', {});

var myMap;

$(function() {
	$addBlock = $('.form_cont.block').remove().clone();
	$addMix = $('.form_cont.mix').remove().clone();

	$('input#phone_number').mask("+7 (999) 999-99-99");

	$(document).on('click','#person #radio label', function(e) {
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

				if(data['characts'] !== null &&  data['characts'].length != 0) {
					var characts = data['characts'];
					var len = ++inputDataItems.blocks.length;
					inputDataItems.blocks.items[len] = changeKey(characts, 'id');
				}
			}
		}, 'json');
	}});

	$('#products #material').selectmenu({change: function(e, ui) {
		var $elem = $(ui.item.element);

		if(!$elem.prop('id')) return;

		if(enableCalc === false) {
			enableCalc = true;
			showUnvisible();
		}

		var parentId = $elem.parent().attr('id');
		var id = $elem.attr('id').split(parentId + '-').join('');

		$.post('ajax.php?getItems', {'type':parentId, 'id':id}, function(data) {

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
	$(document).on('click','#add_block', function(e){
		if($('.form_cont.block').length >= 4) return;

		var $mater = $('#products #material').find('option:selected');
		var $manufctr = $('#products #manufacturer').find('option:selected');

		if(!$mater.prop('id') ) {
			if($('.form_cont.block').length === 0) return;
			else {
				alert('Не выбран материал');
				// for future
				/*
				var $tmpEl = $('.form_cont.block:last').clone();
				$tmpEl.appendTo($('#input_data .blocks'));

				$tmpEl.find('input[type=text]').each(function(i, el) {
					$(this).val('');
				});
				$tmpEl.find('option:selected').prop('selected',false);
				$tmpEl.find('option:first').prop('selected',true);

				$tmpEl.find('td').each(function(i, el) {
					$(this).text('');
				});
				$tmpEl.selectmenu('refresh'); */
			}
		}

		var $bl = $addBlock.clone().appendTo($('#input_data .blocks'));
		var materId = $mater.attr('id').split('material-').join('');
		var manufctrId = $manufctr.prop('id')? $manufctr.attr('id').split('manufacturer-').join('') : false;
		var chAvai = materCharactsAvaible(materId, manufctrId);

		$bl.find('select option:not(.not_sel)').remove();
		createOption($bl.find('select.size'), chAvai['size'], 'size');
		createOption($bl.find('select.density'), chAvai['density'], 'density');

		$bl.find('select').selectmenu()
	      .selectmenu( "menuWidget" )
	        .addClass( "overflow" );

        addBlockListeners($bl);
	});

	$(document).on('click','#add_mix', function(e) {
		if($('.form_cont.block').length >= 4) return;

		$addMix.clone().appendTo($('#input_data .mixes')).find('select').selectmenu()
      .selectmenu( "menuWidget" )
        .addClass( "overflow" );
	});



	$('#input_data .mixes select.product').selectmenu({change: function(e, ui) {
		console.log(e, ui)
	}});
	$('#input_data .mixes select.prod_manufacturer').selectmenu({change: function(e, ui) {
		console.log(e, ui)
	}});
	$('#input_data .mixes select.packing').selectmenu({change: function(e, ui) {
		console.log(e, ui)
	}});

	if(enableCalc) showUnvisible();  

	// when selecting delivery
	$('select#delivery_type').selectmenu({change: function(e, ui) {
		var $elem = $(ui.item.element);

		if($elem.attr('name') == 'unloading_delivery' || $elem.attr('name') == 'not_unloading_delivery') {
			$('.forpay').removeClass('unvisible');
		} else {
			$('.forpay').addClass('unvisible');
		}

		console.log(e, ui)
		 
	}});


	//admin page
	$('#navbar a').click(function (e) {
	  e.preventDefault();

	  $.cookie('curr-tab', $(this).attr('href'), { expires: 365, path: '/' });

	  $(this).tab('show');
	})

	$('.dropdown-toggle').dropdown();

	if(typeof $.cookie !== 'undefined') {
		if(typeof $.cookie('curr-tab') !== 'undefined') {
			$('a[href='+$.cookie('curr-tab')+']').tab('show');
		} else {
			$.cookie('curr-tab', '#manufacturers', { expires: 365, path: '/' });
		}
	}

	$('#transport_number_add button').on('click', function(e) {
		e.preventDefault();
		var number_of = $(this).siblings('[name=number_of]');
		if(number_of.val().match(/[0-9]+/) === null) {
			number_of.addClass('incorrect');
			return false;
		} else {
			number_of.removeClass('incorrect');
		}

	// $tbody.parent().removeClass('hide');
		addTransportTable(parseInt(number_of.val()), 'add_transport');
	});

	$(document).on('click','#add_transport button[type=submit]', function(e) {
		e.preventDefault();
		var tableData = getTableData($("#add_transport table"));
		if(tableData === false) return false;

		$.post('ajax.php?addTransport', {'data':tableData}, function(data) {
			$('#add_transport table tbody').empty();
			location.href = location.href;
		});

	});

	$('.transport_list .glyphicon-remove').on('click', function(e) {
		e.preventDefault();

		var $row = $(this).parents('tr');
		var id = $row.attr('name').split('id').join('');
		var thisEl = this;

		if (confirm('Удалить данный транспорт?') === true) {
			$.post('ajax.php?deleteTransport='+id, function(data) {
				$(thisEl).parents('tr').remove();		
		});
		}
	});

	$(document).on('click','.transport_list .glyphicon-pencil', function(e) {
		e.preventDefault();
		var $row = $(this).parents('tr');
		chColsToInput($row);
		$(this).removeClass('glyphicon-pencil').addClass('glyphicon-ok');
	});

	$(document).on('click','.transport_list .glyphicon-ok', function(e) {
		e.preventDefault();

		var tableData = getTableData($('.transport_list table'));
		if(tableData === false) return false;

		var $row = $(this).parents('tr');
		var id = $row.attr('name').split('id').join('');
		chInputToCols($row);
		var thisEl = this;

		$.post('ajax.php?changeTransport='+id, {'data':tableData}, function(data) {
			$(thisEl).removeClass('glyphicon-ok').addClass('glyphicon-pencil');			
		});
	});

});

function initMap() {
	if(typeof ymaps === 'undefined') return;

	ymaps.ready(function () {
	    myMap = new ymaps.Map("ya_map", {
	        center: [55.958437,37.870906],
	        zoom: 10,
	        // type: "yandex#satellite",
	        controls: []
	    });
	    mapObjs['manufacturer'] = new ymaps.Placemark([55.958437,37.870906], {
            balloonContent: '<strong>ПроффСтрой</strong>'
        }, {
            preset: 'islands#icon',
            iconColor: '#0095b6'
        });

	    myMap.geoObjects
        .add(mapObjs['manufacturer']);

		mapAutocomplete();
	});  
	// https://tech.yandex.ru/maps/doc/jsapi/2.1/update/concepts/update-docpage/
	// https://tech.yandex.ru/maps/doc/constructor/concepts/About-docpage/
	// http://meganavigator.com/blogposts/podkluchenie-yandeks-kart-k-saity---bystryi-start

	// may be https://tech.yandex.ru/maps/keys/get/
}

function mapAutocomplete() {
	var suggestView = new ymaps.SuggestView('deliv_address');

	suggestView.events.add('select',function(e) {
		ymaps.geocode(e.get('item').value, {
			results: 1 
		}).then(function (res) {
            // Выбираем первый результат геокодирования.
            var firstGeoObject = res.geoObjects.get(0),
			// Координаты геообъекта.
            coords = firstGeoObject.geometry.getCoordinates(),
            // Область видимости геообъекта.
            bounds = firstGeoObject.properties.get('boundedBy');
			// Добавляем первый найденный геообъект на карту.
            myMap.geoObjects.add(firstGeoObject);
            // Масштабируем карту на область видимости геообъекта.
            myMap.setBounds(bounds, {
                checkZoomRange: true // проверяем наличие тайлов на данном масштабе.
            });
            // debugger;

    		if(typeof mapObjs['goal'] !== 'undefined') myMap.geoObjects.remove(mapObjs['goal']);

            mapObjs['goal'] = firstGeoObject;
            roadWay();
            /**
             * Все данные в виде javascript-объекта.
             */
            console.log('Все данные геообъекта: ', firstGeoObject.properties.getAll());
            /**
             * Метаданные запроса и ответа геокодера.
             * @see https://api.yandex.ru/maps/doc/geocoder/desc/reference/GeocoderResponseMetaData.xml
             */
            console.log('Метаданные ответа геокодера: ', res.metaData);
            /**
             * Метаданные геокодера, возвращаемые для найденного объекта.
             * @see https://api.yandex.ru/maps/doc/geocoder/desc/reference/GeocoderMetaData.xml
             */
            console.log('Метаданные геокодера: ', firstGeoObject.properties.get('metaDataProperty.GeocoderMetaData'));
            /**
             * Точность ответа (precision) возвращается только для домов.
             * @see https://api.yandex.ru/maps/doc/geocoder/desc/reference/precision.xml
             */
            console.log('precision', firstGeoObject.properties.get('metaDataProperty.GeocoderMetaData.precision'));
            /**
             * Тип найденного объекта (kind).
             * @see https://api.yandex.ru/maps/doc/geocoder/desc/reference/kind.xml
             */
            console.log('Тип геообъекта: %s', firstGeoObject.properties.get('metaDataProperty.GeocoderMetaData.kind'));
            console.log('Название объекта: %s', firstGeoObject.properties.get('name'));
            console.log('Описание объекта: %s', firstGeoObject.properties.get('description'));
            console.log('Полное описание объекта: %s', firstGeoObject.properties.get('text'));

            /**
             * Если нужно добавить по найденным геокодером координатам метку со своими стилями и контентом балуна, создаем новую метку по координатам найденной и добавляем ее на карту вместо найденной.
             */
            /**
             var myPlacemark = new ymaps.Placemark(coords, {
             iconContent: 'моя метка',
             balloonContent: 'Содержимое балуна <strong>моей метки</strong>'
             }, {
             preset: 'islands#violetStretchyIcon'
             });

             myMap.geoObjects.add(myPlacemark);
             */
        });

	});
}


function showUnvisible() {
	// $( document ).tooltip();

	$( "#date_of_prepayment, #delivery_date, #shipment_date" ).datepicker( $.datepicker.regional[ "ru" ] );

	$(document).on('click', '.close', function(e) {
		$(this).parents('.form_cont').remove();
	});

	$('.unvisible:not(.forpay)').removeClass('unvisible');
	$('#payment_type, #delivery_type, #moskow_way').selectmenu()
	      .selectmenu( "menuWidget" )
	        .addClass( "overflow" );

	//button view  	
	$( "#input_data input[type=submit], #additionally input[type=submit]" )
      .button()
      .click(function( event ) {
        event.preventDefault();
	});	    

	initMap();
	onNumberInInpCh();

}

function addInpData(obj, itemName, val) {
	if(obj.hasOwnProperty(itemName)) {
		return false;
	} else {
		obj[itemName] = val;
	}

	return;
}

function changeKey(obj, id) {
	var result = [];

	for(var i in obj) {
		var el = obj[i];
		result[el[id]] = el;
	}
	return result;
}

function materCharactsAvaible(materId, manufctrId) {
	var arrRes = [];
	var len = inputDataItems.blocks.length;
	var items = inputDataItems.blocks.items[len];
	var manufctrIsset = !manufctrId;
	arrRes['size'] = [];
	arrRes['density'] = [];


	for(var i in items) {
		var el = items[i];
		if(el['pid'] == materId && (manufctrIsset || el['manufacturer_id'] == manufctrId)) {
			arrRes[el['id']] = [];

			arrRes[el['id']] = {'size':el['size'],'density':el['density'],'id':el};
			if (typeof arrRes['size'][el['size']] === 'undefined') arrRes['size'][el['size']] = [];
			if (typeof arrRes['density'][el['density']] === 'undefined') arrRes['density'][el['density']] = [];

			arrRes['size'][el['size']].push(el);
			arrRes['density'][el['density']].push(el);			
		} else {
			console.log(el['pid'],materId,manufctrIsset ,el['manufacturer_id']);
		}
	}

	return arrRes;

}

function createOption($parent, arr, elName) {
	for(var i in arr) {
		var el = arr[i];

		$parent.append($('<option>').data('el', el).attr('name', i).text(i));
	}
}


function createTableSize($parent, $arr) {
	$parent.empty();
	var localArr = ["number_per_pallet","number_per_cubic_meter"];
	$parent.append('<tr><td>'+trArr[localArr[0]]+'</td><td>'+trArr[localArr[1]]+'</td></tr>');

	for(var i in $arr) {
		var $el = $arr[i];
		$parent.append('<tr><td>'+$el[localArr[0]]+'</td><td>'+$el[localArr[1]]+'</td></tr>');
		break;
	}
}

function createTableDensity($parent, $arr) {
	$parent.empty();
	var localArr = ["number_per_pallet","number_per_cubic_meter"];

	for(var i in trArr) {
		var el = trArr[i];
		if(el == localArr[0] || el == localArr[1]) continue;

		var $item = {};

		if(i == 'number_per_cubic_meter') $item = $('<tr name="cubic_per_pallet"><td>Кол-во м<sup>3</sup> на 1 поддоне</td></tr>');
		else $item = $('<tr name="'+i+'"><td>'+el+'</td></tr>');

		for(var j in $arr) {
			var $jEl = $arr[j];
			$item.append('<td>'+$jEl[i]+'</td>');
		}

		$parent.append($item.append('<td>'+trArrHelper[i]+'</td>'));
		
	}
}

function createTableFull($parent, $arr) {
	$parent.empty();
	
	for(var i in trArr) {
		var el = trArr[i]; // el - name, i - key
		$parent.append('<tr name="'+i+'"><td>'+el+'</td><td>'+$arr[i]+'</td><td>'+trArrHelper[i]+'</td></tr>');
		if(i == 'number_per_cubic_meter') $parent.append('<tr name="cubic_per_pallet"><td>Кол-во м<sup>3</sup> на 1 поддоне</td><td>'+($arr['number_per_pallet']/$arr['number_per_cubic_meter']).toFixed(2)+'</td><td>м<sup>3</sup></td></tr>');
	}
}

function addBlockListeners($block) {
	$block.find('select.size').selectmenu({change: function(e, ui) {
		var $elem = $(ui.item.element);

		if($elem.hasClass('not_sel')) return;

		var $tableBody = $elem.parents('.form_cont').find('.characteristic_block tbody');
		if(!bothSelected($elem, true, false, $tableBody)) createTableSize($tableBody, $elem.data('el'));
	}});
	$block.find('select.density').selectmenu({change: function(e, ui) {
		var $elem = $(ui.item.element);

		if($elem.hasClass('not_sel')) return;

		var $tableBody = $elem.parents('.form_cont').find('.characteristic_block tbody');
		if(!bothSelected($elem, false, true, $tableBody)) createTableDensity($tableBody, $elem.data('el'));
	}});
}

function bothSelected($el, size, density, $tableBody) {
	var $parent = $el.parents('.buttons');

	if(size === false) {
		if($parent.find('select.size option:selected').hasClass('not_sel')) {
			return false;
		} 
	} 

	size = $parent.find('select.size option:selected').text();
	

	if(density === false) {
		if($parent.find('select.density option:selected').hasClass('not_sel')) {
			return false;
		} 
	}

	density = $parent.find('select.density option:selected').text();

	var data = $el.data('el');
	for(var i in data) {
		var item = data[i];
		if(item['size']==size && item['density']==density) {
			createTableFull($tableBody, item);
			$parent.parent().find('.number .n').trigger('change');
			return true;
		}
	}
}

function onNumberInInpCh() {
	$(document).on('keypress keyup change','.added_block .number .m3', function(e) {
		var $parent = $(this).parents('.number');
		var $grandpa = $(this).parents('.form_cont');
		var perMeter = $grandpa.find('tr[name=number_per_cubic_meter] td:last').text();
		var perPallet = $grandpa.find('tr[name=number_per_pallet] td:last').text();
		var myVal = $(this).val();
		changeInps($parent,'', perMeter, perPallet, myVal, $grandpa);
	});
	$(document).on('keypress keyup change','.added_block .number .n', function(e) {
		var $parent = $(this).parents('.number');
		var $grandpa = $(this).parents('.form_cont');
		var perMeter = $grandpa.find('tr[name=number_per_cubic_meter] td:last').text();
		var perPallet = $grandpa.find('tr[name=number_per_pallet] td:last').text();
		var myVal = $(this).val();
		changeInps($parent,'number', perMeter, perPallet, myVal, $grandpa);
	});
	$(document).on('keypress keyup change','.added_block .number .pallet', function(e) {
		var $parent = $(this).parents('.number');
		var $grandpa = $(this).parents('.form_cont');
		var perMeter = $grandpa.find('tr[name=number_per_cubic_meter] td:last').text();
		var perPallet = $grandpa.find('tr[name=number_per_pallet] td:last').text();
		var myVal = $(this).val();
		changeInps($parent,'pallet', perMeter, perPallet, myVal, $grandpa);
	});
}

function changeInps($parent, iam,perMeter,perPallet, val, $grandpa) {
	if($grandpa.find('select.size option:selected').hasClass('not_sel') || $grandpa.find('select.density option:selected').hasClass('not_sel')) return false;
	if(isNaN(val)) val = 0;
	if(isNaN(perPallet)) perPallet = 0;
	if(isNaN(perMeter)) perMeter = 0;

	switch(iam) {
		case 'pallet':
			$parent.find('.n').val(Math.ceil(perPallet*val));
			$parent.find('.m3').val( ((perPallet/perMeter)*val).toFixed(2) );
		break;
		case 'number':
			$parent.find('.m3').val( (val/perMeter).toFixed(2) );			
			$parent.find('.pallet').val(Math.ceil(val/perPallet));
		break;
		default:
			$parent.find('.n').val(Math.ceil(perMeter*val));
			$parent.find('.pallet').val( Math.ceil((val*perMeter)/perPallet) );
		break;
	}
	return;
}

function roadWay() {

    // Добавим на карту схему проезда
    // от улицы Крылатские холмы до станции метро "Кунцевская"
    // через станцию "Молодежная" и затем до станции "Пионерская".
    // Точки маршрута можно задавать 3 способами:
    // как строка, как объект или как массив геокоординат.
    ymaps.route([
        mapObjs['manufacturer'].geometry.getCoordinates().toString(),mapObjs['goal'].geometry.getCoordinates().toString()
    ]).then(function (route) {
    	if(typeof custmRoutersHelper['route'] !== 'undefined') myMap.geoObjects.remove(custmRoutersHelper['route']);

    	custmRoutersHelper['route'] = route;
    	var routeLen = route.getLength();
    	$('#route_length').text( (routeLen/100).toFixed(1) + ' км');

        myMap.geoObjects.add(route);

        // Зададим содержание иконок начальной и конечной точкам маршрута.
        // С помощью метода getWayPoints() получаем массив точек маршрута.
        // Массив транзитных точек маршрута можно получить с помощью метода getViaPoints.
        var points = route.getWayPoints(),
            lastPoint = points.getLength() - 1;
        // Задаем стиль метки - иконки будут красного цвета, и
        // их изображения будут растягиваться под контент.
        points.options.set('preset', 'islands#redStretchyIcon');
        // Задаем контент меток в начальной и конечной точках.
        points.get(0).properties.set('iconContent', 'Точка отправления');
        points.get(lastPoint).properties.set('iconContent', 'Точка прибытия');

        // Проанализируем маршрут по сегментам.
        // Сегмент - участок маршрута, который нужно проехать до следующего
        // изменения направления движения.
        // Для того, чтобы получить сегменты маршрута, сначала необходимо получить
        // отдельно каждый путь маршрута.
        // Весь маршрут делится на два пути:
        // 1) от улицы Крылатские холмы до станции "Кунцевская";
        // 2) от станции "Кунцевская" до "Пионерская".

        // var moveList = 'Трогаемся,</br>',
        //     way,
        //     segments;
        // // Получаем массив путей.
        // for (var i = 0; i < route.getPaths().getLength(); i++) {
        //     way = route.getPaths().get(i);
        //     segments = way.getSegments();
        //     for (var j = 0; j < segments.length; j++) {
        //         var street = segments[j].getStreet();
        //         moveList += ('Едем ' + segments[j].getHumanAction() + (street ? ' на ' + street : '') + ', проезжаем ' + segments[j].getLength() + ' м.,');
        //         moveList += '</br>'
        //     }
        // }
        // moveList += 'Останавливаемся.';
        // // Выводим маршрутный лист.
        // $('#list').append(moveList);
    }, function (error) {
        alert('Возникла ошибка: ' + error.message);
    }).then(function() {
    	myMap.setBounds(myMap.geoObjects.getBounds());
    });

}


function addTransportTable(n, id) {
	var $tbody = $('#'+id + ' tbody');

	if( !(n>0) ) return;

	var cols = 10;


	for(var i = 1; i <= n; i++) {
		var $row = $('<tr>');

		$row.append('<td>'+i+'</td>')

		for(var j = 1; j < cols; j++) {
			var $inp = $('<input type="text" name="'+addTransportCols[j]+'[]" class="edited ">');

			// if(j != 1 && j != 3) $inp.addClass('col-lg-2 col-md-2 col-sm-2');

			$row.append($('<td>').append($inp));
		}

		$tbody.append($row);
	}

	$tbody.parents('div').removeClass('hide').find('td input.edited').eq(0).focus();
	return $tbody.parent();
}

function getTableData($table) {
	var values = {};
	var rowVal = '';

	$table.find('tbody tr').each(function(i, el){

		rowVal = getRowData($(el));

		if(rowVal !== false) {
			values[i] = rowVal;
		}
	});

	if($table.find('.incorrect').length == 0) {
		return values;
	} else {
		return false;
	}
}

function getRowData($row) {
	var edited = false;
	var values = {};
	var name = '';
	var val = '';
	var hasEmpty = false;

	$row.find('td input').removeClass('incorrect').each(function(i, el){
		name = $(el).attr('name').split('[]').join('');
		val = $(el).val();

		if(val.length > 0 && edited === false) {
			edited = true;
		}

		if(edited !== false && val.length == 0) {
			$(el).addClass('incorrect');
			hasEmpty = true;			
		}

		values[name] = val;
	});

	return (edited === true && hasEmpty === false)? values : false;
}

function chColsToInput($row) {
	var $newCol = '';

	$row.find('td[name]').each(function(i, el) {
		// debugger;
		$newCol = $('<input>');
		$newCol.attr('name', $(el).attr('name')).addClass('edited');
		$newCol.val($(el).text());

		$(el).empty().append($newCol);
	});
}

function chInputToCols($row) {
	var $newCol = '';

	$row.find('input[name]').each(function(i, el) {
		var text = $(el).val();
		$(el).parent().empty().text(text);
	});
}