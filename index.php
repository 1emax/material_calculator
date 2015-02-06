<?php
spl_autoload_register('my_autoload');

class Calc {
	protected $db = '';

	public function __construct() {
		$this->db = new DB();
	}

	public function showBlock($block, $tag) {
		$blockData = array();
		// echo 55555555;

		switch ($block) {
			case 'category':
				$blockData = $this->getCategories();
				break;
			
			default:
				break;
		}


		foreach($blockData as $val) {
			echo '<'.$tag.' id="'.$block.'-'.$val['id'].'">'.$val['name'].'</'.$tag.'>'."\n";
		}
		// $db->get($block, )
		// Блоки</option>
						// <option>Кирпич</option>
	}

	public function getCategories() {
		$db = $this->db;

		$db->select('DISTINCT pc.id,pc.name');		
		$db->table('product_category');
		$db->join('product_material', array('id'=>'category_id'), 'pc'); // could be third parameter like inner, left, right
		return $db->get();

	}

	public function getMaterials($id) {
		$db = $this->db;		
		$db->select('id,name');		
		$db->table('product_material');
		$db->where('manufacturer_id='.$id);
		return $db->get();		
	}

	public function getManufacturers($id) {
		$db = $this->db;		
		$db->select('DISTINCT man.id,man.name');		
		$db->table('manufacturer');
		$db->join('product_material', array('id'=>'manufacturer_id'), 'man');
		$db->where('product_material.id='.$id);
		return $db->get();
	}
}
























$Calc = new Calc();

function my_autoload($pClassName) {
    include(__DIR__ . '/' . strtolower($pClassName) . '.php');
}



if(basename($_SERVER['PHP_SELF']) == 'index.php') include 'index.html';






?>