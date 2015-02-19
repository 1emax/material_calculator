<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
	<title>Настройки</title>
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1">


	
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
      <span class="navbar-brand"><a href=".">Расчеты</a></span>
      <span class="navbar-brand">| Настройки |</span>
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
        <li class="active"><a href="#tab-products">Продукция <span class="sr-only">(current)</span></a></li>
        <li><a href="#tab-manufacturers">Производители</a></li>
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
    
    <div id="tab-products" class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main  sub-tab">
      <h1 class="page-header">Продукты</h1>

      <?php $Manufacturer = new Manufacturer();
  		$manufacturers = $Manufacturer->getAll();
  		// print_r($manufacturers);
  	  ?>
	  <ul class="nav nav-pills" role="tablist">
	      <li class="dropdown">
			  <a id="dLabel" data-target="#" class="dropdown-toggle" href="#" data-toggle="dropdown" aria-haspopup="true" role="button" aria-expanded="false">
			    ПроффСтрой
			    <span class="caret"></span>
			  </a>

			  <ul class="dropdown-menu" role="menu" aria-labelledby="dLabel">
			  <?php foreach($manufacturers as $oneManufacturer) { ?>
			  	<li>
			  		<a role="menuitem" tabindex="-1" href="#" name="<?php echo $oneManufacturer['id']; ?>"><?php echo $oneManufacturer['name']; ?>
			  		</a>
			  	</li>
			  <?php } ?>
			  </ul>
		  </li>
	  </ul>
	  <br>
	  <br>
      <!-- <h2 class="sub-header">Section title</h2> -->

        <div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true" manufacturerid="1"> <!-- manufacturer_id -->
        <?php 
        $materials=$Calc->getMaterials(1); //  category_id
        $matIds = array_map('getIds', $materials);
		$charactsRaw = $Calc->MaterialsCharct(implode($matIds, "','"), 1); //materials id`s, manufacturer_id
		$characts = charactByPid($charactsRaw);

        foreach($materials as $k => $material) { 
        	?>

		  <div class="panel panel-default">
		    <div class="panel-heading" role="tab" id="head<?php echo 'mater'.$material['id'];?>">
		      <h4 class="panel-title">
		        <a class="collapsed" data-toggle="collapse" data-parent="#accordion" href="#<?php echo 'mater'.$material['id'];?>" aria-expanded="false" aria-controls="<?php echo 'mater'.$material['id'];?>" name="<?php echo $material['id']; ?>">
		        <?php 
				
					$prodN = isset($characts[$material['id']]) ? countSubArr($characts[$material['id']]) : 0;
				?>
		          <?php echo ($k+1) . '. ' . $material['name'] . ' ('.$prodN.')' ; ?>
		        </a>
		      </h4>
		    </div>
		    <div id="<?php echo 'mater'.$material['id'];?>" class="panel-collapse collapse material" role="tabpanel" aria-labelledby="head<?php echo 'mater'.$material['id'];?>">
		      <div class="panel-body">
		        <div class="table-responsive">

		        	
			        <table class="table table-striped">
			          <thead>
			            <tr>
			              <th>#</th>
			              <th>Длина</th>
			              <th>Высота</th>
			              <th>Ширина</th>
			              <th>Плотность</th>
			              <th>Цена (1 м<sup>3</sup>) в руб.</th>
			              <th></th>
			              <th></th>
			              <th></th>
			            </tr>
			          </thead>
			          <tbody>
		      <?php if($prodN > 0) { ?> 
			          <?php 
		        	$oneProdCharactsArr = $characts[$material['id']]; //print_r($oneProdCharacts);
		        	?>
			          <?php $oneCounter = 1; 
			          foreach($oneProdCharactsArr as $oneN => $oneProdCharacts) { 
			          foreach($oneProdCharacts as  $oneProdCharact) { ?>
			          <tr name="id<?php echo $oneProdCharact['id']; ?>">
			          	<?php $sizes =  explode('x', $oneProdCharact['size']);
			          	?>
			              <td><?php echo $oneCounter++; ?></td>
			              <td name="length"><?php echo $sizes[2]; ?></td>
			              <td name="height"><?php echo $sizes[1]; ?></td>
			              <td name="width"><?php echo $sizes[0]; ?></td>
			              <td name="density"><?php echo $oneN; ?></td>
			              <td name="price"><?php echo number_format($oneProdCharact['price'],0,'.',' '); ?></td>
			              <td>
			              	<span class="admin-characts <?php if(!ifFullCharacts($oneProdCharact)) echo 'not-full';?>" title="Редактировать характеристики">Характеристики </span>
			              	<span class="glyphicon glyphicon-pencil" aria-hidden="true" title="Редактировать"></span>
			              	<span class="glyphicon glyphicon-remove" aria-hidden="true" title="Удалить"></span>
			              	</td>
			           </tr>
			           <?php }
			           } ?>
      			<?php } ?>
			          </tbody>
			        </table>			       
      			</div>
      			<div class="col-sm-2 col-md-2 col-md-offset-9 col-md-offset-9">
			      	<button class="btn btn-success btn-xs for-admin-product"type="submit">
			      		<span>Добавить</span>
			      	</button>
		    	</div>
		      </div>
		    </div>
		  </div>
            <?php } ?>		  
		</div>
	</div>
	<div id="tab-manufacturers" class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main hide sub-tab">
      <h1 class="page-header">Производители</h1>
      <div>
      	<button class="btn btn-success btn-xs  col-md-offset-1  col-sm-offset-1" id="for-admin-addmnanufacturer" type="submit"  data-toggle="modal" data-target="#myModal">
      		<span>Добавить производителя</span>
      	</button>
      	<div class="manufacturers_list">
      		
      		<table class="table table-striped">
	          <thead>
	            <tr>
	              <th>#</th>
	              <th>Производитель</th>
	              <th>Адрес</th>
	              <th>Координаты</th>
	              <th></th>
	              <th></th>
	            </tr>
	          </thead>
	          <tbody>
			        <?php foreach($manufacturers as $manN => $oneManufacturer) { ?>
	          	<tr name="id<?php echo $oneManufacturer['id']; ?>">
	          	  <td><?php echo $manN+1; ?></td>
	              <td name="name"><?php echo $oneManufacturer['name']; ?></td>
	              <td name="address"><?php echo $oneManufacturer['address']; ?></td>
	              <td name="coordinates"><?php echo $oneManufacturer['coordinates']; ?></td>
	              <td><a href="#" class="manuf_change">Изменить</a></td>
	              <td><a href="#" class="manuf_dalete">Удалить</a></td>
	            </tr>
			          <?php } ?>
	          </tbody>
            </table>
      	</div>
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
<div class="modal fade" id="manufacturer-modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="myModalLabel">Modal title</h4>
      </div>
      <div class="modal-body col-lg-12 col-md-12 col-sm-12">
        <div class="col-lg-12 col-md-12 col-sm-12 row">
        	<div class="onerow col-lg-12 col-md-12 col-sm-12">
        		<div class="col-lg-3 col-md-3 col-sm-3">
        			<span>Название:</span>
        		</div>
        		<div class="col-lg-9 col-md-9 col-sm-9">
        			<input id="manuf_name" type="text" class="col-lg-12 col-md-12 col-sm-12">
        		</div>
        	</div>
        	<div class="onerow col-lg-12 col-md-12 col-sm-12">
        		<div class="col-lg-3 col-md-3 col-sm-3">
        			<span>Адрес:</span>        			
        		</div>
        		<div class="col-lg-9 col-md-9 col-sm-9">
        			<input type="text" class="col-lg-12 col-md-12 col-sm-12 admin-address" placeholder="Адрес доставки" id="deliv_address">  			
        		</div>
        	</div>
        	<div class="onerow col-lg-12 col-md-12 col-sm-12">
        		<span class="col-lg-4 col-md-4 col-sm-4">Координаты: </span>
        		<span class="admin-coords"></span>
        	</div>
			<div id="ya_map" class="manufacturer-map col-lg-12 col-md-12 col-sm-12 "></div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Отмена</button>
        <button type="button" class="btn btn-primary" id="admin_save_manufacturer">Сохранить</button>
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->




