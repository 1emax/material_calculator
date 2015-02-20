<?php
include 'index.php';

$road = 1000;
$pallets = 9; // max - 500 pallets
$cubicMetersWeight = 80007; // max - 220 000 m3

if(isset($_POST['road']) && isset($_POST['pallets']) && isset($_POST['cubicMetersWeight'])) {
	$road = intval($_POST['road']);
	$pallets = intval($_POST['pallets']); // max - 500 pallets
	$cubicMetersWeight = intval($_POST['cubicMetersWeight']); // max - 220 000 m3
}

$Transport = new Transport();
$transports = $Transport->getAll(array('id', 'capacity', 'pallets','rate', 'mcad'));

// print_r($transports);

$sel = new TransportSelector($transports, $road, $pallets, $cubicMetersWeight);
$sel->shuffleIt();

echo json_encode(explode(',', ltrim($sel->resultTransports['winIds'], ',')));


class TransportSelector {
	public $transports = array();
	public $road = 0;
	public $pallets = 0;
	public $cubicMetersWeight = 0;
	public $resultTransports = array();

	public function __construct($transports, $road, $pallets, $cubicMetersWeight) {
		$this->transports = $transports;
		$this->road = $road;
		$this->pallets = $pallets;
		$this->cubicMetersWeight = $cubicMetersWeight;
	}

	public function shuffleIt($comnPrice = false, $weightLeft = false, $palletsLeft = false, $winIds = '') {
		if($comnPrice == false) $comnPrice = 0;
		if($weightLeft == false) $weightLeft = $this->cubicMetersWeight;
		if($palletsLeft == false) $palletsLeft = $this->pallets;

		foreach ($this->transports as $key => $transport) {
			$price = $transport['mcad'] * $this->road + $transport['rate'];
			$comnPrice += $price;
			// echo 21;
			if(!$this->isAcceptablePrice($comnPrice)) continue;

			$winIds .= ','. strval($transport['id']);
			// echo 'false<br>';

			$vehiclePerWeight = $weightLeft / $transport['capacity'];
			$vehiclePerPallets = $palletsLeft / $transport['pallets'];

			if ($vehiclePerWeight <= 1 && $vehiclePerPallets <= 1) {
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


			$this->shuffleIt($comnPrice, $vehiclePerWeightLeft, $vehiclePerPalletsLeft, $winIds);
			// print_r($transport);
			// echo "\n<br>$price руб \n<br>=$vehiclePerWeight таких машин по весу \n<br>= $vehiclePerWeightLeft осталось кг для остальных машин \n<br>= $vehiclePerPallets машин по поддонам \n<br>= $vehiclePerPalletsLeft осталось по поддонам<br><br>";

			// break;
		}

		// чтоб не считать повторно эту машину - можно ее исключить в след цикле для себя же. Во втором - исключить еще одну. и т.д.
		// если по весу или поддонам <= 1, то прекратить подбор этого варианта. В массив с ценами как индексами
		// если по цене больше любой цены из существующих - прекратить
	}

	public function isAcceptablePrice($itemPrice) {
		if(count($this->resultTransports) == 0) return true;

		$price = key($this->resultTransports);
		// echo '<br>\\\\\\ '.$itemPrice . '=' . $price . '\\\\\\-';
		if(intval($itemPrice) >= intval($price)) return false;

		return true;
	}
}