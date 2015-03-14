<?php
include 'index.php';

if (!!$Calc) unset($Calc);

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
//add mcad and another tax
unset($_POST, $_GET);

$Transport = new Transport();
$transports = $Transport->getAll(array('id', 'LOWER(name) as name', 'capacity', 'pallets','rate', 'mcad'));
$Transport->closeConnection();
unset($Transport);


$sel = new TransportSelector($transports, $road, $pallets, $cubicMetersWeight, $delivType);
unset($transports);
$sel->shuffleIt();
// echo json_encode($sel->shuffleIt());
// echo json_encode($sel->resultTransports);
echo json_encode(explode(',', ltrim($sel->resultTransports['winIds'], ',')));



class TransportSelector {
	public $transports = array();
	public $road = 0;
	public $pallets = 0;
	public $cubicMetersWeight = 0;
	public $resultTransports = array();
	public $delivType = '';
	public $needUnload = false;
	// public $parameters = array();


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
		if($comnPrice === false) $comnPrice = 0;
		if($weightLeft === false) $weightLeft = $this->cubicMetersWeight;
		if($palletsLeft === false) $palletsLeft = $this->pallets;			

		foreach ($this->transports as $transport) {
			// if($transport['id'] != 1 && $transport['id'] != 2 && $transport['id'] != 3) continue;

			if($this->needUnload && !$hasUnl && ($transport['name'] != 'манипулятор')) {
				continue;
			}


// 9600 - 10p (18) - 5800m (20760)

// + 17600 -24p (-6) - 23200m(-2440)

// + 11300 -22px (-4) - 21500m(~-1000)

			$price = $transport['mcad'] * $this->road + $transport['rate'] + $comnPrice;
			if(!$this->isAcceptablePrice($price)) continue;
			// $comnPrice += $price;
			// unset($price);


			$vehiclePerWeightLeft = $weightLeft - $transport['capacity'];
			$vehiclePerPalletsLeft = $palletsLeft - $transport['pallets'];
			$winIds = $swinIds . ','. strval($transport['id']);// .'|'. $vehiclePerWeightLeft . ':'.$vehiclePerPalletsLeft . '='.$comnPrice;
			// if($hasUnl)
			// $this->parameters[] = array('price'=>$price, 'WLeft'=>$vehiclePerWeightLeft, 'PLeft'=>$vehiclePerPalletsLeft, 'winIds'=>$winIds, 'Acceptable'=>$this->isAcceptablePrice($price));

			unset($transport);
			// $this->parameters[] = $winIds;

			// $vehiclePerWeight = $weightLeft / $transport['capacity'];
			// $vehiclePerPallets = $palletsLeft / $transport['pallets'];

			if ($vehiclePerWeightLeft <= 0 && $vehiclePerPalletsLeft <= 0) {
				$this->resultTransports = array($price => '', 'winIds'=>$winIds);
				continue;
			}

			$this->shuffleIt($price, $vehiclePerWeightLeft, $vehiclePerPalletsLeft, $winIds, true);

			// echo "\n<br>$price руб \n<br>=$vehiclePerWeight таких машин по весу \n<br>= $vehiclePerWeightLeft осталось кг для остальных машин \n<br>= $vehiclePerPallets машин по поддонам \n<br>= $vehiclePerPalletsLeft осталось по поддонам<br><br>";
		}

		// return $this->parameters;



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