<div class="modal fade" id="product-modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabelProd" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="myModalLabelProd">Modal title</h4>
      </div>
      <div class="modal-body col-lg-12 col-md-12 col-sm-12">
        <div class="col-lg-12 col-md-12 col-sm-12 row">
        	<div class="onerow col-lg-12 col-md-12 col-sm-12" name="number_per_pallet">
        		<div class="col-lg-5 col-md-5 col-sm-5">
        			<span>Кол-во на 1 поддоне:</span>
        		</div>
        		<div class="col-lg-7 col-md-7 col-sm-7">
        			<input type="text" class="col-lg-12 col-md-12 col-sm-12">
        		</div>
        	</div>
        	<div class="onerow col-lg-12 col-md-12 col-sm-12" name="number_per_cubic_meter">
        		<div class="col-lg-5 col-md-5 col-sm-5">
        			<span>Кол-во в 1 м<sup>3</sup>:</span>        			
        		</div>
        		<div class="col-lg-7 col-md-7 col-sm-7">
        			<input type="text" class="col-lg-12 col-md-12 col-sm-12">  			
        		</div>
        	</div>
        	<div class="onerow col-lg-12 col-md-12 col-sm-12" name="weight">
        		<div class="col-lg-5 col-md-5 col-sm-5">
        			<span>Вес блока:</span>        			
        		</div>
        		<div class="col-lg-7 col-md-7 col-sm-7">
        			<input type="text" class="col-lg-12 col-md-12 col-sm-12">  			
        		</div>
        	</div>
        	<div class="onerow col-lg-12 col-md-12 col-sm-12" name="weight_pallet_and_block">
        		<div class="col-lg-5 col-md-5 col-sm-5">
        			<span>Вес поддона с блоками:</span>        			
        		</div>
        		<div class="col-lg-7 col-md-7 col-sm-7">
        			<input type="text" class="col-lg-12 col-md-12 col-sm-12">  			
        		</div>
        	</div>
        	<div class="onerow col-lg-12 col-md-12 col-sm-12" name="strength_class">
        		<div class="col-lg-5 col-md-5 col-sm-5">
        			<span>Класс прочности:</span>        			
        		</div>
        		<div class="col-lg-7 col-md-7 col-sm-7">
        			<input type="text" class="col-lg-12 col-md-12 col-sm-12">  			
        		</div>
        	</div>
        	<div class="onerow col-lg-12 col-md-12 col-sm-12" name="breaking_strength">
        		<div class="col-lg-5 col-md-5 col-sm-5">
        			<span>Теплопроводность:</span>        			
        		</div>
        		<div class="col-lg-7 col-md-7 col-sm-7">
        			<input type="text" class="col-lg-12 col-md-12 col-sm-12">  			
        		</div>
        	</div>
        	<div class="onerow col-lg-12 col-md-12 col-sm-12" name="thermal_conductivity">
        		<div class="col-lg-5 col-md-5 col-sm-5">
        			<span>Морозостойкость:</span>        			
        		</div>
        		<div class="col-lg-7 col-md-7 col-sm-7">
        			<input type="text" class="col-lg-12 col-md-12 col-sm-12">  			
        		</div>
        	</div>
        	<div class="onerow col-lg-12 col-md-12 col-sm-12" name="frost_resistance">
        		<div class="col-lg-5 col-md-5 col-sm-5">
        			<span>Адрес:</span>        			
        		</div>
        		<div class="col-lg-7 col-md-7 col-sm-7">
        			<input type="text" class="col-lg-12 col-md-12 col-sm-12">  			
        		</div>
        	</div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Отмена</button>
        <button type="button" class="btn btn-primary" id="admin_save_prod_charact">Сохранить</button>
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->


	

