/*jshint multistr: true */
/* jshint -W097 */
/*global $:false */
/*jslint browser:true */
/*jslint devel:true */
"use strict";
var debugMessage = '';
var enableCalc = false;
var mapObjs = {};
var custmRoutersHelper = {};
var tempRequestContainer = {};
var transpRequestStack = {};

var $addBlock = {};
var $addMix = {};
var inputDataItems = {"blocks": {"length": 0,"items": {}},"mixes": {"length": 0,"items": {}}};
var trArr = {"number_per_pallet":"Кол-во штук на 1 поддоне",	"number_per_cubic_meter":"Кол-во штук в 1 м<sup>3</sup>",	"weight":"Вес блока",	"weight_pallet_and_block":"Вес поддона с блоками",	"strength_class":"Класс прочности", "breaking_strength":"Предел прочности", "thermal_conductivity":"Теплопроводность",	"frost_resistance":"Морозостойкость"};
var trArrHelper = {"number_per_pallet":"шт",	"number_per_cubic_meter":"шт",	"weight":"кг",	"weight_pallet_and_block":"кг",	"strength_class":"-", "breaking_strength":"кг/см<sup>2</sup>", "thermal_conductivity":"Вт/м*C<sup>0</sup>",	"frost_resistance":"Циклов"};
var addTransportCols = ['',	'name','capacity','dimensions','pallets','rate','mcad','inside_mcad','inside_ttk','inside_sad_kolco'];
var btnsObj = $('<td><span class="glyphicon glyphicon-pencil" aria-hidden="true" title="Редактировать"></td>');
var isAdmin = false;
var gluePrice = 240;
var palletPrice = 150;
var lastTime = new Date().getTime();
var eventsTimeouts = {};
var vehiclesWithUnloadPrice = 2000;


