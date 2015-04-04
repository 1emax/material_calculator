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
$sel->selectFirst();
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
	public $additionPrice = 0;
	public $combLimit = 0; //лимит комбинаций, чтобы расчеты вложились в секунду. Зависит от мощности сервера
	public $power = 0;
	// public $parameters = array();


	public function __construct($transports, $road, $pallets, $cubicMetersWeight, $delivType) {
		$this->transports = $transports;
		$this->combLimit = pow(10, 12.5);
		// $this->transports['name'] = strtolower($transports['name']);
		$this->road = $road;
		$this->pallets = $pallets;
		$this->cubicMetersWeight = $cubicMetersWeight;
		$this->delivType = $delivType;
		$this->getPower(count($this->transports));
		// добавить $additionPrice в зависимости куда по Москве доставлять 

		if("unloading_delivery" == $delivType) $this->needUnload = true;
	}
	// сначала, смотрим с разгрузкой или нет - и выбираем 1 наивыгоднейший транспорт
	// после - смотрим, входит ли в лимит количество комбинаций (кол-во доступных машин * на кол-во наислабших машин)
	// входит - запускаем перебор
	//не входит - считаем максим. кол-во транспорта по наивыгоднейшему. Из него отнимаем машин 8-10. Сохраняем получившееся кол-во. На оставшемся запускаем перебор с вычтенными весом и объемом и добавленной ценой

	public function selectFirst() {
		$weightLeft = $this->cubicMetersWeight;
		$palletsLeft = $this->pallets;
		$transportArr = array();
		$bestPriceN = array('price'=>0, 'vehicles' => 0);
		$biggestN = 0;

		foreach ($this->transports as $transport) {
			$calcIt = true;

			if($this->needUnload && ($transport['name'] != 'манипулятор')) {
				$calcIt = false;
			} 
			// else {
			// 	echo $transport['id'];
			// }
			

			$price = $transport['mcad'] * $this->road + $transport['rate'] + $this->additionPrice;
			if(!$this->isAcceptablePrice($price)) continue;

			$winIds = strval($transport['id']);

			$vehiclePerWeightLeft = $weightLeft - $transport['capacity'];
			$vehiclePerPalletsLeft = $palletsLeft - $transport['pallets'];


			if ($vehiclePerWeightLeft <= 0 && $vehiclePerPalletsLeft <= 0 && $calcIt === true) {
				$this->resultTransports = array($price => '', 'winIds'=>$winIds);
				continue;
			}

			$coefficient = $this->coefficient($transport);

			if( $bestPriceN['price']  == 0 || ($coefficient['price'] < $bestPriceN['price']) ) $bestPriceN = $coefficient;
			if($coefficient['vehicles'] > $biggestN ) $biggestN = $coefficient['vehicles'];
			unset($coefficient);


			

			$transportArr[$winIds] = array('price' => $price, 'weightLeft' => $vehiclePerWeightLeft, 'palletsLeft' => $vehiclePerPalletsLeft, 'name' => $transport['name'], 'calcIt' => $calcIt);
			unset($transport);

		}

		if($this->inLimits($biggestN)) {
			// echo $biggestN;
			foreach($transportArr as $winIds => $params) {
				if($params['calcIt'] === false) continue;
				// echo $this->needUnload;
				$this->shuffleIt($params['price'], $params['weightLeft'], $params['palletsLeft'], $winIds);
			}
		} else {

			$minMaxCoeff = $bestPriceN['vehicles'] / $biggestN;
			$powerLimit = floor ($this->power * $minMaxCoeff);
			// power - 9, veh - 7 
			$transpDirtyN = $bestPriceN['vehicles'] - $powerLimit;
			$transpDirtyN = $transpDirtyN > 0 ? $transpDirtyN : 4;
			$transpDirtyN -= 1;
			$transpDirtyPrice = $bestPriceN['onePrice'] * $transpDirtyN;
			$transpDirtyWeight = $bestPriceN['weight'] * $transpDirtyN;
			$transpDirtyPallets = $bestPriceN['pallets'] * $transpDirtyN;
			$dirtyWinIds = implode(',', array_pad(array(), $transpDirtyN, $bestPriceN['id']));
			// echo $dirtyWinIds;

			foreach($transportArr as $winIds => $params) {
				$hasUnl = true;

				if($this->needUnload && ($bestPriceN['name'] != 'манипулятор' && $params['name'] != 'манипулятор')) {
					// $hasUnl = false;
					continue;
				}

				$this->shuffleIt(
					  $params['price'] + $transpDirtyPrice
					, $params['weightLeft'] - $transpDirtyWeight
					, $params['palletsLeft'] - $transpDirtyPallets
					, $dirtyWinIds . ','.$winIds,
					  $hasUnl
				);

				// echo $dirtyWinIds . ','.$winIds .'=='.($params['weightLeft'] - $transpDirtyWeight) . ','.($params['palletsLeft'] - $transpDirtyPallets) .','.$powerLimit. ','.$transpDirtyN. '||';
			}
		}

		// this->func
	}

	public function getPower($n, $power = 1) {
		if(pow($n, $power) > $this->combLimit) {
			$this->power = $power-1;
			return $this->power;
		}

		return $this->getPower($n, $power+1);
	}

	public function inLimits($vehiclesNumber) {
		$transpNumber = count($this->transports);

		return (pow($transpNumber, $vehiclesNumber) < $this->combLimit);
	}

	public function coefficient($transport) {
			$price = $transport['mcad'] * $this->road + $transport['rate'] + $this->additionPrice;
			$perWeight = ceil($this->cubicMetersWeight / $transport['capacity']);
			$perPallets = ceil($this->pallets / $transport['pallets']);
			$vehicles = $perWeight >= $perPallets ? $perWeight : $perPallets;

			return array('vehicles' => $vehicles, 'price' => $price*$vehicles, 'onePrice'=> $price, 'weight' => $transport['capacity'], 'pallets' => $transport['pallets'], 'id' => $transport['id'], 'name'=>$transport['name']);
	}

	public function shuffleIt($comnPrice = false, $weightLeft = false, $palletsLeft = false, $swinIds = '') {			

		foreach ($this->transports as $transport) {
			// if(!$hasUnl && $this->needUnload && ($transport['name'] != 'манипулятор')) {
			// 	continue;
			// }

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

			$this->shuffleIt($price, $vehiclePerWeightLeft, $vehiclePerPalletsLeft, $winIds);
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