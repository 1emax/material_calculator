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

    // $("#material, #manufacturer" )
      // .selectmenu("option", "disabled", true);

});
