"use strict";
var debugMessage = '';

$(function() {
	//radio button view
	$( "#radio" ).buttonset();

	//button view  	
	$( "input[type=submit]" )
      .button()
      .click(function( event ) {
        event.preventDefault();
	});

    $( "#category, #material, #manufacturer" )
      .selectmenu()
      .selectmenu( "menuWidget" )
        .addClass( "overflow" );

    $("#material, #manufacturer" )
      .selectmenu("option", "disabled", true);

    $( document ).tooltip();

	$('input#phone_number').mask("+7 (999) 999-99-99");

	$( "#date_of_prepayment, #delivery_date, #shipment_date" ).datepicker( $.datepicker.regional[ "ru" ] );

	$('input#individual, input#legal').on('click', function(e) {
		var isLegal = $('input#legal').is(':checked');

		if(isLegal === true) {
			$('#company_name').removeClass('hide');
		} else {
			$('#company_name').addClass('hide');
		}
	});

	$('.close').on('click', function(e) {
		$(this).parents('.form_cont').remove();
	});

	$('#category').selectmenu({change: function(e, ui) {
		var $elem = $(ui.item.element);

		if(!$elem.prop('id')) return;

		var parentId = $elem.parent().attr('id');

		var id = $elem.attr('id').split(parentId + '-').join('');
		console.log(id,parentId);

		$.post('ajax.php?getItems', {'type':parentId, 'id':id}, function(data) {
			var $materialEl = $('#material');
			$materialEl.selectmenu('disable').find(':not(.not_sel)').remove();
			$('#manufacturer').selectmenu('disable').find(':not(.not_sel)').remove();

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

	$('#material').selectmenu({change: function(e, ui) {
		var $elem = $(ui.item.element);

		if(!$elem.prop('id')) return;

		var parentId = $elem.parent().attr('id');
		var id = $elem.attr('id').split(parentId + '-').join('');
		// var id = $('#category option:selected').attr('id').split(parentId + '-').join('');
		console.log(id,parentId);

		$.post('ajax.php?getItems', {'type':parentId, 'id':id}, function(data) {
			var $manufacturerEl = $('#manufacturer');
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

    

});
