<?php
include(__DIR__ . '/index.php');

$G = $_GET;
$P = $_POST;

if (isset($G['getItems'])) {
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
} elseif (isset($G['changeTransport'])) {
	$Transport = new Transport();

	$item = current($P['data']);
	$id = intval($G['changeTransport']);
	$Transport->change($id, $item);
} elseif (isset($G['deleteTransport'])) {
	$Transport = new Transport();
	$id = intval($G['deleteTransport']);
	$Transport->delete($id);
} elseif (isset($G['change-admin-payment']) || isset($G['change-admin-delivery'])) {
	$isPayment = isset($G['change-admin-payment'])? true : false;
	$id = '';
	$data = $P['data'];

	if($isPayment) $id = $G['change-admin-payment'];
	else $id = $G['change-admin-delivery'];

	$isChangeAction = strlen($id) > 0? true : false;

	$db = new DB();
	$table = '';
	

	if($isPayment) {
		$table = 'payments';
	} else {
		$table = 'deliveries';
	}

	// echo $data;
	if($isChangeAction) {
		$db->query = "UPDATE {$table} SET  `name` = '{$data['name']}' WHERE id=".$id;
	} else {
		$db->query = "INSERT INTO {$table} (`name`) VALUES ('{$data['name']}')";
	}
	// echo "\n".
	$db->set();


} elseif (isset($G['delete-admin-payment']) || isset($G['delete-admin-delivery'])) {
	$isPayment = isset($G['delete-admin-payment'])? true : false;

	$id = '';
	$db = new DB();
	$table = '';

	if($isPayment) $id = $G['delete-admin-payment'];
	else $id = $G['delete-admin-delivery'];

	if($isPayment) {
		$table = 'payments';
	} else {
		$table = 'deliveries';
	}

	$db->query = 'DELETE FROM '.$table.' WHERE id='.$id;
	$db->set();

} elseif (isset($G['type']) && $G['type']=='manufacturer') {
	$action = $G['action'];
	$Manufacturer = new Manufacturer();

	if($action == 'create') {
		$Manufacturer->add($P['data']);
	} elseif($action == 'change') {
		$Manufacturer->change(intval($G['id']), current($P['data']));		
	} elseif($action == 'delete') {
		$Manufacturer->delete(intval($G['id']));
	}
} elseif (isset($G['type']) && $G['type']=='product') {
	$id = intval($G['id']);
	$data = $P['data'];
	// $materialId = $G['material_id'];
// echo print_r($data, 1);

	if($id > 0) {
		$Calc->change('product_features', $id, $data);
	} else {
		$Calc->add('product_features', $data);
	}
} elseif (isset($G['deleteProduct'])) {
	$Calc->delete('product_features', intval($G['deleteProduct']));
} elseif (isset($G['getInfo']) && $G['getInfo'] != '') {
	$id = intval($G['id']);
	$table = $G['getInfo'];

	$result=$Calc->get($table,$id, $P['data']);

	echo json_encode($result[0]);
} elseif (isset($G['setInfo']) && $G['setInfo'] != '') {
	$id = intval($G['id']);
	$table = $G['setInfo'];

	$result=$Calc->change($table,$id, $P['data']);

	// echo json_encode($result[0]);
} elseif (isset($G['getFew'])) {
	if(!isset($P['colums']) || $P['colums'] == '') $P['colums'] = '*';

	echo json_encode( $Calc->getFew($P['table'], $P['ids'], $P['colums']) );
}


function getIds($val) {

	return $val['id'];
}



?>