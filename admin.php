<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
	<title>Настройки</title>
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1">
	<script src="js/jquery-2.1.3.min.js"></script>

	<!-- Latest compiled and minified CSS -->
	<link rel="stylesheet" href="css/bootstrap.min.css">

	<!-- Optional theme -->
	<link rel="stylesheet" href="css/bootstrap-theme.min.css">

	<link rel="stylesheet" href="css/jquery-ui.css">
	<!-- move css to css folder -->
	<link rel="stylesheet" href="css/style.css">
	<!-- Custom styles for admin template -->
    <link href="css/dashboard.css" rel="stylesheet">

	<!-- Latest compiled and minified JavaScript -->
	<script src="js/bootstrap.min.js"></script>

	<script src="js/jquery.cookie.js"></script>
	<script src="js/script.js"></script>
	<script src="js/jquery-ui/jquery-ui.js"></script>
	<script src="js/jquery.maskedinput.min.js"></script>
	<script src="js/jquery-ui/datepicker-ru.js"></script>

	<!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
</head>
<body>
<?php
include(__DIR__ . '/index.php');
?>


<nav class="navbar navbar-inverse navbar-fixed-top">
  <div class="container-fluid">
    <div class="navbar-header">
      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
        <span class="sr-only">Toggle navigation</span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <span class="navbar-brand">Настройки</span>
    </div>
    <div id="navbar" class="navbar-collapse collapse">
      <ul class="nav navbar-nav navbar-right nav-tabs" role="tablist">
        <li class="active"><a href="#manufacturers" aria-controls="manufacturers" role="tab" data-toggle="tab" class="current-tab">Производители</a></li>
        <li><a href="#transport" aria-controls="transport" role="tab" data-toggle="tab">Транспорт</a></li>
        <li><a href="#other" aria-controls="other" role="tab" data-toggle="tab">Оплата/доставка</a></li>
      </ul>
    </div>
  </div>
</nav>


<div class="tab-content">

<div role="tabpanel" class="tab-pane fade in active container-fluid" id="manufacturers">
  <div class="row">
    <div class="col-sm-3 col-md-2 sidebar">
      <ul class="nav nav-sidebar">
        <li class="active"><a href="#">Продукция <span class="sr-only">(current)</span></a></li>
        <!-- <li><a href="#">Reports</a></li>
        <li><a href="#">Analytics</a></li>
        <li><a href="#">Export</a></li> -->
      </ul>
      <!-- <ul class="nav nav-sidebar">
        <li><a href="">Nav item</a></li>
        <li><a href="">Nav item again</a></li>
        <li><a href="">One more nav</a></li>
        <li><a href="">Another nav item</a></li>
        <li><a href="">More navigation</a></li>
      </ul>
      <ul class="nav nav-sidebar">
        <li><a href="">Nav item again</a></li>
        <li><a href="">One more nav</a></li>
        <li><a href="">Another nav item</a></li>
      </ul> -->
    </div>
    <div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
      <h1 class="page-header">Производители</h1> 

	  <ul class="nav nav-pills" role="tablist">
      <li class="dropdown">
		  <a id="dLabel" data-target="#" class="dropdown-toggle" href="http://example.com" data-toggle="dropdown" aria-haspopup="true" role="button" aria-expanded="false">
		    ПроффСтрой
		    <span class="caret"></span>
		  </a>

		  <ul class="dropdown-menu" role="menu" aria-labelledby="dLabel">
		  <li><a role="menuitem" tabindex="-1" href="https://twitter.com/fat">ПроффСтрой</a></li>
		  </ul>
	  </li></ul>