var blockAdd ='\
<tr class="numbers-row">\
	<td rowspan="2" class="rowspaned material-name"></td>\
	<td rowspan="2" class="rowspaned material-size"></td>\
	<td rowspan="2" class="rowspaned material-density"></td>\
	<td>шт.</td>\
	<td class="material_number"></td>\
	<td class="material_price"></td>\
	<td rowspan="2" class="material_comn_price"></td>\
</tr>\
<tr class="meters-row">\
	<td>м<sup>3</sup></td>\
	<td class="material_number"></td>\
	<td class="material_price"></td>\
</tr>';
var justTableRow = '\
<tr class="numbers-row">\
	<td colspan="3" class="service-name"></td>\
	<td colspan="1" class="service-type"></td>\
	<td colspan="1" class="material_number"></td>\
	<td colspan="1" class="material_price"></td>\
	<td colspan="1" class="material_comn_price"></td>\
</tr>';

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

			if(data!==null && data.items !== null &&  data.items.length !== 0) {

				var materials = data.items;

				for(var i in materials) {
					var el = materials[i];
					$materialEl.append('<option id="material-'+el.id+'">'+el.name + '</option>');
				}

				$materialEl.selectmenu('refresh').selectmenu('enable');

				if(data.characts !== null &&  data.characts.length !== 0) {
					var characts = data.characts;
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

			if(data!==null && data.items !== null &&  data.items.length !== 0) {

				var manufacturers = data.items;

				for(var i in manufacturers) {
					var el = manufacturers[i];
					$manufacturerEl.append('<option id="manufacturer-'+el.id+'">'+el.name + '</option>');
				}

				$manufacturerEl.selectmenu('refresh').selectmenu('enable');
				$('#add_mix').removeClass('hide');
			}


		}, 'json');
	}});

	// block input data
	$(document).on('click','#add_block', function(e){
		var blocksNumber = $('.form_cont.block').length;
		if(blocksNumber >= 4) return;

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
		createOption($bl.find('select.size'), chAvai.size, 'size');
		createOption($bl.find('select.density'), chAvai.density, 'density');

		if(blocksNumber > 1) {
			blocksNumber = $('.blocks .block form:last').attr('name');
		}

		$bl.find('form').attr('name', blocksNumber+1);

		$bl.find('select').selectmenu()
	      .selectmenu( "menuWidget" )
	        .addClass( "overflow" );

        addBlockListeners($bl);
	});

	$(document).on('click','#add_mix', function(e) {
		if($('.form_cont.block').length >= 4) return;

		var $selects = $addMix.clone().appendTo($('#input_data .mixes')).find('select');
		$selects.selectmenu()
      .selectmenu( "menuWidget" )
        .addClass( "overflow" );

       $selects.selectmenu({change: changedMixUiSel});

       
       var $nEl = $selects.parents('form').find('.number .n');

	   $nEl.on('keypress keyup change', function() {

	   			(function(self) {
	   				if($(self).attr('oldval') == $(self).val()) {
	   				return false;
	   			}
	   				$(self).attr('oldval', $(self).val());
					startEventAfter(function(){$(self).trigger('mixchanged');}, 'mixchanged', 250);
	   			} (this));

	   });
	});

	if(enableCalc) showUnvisible();  

	// when selecting delivery
	$('select#delivery_type').selectmenu({change: function(e, ui) {
		var $elem = $(ui.item.element);
		$('#date_of_prepayment, #shipment_date').addClass('hide');

		if($elem.attr('id') == 'unloading_delivery' || $elem.attr('id') == 'not_unloading_delivery') {
			$('.forpay').removeClass('unvisible');
			$('#order_detail_delivery').trigger('tablechanged');
			$('#transport').trigger('changesfortransport');
			$('#date_of_prepayment').removeClass('hide');
		} else {
			$('.forpay').addClass('unvisible');
		}

		if($elem.attr('id') == 'pickup') {			
			$('#shipment_date').removeClass('hide');
		}

		// console.log(e, ui)
		 
	}});

	$('select#payment_type').selectmenu({change: function(e, ui) {
		var $elem = $(ui.item.element);

		if($elem.attr('id') == 'pay_on_object') {
			$('#delivery_date').removeClass('hide');
		} else {
			$('#delivery_date').addClass('hide');
		}
	}});

	


	//admin page
    isAdmin = $('.modal-body .admin-coords').length > 0? true : false;

	$('#navbar a').click(function (e) {
	  e.preventDefault();

	  $.cookie('curr-tab', $(this).attr('href'), { expires: 365, path: window.location.pathname });

	  $(this).tab('show');
	});

	$('.dropdown-toggle').dropdown();

	if(typeof $.cookie !== 'undefined') {
		if(typeof $.cookie('curr-tab') !== 'undefined') {
			$('a[href='+$.cookie('curr-tab')+']').tab('show');
		} else {
			$.cookie('curr-tab', '#manufacturers', { expires: 365, path: window.location.pathname });
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

	$('#for-admin-payment, #for-admin-delivery').on('click', function(e) {
		e.preventDefault();
		var id = $(this).attr('id').split('for-').join('');
		console.log(id);
		if(typeof id === 'undefined') return;

		var $row = addCustomRow($('#'+id + ' table'), 1, ['name'], btnsObj);
		chColsToInput($row);
		$row.find('.glyphicon-pencil').removeClass('glyphicon-pencil').addClass('glyphicon-ok');
	});

	$(document).on('click','#admin-payment .glyphicon-pencil, #admin-delivery .glyphicon-pencil', function(e) {
		e.preventDefault();
		var $row = $(this).parents('tr');
		chColsToInput($row);
		$(this).removeClass('glyphicon-pencil').addClass('glyphicon-ok');
	});

	$(document).on('click', '#admin-payment .glyphicon-ok, #admin-delivery .glyphicon-ok', function(e) {
		e.preventDefault();
		var $row = $(this).parents('tr');
		var id = '';

		if(typeof $row.attr('name') == 'undefined') {
			console.log(false);
		} else {
			id = $row.attr('name').split('id').join('');
		}

		var action = $row.parents('div').attr('id');
		var rowData = getRowData($row);
		var thisEl = this;
		chInputToCols($row);
		if(rowData === false) return;

		$.post('ajax.php?change-'+action+'='+id, {'data':rowData}, function(data) {
			$(thisEl).removeClass('glyphicon-ok').addClass('glyphicon-pencil');			
		});

	});

	$('#admin-payment .glyphicon-remove, #admin-delivery .glyphicon-remove').on('click', function(e) {
		e.preventDefault();

		var $row = $(this).parents('tr');
		var id = '';
		var thisEl = this;

		if(typeof $row.attr('name') == 'undefined') {
			console.log(false);
		} else {
			id = $row.attr('name').split('id').join('');
		}

		var action = $row.parents('div').attr('id');

		if (confirm('Вы уверенны, что хотите удалить этот пункт?') === true) {
			$.post('ajax.php?delete-'+action+'='+id, function(data) {
				$(thisEl).parents('tr').remove();		
			});
		}
	});

	$(document).on('click', '#manufacturers .nav-sidebar li a', function(e) {
		e.preventDefault();
		var $curTabs = $('#manufacturers .sub-tab');
		var href = $(this).attr('href');
		if(href == '#' + $curTabs.filter(':not(.hide)').attr('id')) return;

		$curTabs.addClass('hide');
		$curTabs.filter(href).removeClass('hide');
		$(this).parent().addClass('active').siblings('li').removeClass('active');
	});

	$('#for-admin-addmnanufacturer').on('click', function(e) {
		e.preventDefault();
		$('#manufacturer-modal').modal();
		$('#myModalLabel').text('Добавить производителя');

		clearModal($('#manufacturer-modal'));	    
	});

	$('.manuf_change').on('click', function(e) {
		e.preventDefault();
		$('#manufacturer-modal').modal();

		clearModal($('#manufacturer-modal'));

		$('#myModalLabel').text('Изменить производителя');
		var id = $(this).parents('tr').attr('name').split('id').join('');
		$('#manufacturer-modal .modal-body').attr('parent', id);
		

	    $('#manuf_name').val($(this).parent().siblings('[name=name]').text());
	    // debugger;
	    $('#deliv_address').val($(this).parent().siblings('[name=address]').text());
	    // поселок Лесные Поляны, Пушкинский район Центральная улица, 17
		newMapPoint('.admin-coords', $('#deliv_address').val());
		// Костыль от непонятного действия яндекс-карт
		if(isAdmin){
			if(typeof myMap === "undefined") initMap(function() {
				myMap.setBounds(mapObjs.manufacturer.geometry.getBounds(),{
	                checkZoomRange: true // проверяем наличие тайлов на данном масштабе.
	            });
			});			
		}
	});

	$(document).on('click', '#admin_save_manufacturer', function(e) {
		e.preventDefault();
		var parentId = $(this).parent().siblings('.modal-body').attr('parent');
		$(this).parent().siblings('.modal-body').removeAttr('parent');
		var creation = typeof parentId === 'undefined' ? true : false;
		var name = $('#manuf_name').val();
		var address = $('#deliv_address').val();
		var coords = $('.modal-body .admin-coords').text();
		var $tr = $('table tr[name=id'+parentId);
		var action = creation ? 'create' : 'change';
		var data = [];

		if(creation) {
			$tr = addCustomRow($('.manufacturers_list table'), 5, ['name', 'address','coordinates']);
		}

		$tr.find('td[name=name]').text(name);
		$tr.find('td[name=address]').text(address);
		$tr.find('td[name=coordinates]').text(coords);

		data.push({'name':name, 'address':address, 'coordinates':coords});

		$(this).parents('.modal').modal('hide');

		$.post('ajax.php?action='+action+'&type=manufacturer&id='+parentId, {'data': data}, function(data) {
			console.log(data);
		});		
	});
	
	$('.manufacturers_list .manuf_dalete').on('click', function(e) {
		e.preventDefault();

		var $row = $(this).parents('tr');
		var id = '';
		var thisEl = this;

		if(typeof $row.attr('name') == 'undefined') {
			console.log(false);
		} else {
			id = $row.attr('name').split('id').join('');
		}


		if (confirm('Вы уверенны, что хотите удалить этого производителя?') === true) {
			$.post('ajax.php?action=delete&type=manufacturer&id='+id, function(data) {
				$(thisEl).parents('tr').remove();		
			});
		}
	});

	$(document).on('click', '.for-admin-product', function(e) {
		var $table = $(this).parents('.panel-body').find('table');

		var $row = addCustomRow($table, 5, ['length','height','width','density','price'], btnsObj);
		chColsToInput($row);
		$row.find('input').eq(0).focus();
		$row.find('.glyphicon-pencil').removeClass('glyphicon-pencil').addClass('glyphicon-ok');
	});

	$(document).on('click', '#tab-products .glyphicon-ok', function(e) {
		e.preventDefault();
		var $row = $(this).parents('tr');
		var id = '';
		var materialId = $row.parents('.material').attr('id').split('mater').join('');

		if(typeof $row.attr('name') == 'undefined') {
			console.log(false);
		} else {
			id = $row.attr('name').split('id').join('');
		}

		var rowData = getRowData($row);
		var thisEl = this;
		chInputToCols($row);
		if(rowData === false) return;

		var manufacturer_id = $row.parents('#accordion').attr('manufacturerid');

		rowData.product_id = materialId;
		rowData.manufacturer_id = manufacturer_id;
		rowData.price = rowData.price.replace(/[^\/\d]/g,'');
		rowData.size = rowData.width + 'x' + rowData.height + 'x' + rowData.length;
		delete rowData.width;
		delete rowData.height;
		delete rowData.length;

		$(this).removeClass('glyphicon-ok').addClass('glyphicon-pencil');
		$(this).siblings('.admin-characts').removeClass('donotclick');


		$.post('ajax.php?type=product&material_id='+materialId+'&id='+id, {data:rowData}, function(data) {
			console.log(data);
		});
	});

	$(document).on('click', '#tab-products .glyphicon-pencil', function(e) {
		e.preventDefault();
		var $row = $(this).parents('tr');
		chColsToInput($row);
		$row.find('input').eq(0).focus();
		$(this).removeClass('glyphicon-pencil').addClass('glyphicon-ok');
		$(this).siblings('.admin-characts').addClass('donotclick');
	});

	$('#tab-products .glyphicon-remove').on('click', function(e) {
		e.preventDefault();
		var $row = $(this).parents('tr');

		var id = '';
		var thisEl = this;

		if(typeof $row.attr('name') == 'undefined') {
			console.log(false);
		} else {
			id = $row.attr('name').split('id').join('');
		}

		if (confirm('Вы уверенны, что хотите удалить этот продукт?') === true) {
			$.post('ajax.php?deleteProduct='+id, function(data) {
				$(thisEl).parents('tr').remove();		
			});
		}
	});

	$('.admin-characts').on('click', function(e) {
		var $row = $(this).parents('tr');
		var id = $row.attr('name').split('id').join('');
		var $modal = $('#product-modal').modal('show');
		$('#myModalLabelProd').text('Характеристики продукта');
		$modal.find('.modal-body').attr('parent', id);

		var width = parseInt( $row.find('td[name=width]').text() );
		var height = parseInt( $row.find('td[name=height]').text() );
		var length = parseInt( $row.find('td[name=length]').text() );
		var fNumber_per_cubic_meter = Math.ceil( (1.00/(length/1000)/(height/1000)/(width/1000))*100)/100;

		var iNumber_per_pallet = Math.ceil(fNumber_per_cubic_meter * 1.44);


		$.post('ajax.php?getInfo=product_features&id='+id, {data:["number_per_pallet","number_per_cubic_meter","weight","weight_pallet_and_block","strength_class","breaking_strength","thermal_conductivity","frost_resistance"]}, function(data) {
			
			if(typeof data.number_per_pallet !== 'undefined') {
				for(var i in data) {

					if(i == 'number_per_pallet' && (data[i] === '' || data[i] === null) ) data[i] = iNumber_per_pallet;
					if(i == 'number_per_cubic_meter' && (data[i] === '' || data[i] === null) ) data[i] = fNumber_per_cubic_meter;

					$modal.find('div[name='+i + '] input').val(data[i]);
				}
			}

		}, 'json');
	});

	$('#admin_save_prod_charact').on('click', function() {
		var values = {};
		var names = ["number_per_pallet","number_per_cubic_meter","weight","weight_pallet_and_block","strength_class","breaking_strength","thermal_conductivity","frost_resistance"];
		var $modal = $('#product-modal');
		$modal.modal('hide');
		var name = '';
		var hasEmpty = false;
		var id = $(this).parent().siblings('.modal-body').attr('parent');
		var val = '';


		for(var i in names) {
			name = names[i];
			val = $modal.find('div[name='+name + '] input').val();

			if(val !== '' && val.length !== 0) {
				values[name] = val;
			} else {
				hasEmpty = true;
			}
		}

		if(!hasEmpty) $('table tr[name=id'+id+'] .admin-characts').removeClass('not-full');

		$.post('ajax.php?setInfo=product_features&id='+id, {data:values}, function(data) {

		});
	});

	if(!isAdmin) {
		$('#block_discount').on('keypress keyup change', function() {

   			(function(self) {
   				if($(self).attr('oldval') == $(self).val()) {
   				return false;
   			}
   				$(self).attr('oldval', $(self).val());
				startEventAfter(function(){

					var discount = Math.ceil($(self).val().replace(/[^\/\d]/g,''));
					// $(self).trigger('discountchanged');
					$('#order_detail, #order_detail_delivery').each(function(i, el) {
						var $tableEl = $(el);

						$tableEl.find('.meters-row').each(function(subI, subEl) {
							var id = $(subEl).attr('name');
							var $onePriceRow = $(subEl).find('.material_price');
							var blockData = $onePriceRow.data('el');
							$onePriceRow.text(blockData.price - discount);
							$tableEl.find('.numbers-row[name=' + id + '] .material_comn_price').text(Math.ceil( (blockData.price-discount) * blockData.meters*100)/100);
						});
					});
					
					// .data('el', {"price":formData.price, "meters":meters})
					$('#order_detail, #order_detail_delivery').trigger('tablechanged');
					console.log($(self).val());
				}, 'discountchanged', 250);
   			} (this));

	   });
		$(document).on('blockchanged', '.added_block form', function(e) {
			var $form = $(this);
			var formData = $form.data('el');
			var options = $form.find('select option:selected:not(.not_sel)');
			if(options.length != 2) return;

			var meters = parseFloat($form.find('.number .m3').val()).toFixed(2);
			var numbers = Math.ceil( $form.find('.number .n').val());
			var stackNumber = $form.attr('name');
			var discount = Math.ceil($('#block_discount').val().replace(/[^\/\d]/g,''));


			var $currentBlock = $('.meters-row[name='+stackNumber+'],.numbers-row[name='+stackNumber+']');

			if($currentBlock.length === 0) {
				var $lastResultRow = $('#order_detail .meters-row:last, #order_detail_delivery .meters-row:last');
				$currentBlock = $(blockAdd).clone();
				$currentBlock.attr('name', stackNumber);

				if($lastResultRow.length === 0) {
					$('#order_detail table tbody').prepend($currentBlock);
					$('#order_detail_delivery table tbody').prepend($currentBlock.clone());

				} else {
					$lastResultRow.after($currentBlock);
				}

				$currentBlock = $('.meters-row[name='+stackNumber+'],.numbers-row[name='+stackNumber+']');
			}

			var $forNumbers = $currentBlock.filter('.numbers-row');
			var $forMeteres = $currentBlock.filter('.meters-row');

			// number row
			$forNumbers.find('.material-name').text(formData.name);
			$forNumbers.find('.material-size').text(formData.size);
			$forNumbers.find('.material-density').text('D' + formData.density);


			$forNumbers.find('.material_number').text(numbers);
			var nPrice = Math.ceil( (formData.price)/formData.number_per_cubic_meter*100)/100;
			$forNumbers.find('.material_price').text( nPrice );


			$forNumbers.find('.material_comn_price').text(Math.ceil( (formData.price-discount) * meters*100)/100);

			// $forNumbers.find('.material_comn_price').text(Math.ceil(numbers*nPrice*100)/100);



			//meters row
			$forMeteres.find('.material_number').attr('name', formData.density).text(meters);
			$forMeteres.find('.material_price').data('el', {"price":Math.ceil(formData.price), "meters":meters}).text(formData.price - discount);

			$currentBlock.trigger('tablechanged');
		});

		$(document).on('blockdeleted', '.added_block form', function(e) {
			var $form = $(this);
			var stackNumber = $form.attr('name');
			var $currentBlock = $('.meters-row[name='+stackNumber+'],.numbers-row[name='+stackNumber+']');
			var $parent = $currentBlock.parent();
			$currentBlock.remove();
			$parent.trigger('tablechanged');
		});

		$(document).on('tablechanged', '#order_detail, #order_detail_delivery', function(e) {
			var delivType = '';
			if($(this).attr('id') == "order_detail_delivery") {
				delivType = $('select#delivery_type option:selected').attr('id');
				if(delivType != "unloading_delivery" && delivType != "not_unloading_delivery") return;
			}

			var tmpV = 0.00;

			var $row = addTableRow($(this).find('table tbody'), 'pallets', 'Европоддоны', 'шт.', 'mixes', 'meters-row');
			var numbers = countPallets(this);

			$row.find('.material_number').text(numbers);
			$row.find('.material_price').text(palletPrice);
			$row.find('.material_comn_price').text(palletPrice*numbers);
			


			$(this).find('.numbers-row .material_comn_price').each(function(i, el){ 
				var val = $(el).text();
				if(val === '') val = 0;
				tmpV += parseFloat(val);
			});

			tmpV = (Math.ceil(tmpV*100)/100).toString().replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');

			$(this).find('.not_deliv_total_cost').text(tmpV +' руб.');

			if($(this).attr('id') == "order_detail") {
				delivType = $('select#delivery_type option:selected').attr('id');
				if(delivType != "unloading_delivery" && delivType != "not_unloading_delivery") return;

				$('#transport').trigger('changesfortransport');
			}
		});

		$(document).on('mixchanged', '.added_mix form', function(e) {
			//need changes
			var numbers = 0;

			var breakIt = false;
			
			$('.added_mix').each(function(i, el) {
				var options = $(el).find('select option:selected:not(.not_sel)');
				if(options.length != 3) {
					breakIt = true;
					return;
				}

				var tmpNumber = parseInt( $(el).find('.number .n').val() );
				if(tmpNumber > 0) numbers += tmpNumber;
			});
			if(breakIt) return;

			addTableRow($('#order_detail table tbody'), 'mixes', 'Клей для ячеистых бетонов', 'мешок', 'meters-row');
			addTableRow($('#order_detail_delivery table tbody'), 'mixes', 'Клей для ячеистых бетонов', 'мешок', 'meters-row');

			var $rows = $('table tbody .numbers-row.mixes');

			$rows.find('.material_number').text(numbers);
			$rows.find('.material_price').text(gluePrice);
			$rows.find('.material_comn_price').text(gluePrice*numbers);

			$rows.trigger('tablechanged');

		});

		$(document).on('mixdeleted', '.added_mix form', function(e) {
			$(this).find('.number .n').val('');
			$(this).trigger('mixchanged');
		});

		$(document).on('changesfortransport', 'div#transport', function(e) {
			var km2mcad = $('#km2mcad').val();
			var roadData = Math.ceil( km2mcad );
			var palletsData = Math.ceil($('#order_detail tbody .pallets .material_number').text());
			var gluesData = Math.ceil($('#order_detail tbody .mixes .material_number').text());
			var delivType = $('#delivery_type option:selected').attr('id');

			if(delivType != 'unloading_delivery' && delivType != 'not_unloading_delivery') return;

			var cubicMeters = 0.0;

			$('#order_detail .meters-row .material_number').each(function(i, el) {
				cubicMeters += getInpNumeric($(el).text(), 'float') * (Math.ceil($(this).attr('name'))+50);
			});

			cubicMeters += gluesData * 25;
			cubicMeters += palletsData * 20;

			// debugger;

			var cubicMetersWeightData = cubicMeters;

			if(km2mcad === '' || cubicMetersWeightData === 0 || palletsData === 0) return;

			var uniqVal = '' +  roadData.toString()+ palletsData.toString()+ cubicMetersWeightData.toString() + delivType;

			if(delivType == 'unloading_delivery') {
				$('#unloading').parent().removeClass('unvisible');
				$('#unloading').trigger('with_unload');
			} else {
				$('#unloading').parent().addClass('unvisible');
				recalcTransportWithoutUnload();
			}

			if($(this).attr('oldval') == uniqVal) {
				return false;
			} 

			console.log('transport calc changed', $(this).attr('oldval'), uniqVal);
			$(this).attr('oldval', uniqVal);
			var allTransportPrices = 0;

			if(typeof tempRequestContainer.calc == "object") tempRequestContainer.calc.abort();
			if(typeof tempRequestContainer.result == "object") tempRequestContainer.result.abort();


			tempRequestContainer.calc = $.post('calc_win_transports.php', {'road':roadData,'pallets':palletsData,'cubicMetersWeight':cubicMetersWeightData, 'delivType':delivType}, function(data) {

				if(typeof data == 'object') {
					var unique = {};

					for(var i in data) {
						var uniqEl = data[i];
						unique[uniqEl] = uniqEl;
					}

					if(typeof tempRequestContainer.result == "object") tempRequestContainer.result.abort();

					tempRequestContainer.result = $.post('ajax.php?getFew', {ids:unique, table:'transport'}, function(transportObjects) {
						if(typeof transportObjects != 'object') console.log(transportObjects);
						var unique = {};
						var allTransportNumber = 0;
						transportObjects = changeKey(transportObjects, 'id');

						for(var i in data) {
							var uniqEl = data[i];
							allTransportNumber++;
							if(unique.hasOwnProperty(uniqEl)) unique[uniqEl]++;
							else unique[uniqEl] = 1;
						}

						$('table#transportation tbody').empty().parent().data('cubicMeters', cubicMeters).data('pallets', palletsData);

						for(var id in unique) {
							var number = unique[id];
							var transportObject = transportObjects[id];
							transportObject.number = parseInt(number);
							transportObject.oneprice = parseInt(transportObject.rate) + Math.ceil(roadData)*parseInt(transportObject.mcad);
							transportObject.comnprice = transportObject.number *transportObject.oneprice;
							allTransportPrices += transportObject.comnprice;

							addTransportRow(transportObject);
						}

						$('.edit-transport-custom').removeClass('glyphicon-ok').addClass('glyphicon-pencil');

						$('#transportcomnprice').text(allTransportPrices);
						$('#order_detail_delivery table tr.delivery .material_comn_price').text(allTransportPrices);
						$('#order_detail_delivery table tr.delivery .material_number').text(allTransportNumber);


						if(delivType == 'unloading_delivery') {
							$('#unloading').trigger('with_unload');
						} else {
							$('#order_detail_delivery').trigger('tablechanged');
						}
						customTransportToNormal($('table#transportation'));

						console.log(unique);
						console.log(transportObjects);
					}, 'json')
					.always(function() {
						delete tempRequestContainer.result;
					});

				} else {
					console.log(data);
				}
			}, 'json')
			.always(function() {
				delete tempRequestContainer.calc;
			});
		});

		$(document).on('with_unload','#unloading', function(e) {
			if($(this).parent().hasClass('unvisible')) return;

			var vehiclesWithUnload = 0;
			var vehPrices = 0;
			var handlersPrice = 0;

			$('#transportation tr[name]').each(function(i, el) {
				if($(el).find('td[name=name]').text().toLowerCase() == 'бортовой автомобиль') {
					vehiclesWithUnload += Math.ceil( $(el).find('td[name=number]').text() );
					vehPrices += Math.ceil( $(el).find('td[name=comnprice]').text() );
				} else {
					handlersPrice += Math.ceil( $(el).find('td[name=comnprice]').text() );
				}
			});


			$(this).find('td[name=amount_of_work]').text(vehiclesWithUnload);
			$(this).find('td[name=price]').text(vehiclesWithUnloadPrice);
			$(this).find('td[name=comnprice]').text(vehiclesWithUnload*vehiclesWithUnloadPrice);
			var commonPrice = vehPrices + vehiclesWithUnload*vehiclesWithUnloadPrice + handlersPrice;
			$('#transportcomnprice').text(commonPrice);
			$('#order_detail_delivery table tr.delivery .material_comn_price').text(commonPrice);
			$('#order_detail_delivery').trigger('tablechanged');
		});

		$('#checkout').on('click', function(e){
			e.preventDefault();

			if (confirm('Оформить?') !== true) {
				return false;
			}

			if(isEmailValid($('#email')) !== true) {
				$('#email').addClass("error").focus();
				return false;
			}

			if($('#user_name').val().length === 0) {
				$('#user_name').addClass('error').focus();
				return false;
			}

			var formData = {};
			formData.manager_name = $('#manager_name').val();
			formData.pay_deliv_pickup = $('#date_of_prepayment').val() +'/'+ $('#delivery_date').val() +'/'+ $('#shipment_date').val();
			formData.l_n_p = $('#last_name').val() + ' ' + $('#user_name').val() + ' ' + $('#patronymic').val();
			formData.phone_number = $('#phone_number').val();
			formData.email = $('#email').val();


			formData.payment_type = $('#payment_type option:selected').text(); //if .not_sel - do not send
			formData.delivery_type = $('#delivery_type option:selected').text(); //if .not_sel - do not send
			formData.highway = $('#highway').val();
			formData.km2mcad = $('#km2mcad').val();
			formData.deliv_address = $('#deliv_address').val();

			if(!$('#company_name').hasClass('hide')) {
				formData.company_name = $('#company_name').val();
			}

			formData.moskow_way = $('#moskow_way option:selected:not(.not_sel)').val();
			formData.comment = $('#comment').val();

			var $table = '';

			if($('#order_detail_delivery').hasClass('unvisible')){
				$table = $('#order_detail').clone();
			} else {
				$table = $('#order_detail_delivery').clone();
			}

			$table.find('.hide').remove();

			formData.table = $table.html();

			$.post('sendemail.php',jQuery.param(formData), function (data){
				console.log(data);
				window.location.reload();
			});

		});

		$('#clear_order').on('click', function(e) {
			e.preventDefault();
			if (confirm('Очистить форму заказа?') !== true) {
				return false;
			}

			window.location.reload();
		});

		$('#clear_material_order').on('click', function(e) {
			e.preventDefault();
			if (confirm('Очистить форму заказа материала?') !== true) {
				return false;
			}
			$('.close').trigger('click');
			$('#person_data form').append($('#manager_name').clone().attr('type','hidden')).trigger('submit');
		});

		$(document).on('click', '#transportation .delete', function(e) {
			var $table = $(this).parents('table');
			$(this).parents('tr').remove();
			calcLostTransportsWeightNeed($table);
			recalcTransportWithoutUnload();
		});
		$(document).on('click', '#transport td.add', addCustomTransport);
		$(document).on('click', '.edit-transport-custom', function() {
			var $table = $('#transportation');

			if($(this).hasClass('glyphicon-pencil')) {
				$(this).removeClass('glyphicon-pencil').addClass('glyphicon-ok');				
				changeCustomTransportSet($table);
			} else {
				$(this).removeClass('glyphicon-ok').addClass('glyphicon-pencil');
				customTransportToNormal($table);
			}
		});

	} else {
		$('.row .email span.glyphicon-ok').on('click', function(e) {
			e.preventDefault();
			var val = $(this).siblings('#adminsendto').val();

			$.post('ajax.php?changeEmail', {value:val}, function(data) {
				console.log(data);
			});
		});
	}


});

