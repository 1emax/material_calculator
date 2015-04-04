<?php

include(__DIR__ . '/index.php');

 $db = new DB();
$db->query = "SELECT value FROM `settings` where name='email'";
$dbRes = $db->get();
$adminEmail = current($dbRes);

$to = $adminEmail['value'];

if(!$_POST['table'] || $_POST['table'] == '') exit;

$subject = 'Новый заказ';
$_POST['req-email'] = 'info@proffstroygroup.ru';

date_default_timezone_set('Europe/Moscow');


$headers = "From: " . strip_tags($_POST['req-email']) . "\r\n";
$headers .= "Reply-To: ". strip_tags($_POST['req-email']) . "\r\n";
// $headers .= "CC: susan@example.com\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";

$message = '<html><head><style type="text/css">
table { border-collapse: collapse; }
tr td, tr th { border: solid thin; }
</style></head><body>';
$message .= '<h1>Новый заказ!</h1>';
$message .= '<table>
<tr><td><strong>Менеджер</strong></td><td>'.$_POST['manager_name'].'</td></tr>
<tr><td><strong>Дата и время заявки</strong></td><td>'.date("d m Y H:i:s").'</td></tr>
<tr><td><strong>Дата предоплаты/доставки/самовывоза</strong></td><td>'.$_POST['pay_deliv_pickup'].'</td></tr>
<tr><td><strong>ФИО</strong></td><td>'.$_POST['l_n_p'].'</td></tr>';
if(isset($_POST['company_name']) && $_POST['company_name'] != '') $message .= '<tr><td><strong>Компания</strong></td><td>'.$_POST['company_name'].'</td></tr>';

$message .= '<tr><td><strong>Телефон</strong></td><td>'.$_POST['phone_number'].'</td></tr>
<tr><td><strong>E-mail</strong></td><td>'.$_POST['email'].'</td></tr>
<tr><td><strong>Форма оплаты</strong></td><td>'.$_POST['payment_type'].'</td></tr>
<tr><td><strong>Способ доставки</strong></td><td>'.$_POST['delivery_type'].'</td></tr>
<tr><td><strong>Шоссе</strong></td><td>'.$_POST['highway'].'</td></tr>
<tr><td><strong>Км от МКАД</strong></td><td>'.$_POST['km2mcad'].'</td></tr>';
if(isset($_POST['moskow_way']) && $_POST['moskow_way'] != '') $message .=  '<tr><td><strong>Заезд в Москву</strong></td><td>'.$_POST['moskow_way'].'</td></tr>';
$message .= '<tr><td><strong>Адрес доставки</strong></td><td>'.$_POST['deliv_address'].'</td></tr>
</table>';

$message .= '<br><br>' . $_POST['table'];
if(isset($_POST['comment']) && $_POST['comment'] != '') $message .= '<br><br> Коментарий к заказу: ' . $_POST['comment'];
$message .= '</body></html>';
$message = str_replace(array('<td','<th c', '<table'), array('<td style="border: solid thin;"', '<th style="border: solid thin;" c', '<table style="border-collapse: collapse;"'), $message);
echo $message;

// echo $message;

mail($to, $subject, $message, $headers);

?>