</body>
</html>
<!-- Latest compiled and minified CSS -->
	<link rel="stylesheet" href="css/bootstrap.min.css">

	<!-- Optional theme -->
	<link rel="stylesheet" href="css/bootstrap-theme.min.css">

	<link rel="stylesheet" href="css/jquery-ui.min.css">
	<!-- move css to css folder -->
	<link rel="stylesheet" href="css/style.css">
	<!-- Custom styles for admin template -->
    <link href="css/dashboard.css" rel="stylesheet">

<script src="js/jquery-2.1.3.min.js"></script>

	<!-- Latest compiled and minified JavaScript -->
	<script src="js/bootstrap.min.js"></script>

	<script src="js/jquery.cookie.js"></script>
	<script src="js/script.js"></script>
	<script src="js/jquery-ui/jquery-ui.min.js"></script>
	<script src="js/jquery.maskedinput.min.js"></script>
	<script src="js/jquery-ui/datepicker-ru.js"></script>

	<!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
<script src="http://api-maps.yandex.ru/2.1/?lang=ru-RU" type="text/javascript"> </script>

<?php
function getIds($val) {

	return $val['id'];
}

function charactByPid($charct) {
	$res = array();

	foreach ($charct as $value) {
		$res[$value['pid']][$value['density']][] = $value;
	}

	return $res;
}

function countSubArr($arr) {
	$count = 0;

	foreach ($arr as $subArr) {
		foreach ($subArr as $el) {
			$count++;
		}
	}

	return $count;
}

function ifFullCharacts($oneProdCharact) {
	$except = array('number_per_pallet','number_per_cubic_meter','weight','weight_pallet_and_block','strength_class','breaking_strength','thermal_conductivity','frost_resistance');

	foreach($except as $val) {
		if(is_null($oneProdCharact[$val])) return false;
	}

	return true;

}

?>