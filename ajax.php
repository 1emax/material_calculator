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
} elseif (isset($G['addTransport'])) {
	$Transport = new Transport();

	$Transport->add($P['data']);
	echo json_encode(array('keys'=>array_keys($P['data'])));
} elseif(isset($G['changeTransport'])) {
	$Transport = new Transport();

	$item = current($P['data']);
	$id = intval($G['changeTransport']);
	$Transport->change($id, $item);
} elseif(isset($G['deleteTransport'])) {
	$Transport = new Transport();
	$id = intval($G['deleteTransport']);
	$Transport->delete($id);
}



function getIds($val) {

	return $val['id'];
}



?>