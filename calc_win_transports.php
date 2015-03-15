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
	private $originals = array();
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

			if(!$hasUnl && $this->needUnload && ($transport['name'] != 'манипулятор')) {
				continue;
			}

			$price = $transport['mcad'] * $this->road + $transport['rate'] + $comnPrice;
			if(!$this->isAcceptablePrice($price)) continue;
			// trying for perfomance:
			// - some code in iteration - to functions
			// - save list of origin ids in memory
			// - save results for the same data in memory
			// - write function on C or C++
			// - get optimal price (best vehicles)

			$winIds = $swinIds . ','. strval($transport['id']);
			if(!$this->isOrigTransp($winIds)) continue;

			$vehiclePerWeightLeft = $weightLeft - $transport['capacity'];
			$vehiclePerPalletsLeft = $palletsLeft - $transport['pallets'];

			unset($transport);

			if ($vehiclePerWeightLeft <= 0 && $vehiclePerPalletsLeft <= 0) {
				$this->resultTransports = array($price => '', 'winIds'=>$winIds);
				continue;
			}

			$this->shuffleIt($price, $vehiclePerWeightLeft, $vehiclePerPalletsLeft, $winIds, true);
		}
	}

	public function withUnload() {


	}

	public function isOrigTransp($winIds) {
		$ids = explode(',', $winIds);
		sort($ids);
		$sIds = implode(',', $ids);

		if(isset($this->originals[$sIds])) return false;

		$this->originals[$sIds] = '';

		return true;
	}

	public function isAcceptablePrice($itemPrice) {
		if(count($this->resultTransports) == 0) return true;

		$price = key($this->resultTransports);
		// echo '<br>\\\\\\ '.$itemPrice . '=' . $price . '\\\\\\-';
		if(intval($itemPrice) >= intval($price)) return false;

		return true;
	}
}