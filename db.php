<?php

class DB {
	protected $host = 'mywat.mysql.ukraine.com.ua';
	protected $name = 'mywat_test';
	protected $user = 'mywat_test';
	protected $password = 'hmarmpzr';
	public $query = '';

	protected $PDO;

	public function __construct() {
		$dsn = 'mysql:dbname=' . $this->name . ';host='.$this->host. ';charset=utf8';
		$this->PDO = new PDO($dsn, $this->user, $this->password);
	}

	public function select($elems = '') {
		$this->query = 'SELECT ';

		if(is_array($elems)) {
			$this->query .= implode($elems, ',');
		} elseif ($elems != '') {
			$this->query .= $elems;
		} else {
			$this->query .= '*';
		}
	}

	public function table($name) {
		$this->table = $name;
		$this->query .= ' FROM ' . $name; 
	}

	public function join($jTable, $ON, $as = '', $joinParam = '') {
		$onStr = '';
		$asStr = $as == '' ? $as : ' as ' . $as; 
		$tablePref = $as == '' ? $this->table : $as;

		if (is_array($ON)) {
			foreach($ON as $param1 => $param2) {
				$onStr .= ' '.$tablePref.'.'.$param1.'='.$jTable.'.'.$param2;
			}
		} else {
			$onStr = $ON;
		}

		$this->query .=  implode(array('',$asStr,'', $joinParam,'JOIN', $jTable, 'ON', $onStr), ' ');
	}

	public function where($subQ) {
		$this->query .= ' WHERE ' . $subQ;
	}

	public function get(){
		$this->clear();
		// echo $this->query;
		return $this->PDO->query($this->query)->fetchAll(PDO::FETCH_ASSOC);
	}

	public function clear() {
		$this->table = '';
	}

	public function concatStr() {

	}
}

?>