<br>
<br>
	  

      <!-- <h2 class="sub-header">Section title</h2> -->
      

            

        <div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
        <?php 
        $materials=$Calc->getMaterials(1); 
        $matIds = array_map('getIds', $materials);
		$charactsRaw = $Calc->MaterialsCharct(implode($matIds, "','")); 
		$characts = charactByPid($charactsRaw);

        foreach($materials as $k => $material) { 
        	?>

		  <div class="panel panel-default">
		    <div class="panel-heading" role="tab" id="head<?php echo 'prod'.$material['id'];?>">
		      <h4 class="panel-title">
		        <a class="collapsed" data-toggle="collapse" data-parent="#accordion" href="#<?php echo 'prod'.$material['id'];?>" aria-expanded="false" aria-controls="<?php echo 'prod'.$material['id'];?>" name="<?php echo $material['id']; ?>">
		        <?php 
				
					$prodN = isset($characts[$material['id']]) ? count($characts[$material['id']]) : 0;
				?>
		          <?php echo ($k+1) . '. ' . $material['name'] . ' ('.$prodN.')' ; ?>
		        </a>
		      </h4>
		    </div>
		    <div id="<?php echo 'prod'.$material['id'];?>" class="panel-collapse collapse" role="tabpanel" aria-labelledby="head<?php echo 'prod'.$material['id'];?>">
		      <div class="panel-body">
		      <?php if($prodN > 0) { ?> 
		        <div class="table-responsive">

		        	<?php 
		        	$oneProdCharacts = $characts[$material['id']]; //print_r($oneProdCharacts);
		        	?>
			        <table class="table table-striped">
			          <thead>
			            <tr>
			              <th>#</th>
			              <th>Название</th>
			              <th>Цена (1 м<sup>3</sup>)</th>
			              <th></th>
			              <th></th>
			            </tr>
			          </thead>
			          <tbody>
			          <?php $oneCounter = 1; foreach($oneProdCharacts as $oneN => $oneProdCharact) { ?>
			          <tr>
			              <td><?php echo $oneCounter++; ?></td>
			              <td name="<?php echo $oneN; ?>"><?php echo 'D' . $oneN; ?></td>
			              <td>2.590</td>
			              <td><a href="#">Изменить</a></td>
			              <td><a href="#">Удалить</a></td>
			           </tr>
			           <?php } ?>
			          </tbody>
			        </table>
      			</div>
      			<?php } ?>
		      </div>
		    </div>
		  </div>
            <?php } ?>		  
		  
		</div>

    </div>
  </div>
</div>



<div role="tabpanel" class="tab-pane fade container-fluid" id="transport">
  <div class="row">
     
    <div class="col-sm-9 col-md-10 main">
      <h1 class="page-header">Транспорт</h1>

      <div class="">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Наименование</th>
              <th>Грузоподъемность</th>
              <th>Габариты автомобиля</th>
              <th>Поддоны</th>
              <th>Ставка</th>
              <th>За км от МКАД</th>
              <th>МКАД</th>
              <th>ТТК</th>
              <th>Садовое кольцо</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1,001</td>
              <td>Lorem</td>
              <td>ipsum</td>
              <td>dolor</td>
              <td>dolor</td>
              <td>dolor</td>
              <td>dolor</td>
              <td>dolor</td>
              <td>dolor</td>
              <td>sit</td>
            </tr>
            <tr>
              <td>1,002</td>
              <td>amet</td>
              <td>consectetur</td>
              <td>adipiscing</td>
              <td>elit</td>
              <td>elit</td>
              <td>elit</td>
              <td>elit</td>
              <td>elit</td>
              <td>elit</td>
            </tr>
            <tr>
              <td>1,003</td>
              <td>Integer</td>
              <td>nec</td>
              <td>odio</td>
              <td>Praesent</td>
              <td>Praesent</td>
              <td>Praesent</td>
              <td>Praesent</td>
              <td>Praesent</td>
              <td>Praesent</td>
            </tr>
            <tr>
              <td>1,003</td>
              <td>libero</td>
              <td>Sed</td>
              <td>cursus</td>
              <td>ante</td>
              <td>ante</td>
              <td>ante</td>
              <td>ante</td>
              <td>ante</td>
              <td>ante</td>
            </tr>
            <tr>
              <td>1,004</td>
              <td>dapibus</td>
              <td>diam</td>
              <td>Sed</td>
              <td>nisi</td>
              <td>nisi</td>
              <td>nisi</td>
              <td>nisi</td>
              <td>nisi</td>
              <td>nisi</td>
            </tr>
            <tr>
              <td>1,005</td>
              <td>Nulla</td>
              <td>quis</td>
              <td>sem</td>
              <td>at</td>
              <td>at</td>
              <td>at</td>
              <td>at</td>
              <td>at</td>
              <td>at</td>
            </tr>
            
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>



