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

    // $("#material, #manufacturer" )
      // .selectmenu("option", "disabled", true);

});