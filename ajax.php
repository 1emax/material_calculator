<?php
include(__DIR__ . '/index.php');

$G = $_GET;
$P = $_POST;

if(isset($G['getItems'])) {
	if($P['type'] == 'category') {
		$items = $Calc->getMaterials($P['id']);
	} elseif ($P['type'] == 'material') {
		$items = $Calc->getManufacturers($P['id']);		
	}
	echo json_encode(array('items'=>$items));
}







?>