function initMap(func) {
	if(typeof ymaps === 'undefined') return;

	ymaps.ready(function () {
	    myMap = new ymaps.Map("ya_map", {
	        center: [55.958437,37.870906],
	        zoom: 10,
	        // type: "yandex#satellite",
	        controls: []
	    });
	    mapObjs.manufacturer = new ymaps.Placemark([55.958437,37.870906], {
            balloonContent: '<strong>ПроффСтрой</strong>'
        }, {
            preset: 'islands#icon',
            iconColor: '#0095b6'
        });

	    if (!isAdmin) {
	    	myMap.geoObjects
        	.add(mapObjs.manufacturer);
        }

        if(typeof func !== "undefined") func();

		mapAutocomplete();
	});  
	// https://tech.yandex.ru/maps/doc/jsapi/2.1/update/concepts/update-docpage/
	// https://tech.yandex.ru/maps/doc/constructor/concepts/About-docpage/
	// http://meganavigator.com/blogposts/podkluchenie-yandeks-kart-k-saity---bystryi-start

	// may be https://tech.yandex.ru/maps/keys/get/
}

function mapAutocomplete() {
	var suggestView = new ymaps.SuggestView('deliv_address');
	// /admin-address
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

            $('.modal-body .admin-coords').text(coords);

            if(isAdmin) {
    			if(typeof mapObjs.manufacturer !== 'undefined') myMap.geoObjects.remove(mapObjs.manufacturer);


       //      	mapObjs['manufacturer'] = new ymaps.Placemark(coords, {
		     //        balloonContent: '<strong>'+$('#manuf_name').val()+'</strong>'
		     //    }, {
		     //        preset: 'islands#icon',
		     //        iconColor: '#0095b6'
		     //    });



		    	// myMap.geoObjects
	      //   	.add(mapObjs['manufacturer']);

    			// myMap.setBounds(myMap.geoObjects.getBounds(), {
	      //           checkZoomRange: true // проверяем наличие тайлов на данном масштабе.
	      //       });
    			// myMap.setZoom(15);
		        
            }


    		if(typeof mapObjs.goal !== 'undefined') myMap.geoObjects.remove(mapObjs.goal);

            mapObjs.goal = firstGeoObject;

            if(!isAdmin) {
	            roadWay();
	        }
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


function newMapPoint(id, address) {
	
if(typeof myMap === "undefined") initMap();
    // Поиск координат центра Нижнего Новгорода.
    ymaps.geocode(address, {
        /**
         * Опции запроса
         * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/geocode.xml
         */
        // boundedBy: myMap.getBounds(), // Сортировка результатов от центра окна карты
        // strictBounds: true, // Вместе с опцией boundedBy будет искать строго внутри области, указанной в boundedBy
        results: 1 // Если нужен только один результат, экономим трафик пользователей
    }).then(function (res) {
            // Выбираем первый результат геокодирования.
            var firstGeoObject = res.geoObjects.get(0),
                // Координаты геообъекта.
                coords = firstGeoObject.geometry.getCoordinates(),
                // Область видимости геообъекта.
                bounds = firstGeoObject.properties.get('boundedBy');




	         $(id).text(coords);

             if(isAdmin) {

	            
	    			if(typeof mapObjs.manufacturer !== 'undefined') myMap.geoObjects.remove(mapObjs.manufacturer);


	            	mapObjs.manufacturer = new ymaps.Placemark(coords, {
			            balloonContent: '<strong>'+$('#manuf_name').val()+'</strong>'
			        }, {
			            preset: 'islands#icon',
			            iconColor: '#0095b6'
			        });



			    	myMap.geoObjects
		        	.add(mapObjs.manufacturer);

	    			myMap.setBounds(bounds,{
		                checkZoomRange: true // проверяем наличие тайлов на данном масштабе.
		            });
	    			myMap.setZoom(15);
			} else {

	            // Добавляем первый найденный геообъект на карту.
	            myMap.geoObjects.add(firstGeoObject);
	            // Масштабируем карту на область видимости геообъекта.
	            myMap.setBounds(bounds, {
	                checkZoomRange: true // проверяем наличие тайлов на данном масштабе.
	            });
	        }

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



}


function showUnvisible() {
	// $( document ).tooltip();

	$( "#date_of_prepayment, #delivery_date, #shipment_date" ).datepicker( $.datepicker.regional.ru );

	$(document).on('click', '.close', function(e) {
		// var delAfter = false;

		if($(this).parent().hasClass('block')) {
			$(this).siblings('.added_block').find('form').trigger('blockdeleted');
		} else {
			// if(delAfter) 
			$(this).siblings('.added_mix').find('form').trigger('mixdeleted');
			// delAfter = true;
		}

		$(this).parents('.form_cont').remove();

	});

	$('.container>div.unvisible:not(.forpay)').removeClass('unvisible');
	$('#payment_type, #delivery_type, #moskow_way').selectmenu()
	      .selectmenu( "menuWidget" )
	        .addClass( "overflow" );

	//button view  	
	$( "#input_data input[type=submit], #additionally input[type=submit]" )
      .button()
      .click(function( event ) {
        event.preventDefault();
	});

    $('#km2mcad').on('keyup change', function() {
    	var self = this;

   			(function(self) {
   				if($(self).attr('oldval') == $(self).val()) {
	   				return false;
	   			}
   				$(self).attr('oldval', $(self).val());
				startEventAfter(function(){$('#transport').trigger('changesfortransport');}, 'km2mcad', 500);
   			} (this));

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
	var result = {};

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
	arrRes.size = [];
	arrRes.density = [];


	for(var i in items) {
		var el = items[i];
		if(el.pid == materId && (manufctrIsset || el.manuf_id == manufctrId)) {
			arrRes[el.id] = [];

			arrRes[el.id] = {'size':el.size,'density':el.density,'id':el};
			if (typeof arrRes.size[el.size] === 'undefined') arrRes.size[el.size] = [];
			if (typeof arrRes.density[el.density] === 'undefined') arrRes.density[el.density] = [];

			arrRes.size[el.size].push(el);
			arrRes.density[el.density].push(el);			
		} else {
			console.log(el.pid,materId,manufctrIsset ,el.manuf_id);
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
	var localArr = ["number_per_pallet","number_per_cubic_meter", "cubic_per_pallet"];
	$parent.append('<tr><td>'+trArr[localArr[0]]+'</td><td>'+trArr[localArr[1]]+'</td><td>Кол-во м<sup>3</sup> на 1 поддоне</td></tr>');

	for(var i in $arr) {
		var $el = $arr[i];
		$parent.append('<tr><td class="val" name="'+localArr[0]+'">'+$el[localArr[0]]+'</td><td class="val" name="'+localArr[1]+'">'+$el[localArr[1]]+'</td><td class="val" name="'+localArr[2]+'">'+($el.number_per_pallet/$el.number_per_cubic_meter).toFixed(2)+'</td></tr>');
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
	$parent.parents('.form_cont.block').find('form').data('el', $arr);
	
	for(var i in trArr) {
		var el = trArr[i]; // el - name, i - key
		$parent.append('<tr name="'+i+'"><td>'+el+'</td><td  class="val">'+$arr[i]+'</td><td>'+trArrHelper[i]+'</td></tr>');
		if(i == 'number_per_cubic_meter') $parent.append('<tr name="cubic_per_pallet"><td>Кол-во м<sup>3</sup> на 1 поддоне</td><td class="val">'+($arr.number_per_pallet/$arr.number_per_cubic_meter).toFixed(2)+'</td><td>м<sup>3</sup></td></tr>');
	}
}

function addBlockListeners($block) {
	$block.find('select.size').selectmenu({change: function(e, ui) {
		var $elem = $(ui.item.element);

		if($elem.hasClass('not_sel')) return;

		var $tableBody = $elem.parents('.form_cont').find('.characteristic_block tbody');
		if(!bothSelected($elem, true, false, $tableBody)) createTableSize($tableBody, $elem.data('el'));
		correctHTMLBlockHeight(this);
	}});
	$block.find('select.density').selectmenu({change: function(e, ui) {
		var $elem = $(ui.item.element);

		if($elem.hasClass('not_sel')) return;

		var $tableBody = $elem.parents('.form_cont').find('.characteristic_block tbody');
		if(!bothSelected($elem, false, true, $tableBody)) createTableDensity($tableBody, $elem.data('el'));

		correctHTMLBlockHeight(this);
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
			$parent.parent().find('.lastchanged').trigger('change');
			return false;
		} 
	}

	density = $parent.find('select.density option:selected').text();

	var data = $el.data('el');
	for(var i in data) {
		var item = data[i];
		if(item.size==size && item.density==density) {
			createTableFull($tableBody, item);
			var $comnPar = $parent.parent();
			if($comnPar.find('.lastchanged').length === 0) {
				// $comnPar.find('.number .n').trigger('change');
			} else {
				$comnPar.find('.lastchanged').trigger('change');				
			}
			return true;
		}
	}
}

function onNumberInInpCh() {
	$(document).on('keypress keyup change','.added_block .number .m3', function(e) {
		var $parent = $(this).parents('.number');
		var $grandpa = $(this).parents('.form_cont');
		var perMeter = $grandpa.find('tr[name=number_per_cubic_meter] td.val').text();
		perMeter = perMeter === '' ? $grandpa.find('tr td.val[name=number_per_cubic_meter]').text() : perMeter;

		var perPallet = $grandpa.find('tr[name=number_per_pallet] td.val').text();
		perPallet = perPallet === '' ? $grandpa.find('tr td.val[name=number_per_pallet]').text() : perPallet;

		var myVal = $(this).val();	   			
		var self = this;
		startEventAfter(function(){
			changeInps($parent,'', perMeter, perPallet, myVal, $grandpa, self);
	    }, 'changeInps', 150);
		
	});
	$(document).on('keypress keyup change','.added_block .number .n', function(e) {
		var $parent = $(this).parents('.number');
		var $grandpa = $(this).parents('.form_cont');
		var perMeter = $grandpa.find('tr[name=number_per_cubic_meter] td.val').text();
		perMeter = perMeter === '' ? $grandpa.find('tr td.val[name=number_per_cubic_meter]').text() : perMeter;

		var perPallet = $grandpa.find('tr[name=number_per_pallet] td.val').text();
		perPallet = perPallet === '' ? $grandpa.find('tr td.val[name=number_per_pallet]').text() : perPallet;

		var myVal = $(this).val();
		var self = this;
		startEventAfter(function(){
			changeInps($parent,'number', perMeter, perPallet, myVal, $grandpa, self);
	    }, 'changeInps', 150);
		
	});
	$(document).on('keypress keyup change','.added_block .number .pallet', function(e) {
		var $parent = $(this).parents('.number');
		var $grandpa = $(this).parents('.form_cont');
		var perMeter = $grandpa.find('tr[name=number_per_cubic_meter] td.val').text();
		perMeter = perMeter === '' ? $grandpa.find('tr td.val[name=number_per_cubic_meter]').text() : perMeter;

		var perPallet = $grandpa.find('tr[name=number_per_pallet] td.val').text();
		perPallet = perPallet === '' ? $grandpa.find('tr td.val[name=number_per_pallet]').text() : perPallet;

		var myVal = $(this).val();
		var self = this;		
		startEventAfter(function(){
			changeInps($parent,'pallet', perMeter, perPallet, myVal, $grandpa, self);
	    }, 'changeInps', 150);
		
	});
}

function changeInps($parent, iam,perMeter,perPallet, val, $grandpa, self) {
	$(self).parents('div.number').find('input').removeClass('lastchanged');
	$(self).addClass('lastchanged');
	var $sizeSelect = $grandpa.find('select.size option:selected');

	if($sizeSelect.hasClass('not_sel') ) return false; // || $grandpa.find('select.density option:selected').hasClass('not_sel')
	var oldVal = $sizeSelect.attr('name') + $(self).val();
	///////////////////
	if($(self).attr('oldval') == oldVal && $grandpa.find('select option:selected:not(.not_sel)').length == 2 && $parent.parents('.full_opts').length == 0) {
		return false;
	} else if($grandpa.find('select option:selected:not(.not_sel)').length == 2){
		$parent.parents('.full_opts').removeClass('full_opts');
	}

	$(self).attr('oldval', oldVal);
	console.log('changed', $(self).attr('oldval'),oldVal);
	//////////////

	if(val === '' && perPallet === '' && perMeter === '') return;

	if(isNaN(val) || val === '') val = 1;
	if(isNaN(perPallet) || perPallet === '') perPallet = 1;
	if(isNaN(perMeter) || perMeter === '') perMeter = 1;

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
	$parent.trigger('blockchanged');

	return;
}

function roadWay() {

    // Добавим на карту схему проезда
    // от улицы Крылатские холмы до станции метро "Кунцевская"
    // через станцию "Молодежная" и затем до станции "Пионерская".
    // Точки маршрута можно задавать 3 способами:
    // как строка, как объект или как массив геокоординат.
    ymaps.route([
        mapObjs.manufacturer.geometry.getCoordinates().toString(),mapObjs.goal.geometry.getCoordinates().toString()
    ]).then(function (route) {
    	if(typeof custmRoutersHelper.route !== 'undefined') myMap.geoObjects.remove(custmRoutersHelper.route);

    	custmRoutersHelper.route = route;
    	var routeLen = route.getLength();
    	$('#route_length').text( (routeLen/1000).toFixed(1) + ' км');

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

		$row.append('<td>'+i+'</td>');

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

	if($table.find('.incorrect').length === 0) {
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

		if(edited !== false && val.length === 0) {
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

function addCustomRow($table, n, names, buttons) {
	if(typeof buttons === 'undefined') buttons = false;

	var $tbody = $table.find('tbody');
	var $tr = $('<tr>');
	$tr.append('<td>');

	for(var i = 1; i <= n; i++) {
		var $col = $('<td>');
		$col.addClass('edited');

		if(names.length > 0 && typeof names[i-1] !== 'undefined') $col.attr('name', names[i-1]);
		$tr.append($col);
	}

	if(buttons) $tr.append(buttons.clone());
	$tbody.append($tr);

	return $tr;
}

function clearModal($modal) {
	$modal.find('.modal-body').removeAttr('parent');
	$modal.find('input[type=text]').val('');
	$modal.find('.admin-coords').text('');

	if(typeof mapObjs.manufacturer !== 'undefined') myMap.geoObjects.remove(mapObjs.manufacturer);
	if(typeof mapObjs.goal !== 'undefined') myMap.geoObjects.remove(mapObjs.goal);
}

function changedMixUiSel(e, ui) {
	var $elem = $(ui.item.element);
	if($elem.hasClass('not_sel')) return;

	var $parent = $elem.parents('.form_cont');

	var $tableBody = $parent.find('.characteristic_mix tbody');
	$tableBody.removeClass('hide');

	$parent.find('option.not_sel:selected').prop('selected',false).parent().find('option:not(.not_sel):first').prop('selected',true).parent().selectmenu('refresh');

	var $parentBlock = $(this).parents('.added_mix');
	var origHeight = $parentBlock.css('height', '').outerHeight();

	var height = $parentBlock.siblings('.characteristic_mix').height();
	if(origHeight < height) $parentBlock.css('height', height+15);

	var nVal = $parent.find('form .number .n').val();
	if(nVal !== '' && parseInt(nVal) > 0) $parent.find('form').trigger('mixchanged');
	
}

function addTableRow($tbody, classname, name, type, after, hoveNoAfter) {
	var $row = $tbody.find('.'+classname);

	if($row.length === 0) {
		$row = $(justTableRow).clone();
		$row.addClass(classname);
		$row.find('.service-name').text(name);
		$row.find('.service-type').text(type);

		if(after == 'end') {
			$tbody.append($row);
		} else if (typeof after !== "undefined" && $tbody.find('.'+after+':last').length == 1) {
			$tbody.find('.'+after+':last').after($row);
		} else if (typeof hoveNoAfter !== "undefined" && $tbody.find('.'+hoveNoAfter+':last').length == 1) {
			$tbody.find('.'+hoveNoAfter+':last').after($row);			
		} else {
			$tbody.prepend($row);
		}
	}
	return $row;
}


function countPallets(self) {
	var number = 0;

	$('.added_block .number .pallet').each(function(i, el) {
		number += getInpNumeric($(el).val(), 'int');
	});

	$(self).find('tr.mixes .material_number').each(function(i, el) {
		number += Math.ceil( getInpNumeric($(el).text(), 'float') / 50 );
	});

	return number;
}

function getInpNumeric(val, type) {
	var res = 0;

	if(typeof val !== null && val !== '') {
		if(type == 'int') {
			res = Math.ceil(val);
		} else if(type =='float') {
			res = parseFloat(val);
		}
	}

	return res;
}

function addTransportRow(transport) {
	var $table = $('table#transportation');
	var $row = '';

	if($table.find('[name=transport' + transport.id + ']').length > 0) {
		$row = $table.find('[name=transport' + transport.id + ']');
	} else {
		$row = addCustomRow($table, 6, ['capacity','dimensions','pallets','number','oneprice','comnprice']);
		$row.find('td:first').attr('name', 'name');
		$row.attr('name','transport' + transport.id);
		$row.find('.edited').removeClass('edited');
	}

	$row.find('td[name=name]').text(transport.name);
	$row.find('td[name=capacity]').text(transport.capacity);
	$row.find('td[name=dimensions]').text(transport.dimensions);
	$row.find('td[name=pallets]').text(transport.pallets);
	$row.find('td[name=number]').text(transport.number);
	$row.find('td[name=oneprice]').text(transport.oneprice);
	$row.find('td[name=comnprice]').text(transport.comnprice);

	return $row;
}

function startEventAfter(funct, eventName, interv) {
	if(typeof eventsTimeouts.eventName !== 'undefined') clearTimeout(eventsTimeouts.eventName);

	eventsTimeouts.eventName = setTimeout(function(){
		funct();
		delete eventsTimeouts.eventName;
	}, interv);
}

function runTranspRequest(name) {
	if("undefined" === typeof transpRequestStack[name]) return;	
}

function recalcTransportWithoutUnload() {
	var comnprice = 0;

	$('#transportation td[name=comnprice]').each(function(i, el) {
		comnprice += Math.ceil($(el).text());
	});

	$('#transportcomnprice').text(comnprice);
	$('#order_detail_delivery table tr.delivery .material_comn_price').text(comnprice);

}

function getAllTransport(callback) {
	$.post('ajax.php?getAllTransport', function(transports) {
		callback(transports);
	}, 'json');
}

function changeCustomTransportSet($table) {
	$table.find('tbody>tr').append('<td class="delete">x</td>');
	addCustomTransportForm($table);
	calcLostTransportsWeightNeed($table);
}

function addCustomTransportForm($table) {
	var $row = {};

	if($table.find('[name=custom]').length > 0) {
		$row = $table.find('[name=custom]');
	} else {
		$row = addCustomRow($table, 2, ['number', 'action']);
		// ['capacity','dimensions','pallets','number','oneprice','comnprice', 'action']
		$row.attr('name', 'custom');
		$row.find('>td:first').attr('name', 'name').attr('colspan', 6);
	}

	$row.find('[name=action]').text('+').addClass('add');

	var transports = '';
	if(typeof $table.data('transports') !== "undefined") {
		transports = $table.data('transports');
		setTransportSelects($row, transports);
	} else {
		getAllTransport(function(transports) {
			if(transports.length === 0) return;
			$table.data('transports', transports);
			setTransportSelects($row, transports);
		});
	}
}

function setTransportSelects($row, transports) {
	var transport = {};
	var $select = $('<select>');
	$row.find('td[name=name]').empty().append($select);
	$row.find('td[name=number]').empty().append($('<input>').attr('type','text').attr('placeholder', 'Количество').val(1));
	var $option = {};

	for(var i in transports) {
		transport = transports[i];
		$option = $('<option>').val(transport.id);
		$option.data('transport', transport);

		$select.append($option.text(transport.name + ': ' + transport.capacity + 'кг ' + transport.dimensions+ 'м ' + transport.pallets+ 'поддонов ' + transport.rate+ 'р '));
	}
}

function addCustomTransport(self) {
	var transport = $(this).siblings('[name="name"]').find('select option:selected').data('transport');
	var roadData = Math.ceil( $('#km2mcad').val() );
	var number = $(this).siblings('[name="number"]').find('input').val();
	transport.number = parseInt(number);
	transport.oneprice = parseInt(transport.rate) + Math.ceil(roadData)*parseInt(transport.mcad);
	transport.comnprice = transport.number * transport.oneprice;
	var $row = addTransportRow(transport);
	if( $row.find('td.delete').length === 0 )$row.append('<td class="delete">x</td>');
	$(this).parents('tr').appendTo($(this).parents('tbody'));
	calcLostTransportsWeightNeed($row.parents('table'));
	recalcTransportWithoutUnload();
}

function customTransportToNormal($table) {
	$table.find('td.delete, tr[name=custom]').remove();
	$('#transport .transportCubicMeters,#transport .transportPallets').empty();
	manualCalcNeededTransport($table);
	$('#unloading').trigger('with_unload');

}

function transportsAllowWeightAndPallets($table) {
	var cubicMeters = 0.0;
	var pallets = 0;

	$table.find('tbody tr[name]').each(function(i, el) {
		var $el = $(el);
		if($el.attr("name").indexOf("transport") !== -1) {
			var weight = getInpNumeric($el.find('td[name="capacity"]').text(), 'int');
			var number = getInpNumeric($el.find('td[name="number"]').text(), 'int');
			var rowPallets = getInpNumeric($el.find('td[name="pallets"]').text(), 'int');
			cubicMeters += weight * number;
			pallets += rowPallets * number;
		}
	});

	return {'cubicMeters' : cubicMeters, 'pallets' : pallets};
}

function calcLostTransportsWeightNeed($table) {
	var weightAndPallet = transportsAllowWeightAndPallets($table);
	$('.transportCubicMeters').text(' ' + (parseInt($table.data('cubicMeters')) - weightAndPallet.cubicMeters) + 'кг');
	$('.transportPallets').text(' | ' + (parseInt($table.data('pallets')) - weightAndPallet.pallets) + 'шт');	
}

function isEmailValid(input) {
	var email = $(input).val();
	var _err = true;

	if (email.length === 0 || !email.match(/.+@.+\..+/)) {
		_err = "Некорректный e-mail";
		$(input).attr('title', _err);
	}

	return _err;
}

function manualCalcNeededTransport($table) {
	var number = 0;
	var vehPrices = 0;

	$table.find('tr[name]').each(function(i, el) {
		number += Math.ceil( $(el).find('td[name=number]').text() );
		vehPrices += Math.ceil( $(el).find('td[name=comnprice]').text() );
	});

	$('#transportcomnprice').text(vehPrices);
	$('#order_detail_delivery table tr.delivery .material_comn_price').text(vehPrices);
	$('#order_detail_delivery table tr.delivery .material_number').text(number);	
	$('#order_detail_delivery').trigger('tablechanged');


}

function correctHTMLBlockHeight(self) {
	var $parentBlock = $(self).parents('.added_block');
	var origHeight = $parentBlock.css('height', '').outerHeight();

	var height = $parentBlock.siblings('.characteristic_block').height();
	if(origHeight < height) $parentBlock.css('height', height+15);
}