<div role="tabpanel" class="tab-pane fade container-fluid" id="other">
  <div class="row">
    <div class="col-sm-3 col-md-2 sidebar">
      <ul class="nav nav-sidebar">
        <li class="active"><a href="#">Overview <span class="sr-only">(current)</span></a></li>
        <li><a href="#">Reports</a></li>
        <li><a href="#">Analytics</a></li>
        <li><a href="#">Export</a></li>
      </ul>
      <ul class="nav nav-sidebar">
        <li><a href="">Nav item</a></li>
        <li><a href="">Nav item again</a></li>
        <li><a href="">One more nav</a></li>
        <li><a href="">Another nav item</a></li>
        <li><a href="">More navigation</a></li>
      </ul>
      <ul class="nav nav-sidebar">
        <li><a href="">Nav item again</a></li>
        <li><a href="">One more nav</a></li>
        <li><a href="">Another nav item</a></li>
      </ul>
    </div>
    <div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
      <h1 class="page-header">Оплата и доставка</h1>

      <h2 class="sub-header">Section title</h2>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Header</th>
              <th>Header</th>
              <th>Header</th>
              <th>Header</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1,001</td>
              <td>Lorem</td>
              <td>ipsum</td>
              <td>dolor</td>
              <td>sit</td>
            </tr>
            <tr>
              <td>1,002</td>
              <td>amet</td>
              <td>consectetur</td>
              <td>adipiscing</td>
              <td>elit</td>
            </tr>
            <tr>
              <td>1,003</td>
              <td>Integer</td>
              <td>nec</td>
              <td>odio</td>
              <td>Praesent</td>
            </tr>
            <tr>
              <td>1,003</td>
              <td>libero</td>
              <td>Sed</td>
              <td>cursus</td>
              <td>ante</td>
            </tr>
            <tr>
              <td>1,004</td>
              <td>dapibus</td>
              <td>diam</td>
              <td>Sed</td>
              <td>nisi</td>
            </tr>
            <tr>
              <td>1,005</td>
              <td>Nulla</td>
              <td>quis</td>
              <td>sem</td>
              <td>at</td>
            </tr>
            <tr>
              <td>1,006</td>
              <td>nibh</td>
              <td>elementum</td>
              <td>imperdiet</td>
              <td>Duis</td>
            </tr>
            <tr>
              <td>1,007</td>
              <td>sagittis</td>
              <td>ipsum</td>
              <td>Praesent</td>
              <td>mauris</td>
            </tr>
            <tr>
              <td>1,008</td>
              <td>Fusce</td>
              <td>nec</td>
              <td>tellus</td>
              <td>sed</td>
            </tr>
            <tr>
              <td>1,009</td>
              <td>augue</td>
              <td>semper</td>
              <td>porta</td>
              <td>Mauris</td>
            </tr>
            <tr>
              <td>1,010</td>
              <td>massa</td>
              <td>Vestibulum</td>
              <td>lacinia</td>
              <td>arcu</td>
            </tr>
            <tr>
              <td>1,011</td>
              <td>eget</td>
              <td>nulla</td>
              <td>Class</td>
              <td>aptent</td>
            </tr>
            <tr>
              <td>1,012</td>
              <td>taciti</td>
              <td>sociosqu</td>
              <td>ad</td>
              <td>litora</td>
            </tr>
            <tr>
              <td>1,013</td>
              <td>torquent</td>
              <td>per</td>
              <td>conubia</td>
              <td>nostra</td>
            </tr>
            <tr>
              <td>1,014</td>
              <td>per</td>
              <td>inceptos</td>
              <td>himenaeos</td>
              <td>Curabitur</td>
            </tr>
            <tr>
              <td>1,015</td>
              <td>sodales</td>
              <td>ligula</td>
              <td>in</td>
              <td>libero</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

</div>
</body>
</html>

<?php
function getIds($val) {

	return $val['id'];
}

function charactByPid($charct) {
	$res = array();

	foreach ($charct as $value) {
		$res[$value['pid']][$value['density']] = $value;
	}

	return $res;
}

?>