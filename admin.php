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
        <li class="active"><a href="#tab-manufacturers">Производители <span class="sr-only">(current)</span></a></li>
        <li><a href="#tab-products">Продукция</a></li>
        <!-- <li><a href="#">Analytics</a></li>
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
    <div id="tab-manufacturers" class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main sub-tab">
      <h1 class="page-header">Производители</h1> 
    </div>
    <div id="tab-products" class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main hide sub-tab">
      <h1 class="page-header">Продукты</h1> 

	  <ul class="nav nav-pills" role="tablist">
	      <li class="dropdown">
			  <a id="dLabel" data-target="#" class="dropdown-toggle" href="http://example.com" data-toggle="dropdown" aria-haspopup="true" role="button" aria-expanded="false">
			    ПроффСтрой
			    <span class="caret"></span>
			  </a>

			  <ul class="dropdown-menu" role="menu" aria-labelledby="dLabel">
			  <li><a role="menuitem" tabindex="-1" href="https://twitter.com/fat">ПроффСтрой</a></li>
			  </ul>
		  </li>
	  </ul>
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
      <div id="transport_number_add" class="col-sm-5 col-md-6 col-md-offset-1">
      	<span class="col-lg-6 col-md-6 col-sm-6">Добавить транспорт</span>
      	<input type="text" name="number_of" class="col-lg-2 col-md-2 col-sm-2">
      	<span class="col-lg-2 col-md-2 col-sm-2">шт.</span>
      	<button class="btn btn-success btn-xs" type="submit">
      		<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>
      	</button>
      </div>

      <div class="transport_list">
      <?php $Transport = new Transport(); 
      	$transports = $Transport->getAll(); ?>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Наименование</th>
              <th>Грузоподъемность</th>
              <th>Габариты автомобиля</th>
              <th>Поддоны</th>
              <th>Ставка (руб.)</th>
              <th>За км от МКАД(руб.)</th>
              <th>МКАД(руб.)</th>
              <th>ТТК(руб.)</th>
              <th>Садовое кольцо(руб.)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
          <?php $transpCounter = 1; foreach($transports as $transpId => $oneTransport) { ?>
	          <tr name="id<?php echo $oneTransport['id']; ?>">
	              <td><?php echo $transpCounter++; ?></td>


              <td name="name[]"><?php echo $oneTransport['name']; ?></td>
              <td name="capacity[]"><?php echo $oneTransport['capacity']; ?></td>
              <td name="dimensions[]"><?php echo $oneTransport['dimensions']; ?></td>
              <td name="pallets[]"><?php echo $oneTransport['pallets']; ?></td>
              <td name="rate[]"><?php echo $oneTransport['rate']; ?></td>
              <td name="mcad[]"><?php echo $oneTransport['mcad']; ?></td>
              <td name="inside_mcad[]"><?php echo $oneTransport['inside_mcad']; ?></td>
              <td name="inside_ttk[]"><?php echo $oneTransport['inside_ttk']; ?></td>
              <td name="inside_sad_kolco[]"><?php echo $oneTransport['inside_sad_kolco']; ?></td>
              <td>
              	<span class="glyphicon glyphicon-pencil" aria-hidden="true" title="Редактировать"></span>
              	<span class="glyphicon glyphicon-remove" aria-hidden="true" title="Удалить"></span>
              </td>
	           </tr>
			<?php } ?>            
          </tbody>
        </table>

        <div id="add_transport" class="hide">
	        <table class="table table-striped table-bordered ">
	        <thead>
	            <tr>
	              <th>#</th>
	              <th>Наименование</th>
	              <th>Грузоподъемность</th>
	              <th>Габариты автомобиля</th>
	              <th>Поддоны</th>
	              <th>Ставка (руб.)</th>
	              <th>За км от МКАД(руб.)</th>
	              <th>МКАД(руб.)</th>
	              <th>ТТК(руб.)</th>
	              <th>Садовое кольцо(руб.)</th>
	            </tr>
	          </thead>
	          <tbody>
	          </tbody>
	        </table>


	        <div class="col-sm-2 col-md-2 col-md-offset-10 col-md-offset-10">
		      	<button class="btn btn-success btn-xs" type="submit">
		      		<span>Добавить </span>
		      		<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>
		      	</button>
		    </div>
        </div>
      </div>
    </div>
  </div>
</div>



<div role="tabpanel" class="tab-pane fade container-fluid" id="other">
  <div class="row">
    
    <div class="col-sm-9 col-md-10 main">
      <h1 class="page-header">Оплата и доставка</h1>

      <h2 class="sub-header">Оплата</h2>      

      <div id="admin-payment" class="table-responsive">
       <?php $db = new DB();
          	$db->select();
          	$db->table('payments');
          	$payments = $db->get();
          ?>
        <table class="table table-striped">
          <thead>
            <tr>
              <th class="col-sm-1 col-md-1">#</th>
              <th class="col-sm-9 col-md-9">Вид оплаты</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
          <?php foreach($payments as $k => $payment) { ?>

          	 <tr name="id<?php echo $payment['id']; ?>">
              <td><?php echo $k+1; ?></td>
              <td><?php echo $payment['name']; ?></td>
              <td><span class="glyphicon glyphicon-pencil" aria-hidden="true" title="Редактировать"></span><span class="glyphicon glyphicon-remove" aria-hidden="true" title="Удалить"></span></td>
            </tr>

          <?php } ?>          
          </tbody>
        </table>
        <div class="col-sm-2 col-md-2 col-md-offset-9 col-md-offset-9">
      	<button class="btn btn-success btn-xs" id="for-admin-payment" type="submit">
      		<span>Добавить вид оплаты</span>
      	</button>
      </div>
      </div>

      <h2 class="sub-header">Доставка</h2>
      

      <div id="admin-delivery" class="table-responsive">
       <?php $db = new DB();
          	$db->select();
          	$db->table('deliveries');
          	$deliveries = $db->get();
          ?>
        <table class="table table-striped">
          <thead>
            <tr>
              <th class="col-sm-1 col-md-1">#</th>
              <th class="col-sm-9 col-md9">Способ доставки</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
          <?php foreach($deliveries as $k => $delivery) { ?>

          	<tr name="id<?php echo $delivery['id']; ?>">
              <td><?php echo $k+1; ?></td>
              <td><?php echo $delivery['name']; ?></td>
              <td><span class="glyphicon glyphicon-pencil" aria-hidden="true" title="Редактировать"></span><span class="glyphicon glyphicon-remove" aria-hidden="true" title="Удалить"></span></td>
            </tr>

          <?php } ?>     
          </tbody>
        </table>
        <div class="col-sm-2 col-md-2 col-md-offset-9 col-md-offset-9">
	      	<button class="btn btn-success btn-xs" id="for-admin-delivery" type="submit">
	      		<span>Добавить вид доставки</span>
	      	</button>
	    </div>
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