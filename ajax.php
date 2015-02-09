<?php
include(__DIR__ . '/index.php');

$G = $_GET;
$P = $_POST;

if(isset($G['getItems'])) {
	$items = array();

	if($P['type'] == 'category') {
		$items = $Calc->getMaterials($P['id']);
		
		$matIds = array_map('getIds', $items);

		$characts = $Calc->MaterialsCharct(implode($matIds, "','"));

		echo json_encode(array('items'=>$items, 'characts'=>$characts));

		exit();

	} elseif ($P['type'] == 'material') {
		$items = $Calc->getManufacturers($P['id']);		
	}

	echo json_encode(array('items'=>$items));
}



function getIds($val) {

	return $val['id'];
}



?>