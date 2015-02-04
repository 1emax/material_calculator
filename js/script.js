  $(function() {
  	$( "#radio" ).buttonset();
  	$( "input[type=submit]" )
      .button()
      .click(function( event ) {
        event.preventDefault();
      });
  });