<?php
include 'index.php';

$road = 1000;
$pallets = 9; // max - 500 pallets
$cubicMetersWeight = 80007; // max - 220 000 m3
$delivType = 'not_unloading_delivery';

if(isset($_POST['road']) && isset($_POST['pallets']) && isset($_POST['cubicMetersWeight'])) {
	$road = intval($_POST['road']);
	$pallets = intval($_POST['pallets']); // max - 500 pallets
	$cubicMetersWeight = intval($_POST['cubicMetersWeight']); // max - 220 000 m3
	$delivType = $_POST['delivType'];
}

$Transport = new Transport();
$transports = $Transport->getAll(array('id', 'LOWER(name) as name', 'capacity', 'pallets','rate', 'mcad'));
$Transport->closeConnection();
unset($Transport);

// print_r($transports);
// echo json_encode( ($transports[3]['name'] == 'манипулятор') );
// print_r($transports);

$sel = new TransportSelector($transports, $road, $pallets, $cubicMetersWeight, $delivType);
$sel->shuffleIt();
echo json_encode($sel->shuffleIt());
// echo json_encode(explode(',', ltrim($sel->resultTransports['winIds'], ',')));


class TransportSelector {
	public $transports = array();
	public $road = 0;
	public $pallets = 0;
	public $cubicMetersWeight = 0;
	public $resultTransports = array();
	public $delivType = '';
	public $needUnload = false;
	public $parameters = array();

	public function __construct($transports, $road, $pallets, $cubicMetersWeight, $delivType) {
		$this->transports = $transports;
		// $this->transports['name'] = strtolower($transports['name']);
		$this->road = $road;
		$this->pallets = $pallets;
		$this->cubicMetersWeight = $cubicMetersWeight;
		$this->delivType = $delivType;

		if("unloading_delivery" == $delivType) $this->needUnload = true;
	}

	public function shuffleIt($comnPrice = false, $weightLeft = false, $palletsLeft = false, $swinIds = '', $hasUnl = false) {
		if($comnPrice == false) $comnPrice = 0;
		if($weightLeft == false) $weightLeft = $this->cubicMetersWeight;
		if($palletsLeft == false) $palletsLeft = $this->pallets;

		
			

		foreach ($this->transports as $transport) {
			$price = $transport['mcad'] * $this->road + $transport['rate'];
			$comnPrice += $price;
			// echo 21;
			if(!$this->isAcceptablePrice($comnPrice)) continue;
			if($this->needUnload && !$hasUnl) $hasUnl = ($transport['name'] == 'манипулятор');
			// echo json_encode(array($hasUnl, $this->needUnload));
			$winIds = $swinIds . ','. strval($transport['id']);
			// echo json_encode($winIds);

			// echo 'false<br>';
			// if(!$hasUnl) {
				// echo 5555;
				// exit();
			// } else {
				// echo json_encode(!($this->needUnload && !$hasUnl)), ' ';
			// }

			$vehiclePerWeight = $weightLeft / $transport['capacity'];
			$vehiclePerPallets = $palletsLeft / $transport['pallets'];
// !($this->needUnload && !$hasUnl) 
			if (!($this->needUnload && !$hasUnl) && $vehiclePerWeight <= 1 && $vehiclePerPallets <= 1) {
				$this->resultTransports = array(strval($comnPrice) => $transport, 'winIds'=>$winIds);
				continue;
				 // поменять на массив итогового транспорта 
			}


			// if ($vehiclePerPallets <= 1) {
			// 	$this->resultTransports = array(strval($comnPrice) => $transport, 'winIds'=>$winIds);
			// 	continue;
			// 	 // поменять на массив итогового транспорта 
			// }

			$vehiclePerWeightLeft = $weightLeft - $transport['capacity'];
			$vehiclePerPalletsLeft = $palletsLeft - $transport['pallets'];

			$this->parameters[] = array('cmnPrc'=>$comnPrice, 'WLeft'=>$vehiclePerWeightLeft, 'PLeft'=>$vehiclePerPalletsLeft, 'winIds'=>$winIds, 'hasUnl'=>$hasUnl);
			// print_r($transport);
			// echo "\n<br>$price руб \n<br>=$vehiclePerWeight таких машин по весу \n<br>= $vehiclePerWeightLeft осталось кг для остальных машин \n<br>= $vehiclePerPallets машин по поддонам \n<br>= $vehiclePerPalletsLeft осталось по поддонам<br><br>";

			// break;
		}

		return $this->parameters;

			// $this->shuffleIt($comnPrice, $vehiclePerWeightLeft, $vehiclePerPalletsLeft, $winIds, $hasUnl);

		// чтоб не считать повторно эту машину - можно ее исключить в след цикле для себя же. Во втором - исключить еще одну. и т.д.
		// если по весу или поддонам <= 1, то прекратить подбор этого варианта. В массив с ценами как индексами
		// если по цене больше любой цены из существующих - прекратить
	}

	public function withUnload() {


	}

	public function isAcceptablePrice($itemPrice) {
		if(count($this->resultTransports) == 0) return true;

		$price = key($this->resultTransports);
		// echo '<br>\\\\\\ '.$itemPrice . '=' . $price . '\\\\\\-';
		if(intval($itemPrice) >= intval($price)) return false;

		return true;
	}
}