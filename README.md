# TicTacToe

## Resumo do projeto

Este projeto é uma aplicação web para jogar o clássico jogo da velha (game of old) com websockets.

Os usuários logam na aplicação e são redirecionados para um lobby geral. Um jogador livre pode desafiar somente todo e qualquer outro jogador livre, sendo que este tem a possibilidade de recusar o convite. Caso o convidado aceite o convite, os dois jogadores serão redirecionados para uma sala separada onde o jogo da velha será inicializado. Durante o jogo, há possibilidade vitória, derrota e impate, sendo que ambos os jogadores serão avisados da situação final do jogo. Após o final do jogo, os jogadores podem jogar outra partida entre si ou retornarem ao lobby. 

## Funcionamento do projeto

Para o funcionamento pleno do projeto, é necessário:

<ul>
<li> Instalar o Node.js e suas dependências: <ul>
  <li> <b>Android SDK </b></li>
  <li> <b>JAVA SDK</b></li>
  <li><b>advanced-http</b></li>
  <li> <b>plugin-file</b></li>
  <li> <b>qrscanner</b></li>
  <li> <b>sqlite-storage</b></li> </ul> </li>
<li> Instalar o Node.js e suas dependências: <ul>
  <li><b>cors</b></li>
  <li><b>express</b></li>
  <li><b>method-override</b></li>
  <li><b>sqlite</b></li>
  <li><b>sqlite3</b></li> </ul> </li>
<li> Adicionar na pasta do projeto uma pasta "db" para que os esquemas e tabelas do projeto sejam executados (lembre-se de comentar as funções de banco após a população". </li>
<li> Para popular o banco de dados basta descomentar as funções "createTables", "insertProducts" e "insertClients". </li>
<li> Para as requisições, é necessário substituir o endereço IP do "index.js" pelo seu endereço IPV6 da sua máquina. </li>
  </ul>
